import { request, unwrap, type ApiResponse } from "@/api/request";
import type {
  ReimbursementAnalysis,
  FileAnalysisResult,
  AmountValidation,
  ZipAnalysisOutput,
} from "@/api/interfaces/reimbursement";

export type {
  ReimbursementAnalysis,
  FileAnalysisResult,
  AmountValidation,
  ZipAnalysisOutput,
};

// ============================================================
// SSE 事件类型
// ============================================================

export interface StreamHandlers {
  onThinking?: (text: string) => void;
  onProgress?: (text: string) => void;
  onCancelled?: () => void;
}

// ============================================================
// Reimbursement API
// ============================================================

/** 分步上传：分析支付凭证截图 / 发票图片 + 模板，返回结构化数据 */
export async function analyzeReimbursement(
  images: File[],
  template: File,
  signal?: AbortSignal
) {
  const form = new FormData();
  images.forEach((img) => form.append("images", img));
  form.append("template", template);
  return unwrap(
    await request<ApiResponse<ReimbursementAnalysis>>("/reimbursement/analyze", {
      method: "POST",
      body: form,
      signal,
    })
  );
}

/** 分步上传：分析 + 导出一键完成，返回 Excel 文件 */
export async function parseReimbursement(
  images: File[],
  template: File,
  geminiApiKey?: string,
  model?: string
) {
  const form = new FormData();
  images.forEach((img) => form.append("images", img));
  form.append("template", template);
  if (geminiApiKey) form.append("geminiApiKey", geminiApiKey);
  if (model) form.append("model", model);
  return request("/reimbursement/parse", {
    method: "POST",
    body: form,
    responseType: "blob",
  });
}

/** ZIP 上传：解压并分析，返回结构化数据 */
export async function autoAnalyze(
  zipfile: File,
  geminiApiKey?: string,
  model?: string,
  signal?: AbortSignal
) {
  const form = new FormData();
  form.append("zipfile", zipfile);
  if (geminiApiKey) form.append("geminiApiKey", geminiApiKey);
  if (model) form.append("model", model);
  return unwrap(
    await request<ApiResponse<ZipAnalysisOutput>>("/reimbursement/auto-analyze", {
      method: "POST",
      body: form,
      signal,
    })
  );
}

/** ZIP 上传（V2 多轮对话）：解压并分析，文件多时更稳定 */
export async function autoAnalyzeV2(
  zipfile: File,
  geminiApiKey?: string,
  model?: string,
  signal?: AbortSignal
) {
  const form = new FormData();
  form.append("zipfile", zipfile);
  if (geminiApiKey) form.append("geminiApiKey", geminiApiKey);
  if (model) form.append("model", model);
  return unwrap(
    await request<ApiResponse<ZipAnalysisOutput>>("/reimbursement/auto-analyze-v2", {
      method: "POST",
      body: form,
      signal,
    })
  );
}

/** ZIP 上传：根据分析结果导出 Excel + 重命名图片，返回 ZIP */
export async function autoExport(zipfile: File, data: ZipAnalysisOutput) {
  const form = new FormData();
  form.append("zipfile", zipfile);
  form.append("data", JSON.stringify(data));
  return request("/reimbursement/auto-export", {
    method: "POST",
    body: form,
    responseType: "blob",
  });
}

/** ZIP 上传：分析 + 导出一键完成，返回 ZIP */
export async function autoParse(
  zipfile: File,
  geminiApiKey?: string,
  model?: string
) {
  const form = new FormData();
  form.append("zipfile", zipfile);
  if (geminiApiKey) form.append("geminiApiKey", geminiApiKey);
  if (model) form.append("model", model);
  return request("/reimbursement/auto-parse", {
    method: "POST",
    body: form,
    responseType: "blob",
  });
}

/** 根据已有分析数据 + 模板导出 Excel */
export async function exportReimbursement(
  template: File,
  data: ReimbursementAnalysis
) {
  const form = new FormData();
  form.append("template", template);
  form.append("data", JSON.stringify(data));
  return request("/reimbursement/export", {
    method: "POST",
    body: form,
    responseType: "blob",
  });
}

// ============================================================
// 流式 API（SSE）
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/**
 * 解析 SSE 文本流，按 event type 调度回调
 * 返回最终解析的 result 对象，或抛出错误
 */
async function consumeSSEStream<T>(
  response: Response,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`请求失败 (${response.status}): ${text}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("浏览器不支持流式读取");

  const decoder = new TextDecoder();
  let buffer = "";

  const checkAbort = () => {
    if (signal?.aborted) {
      reader.cancel();
      handlers.onCancelled?.();
      throw new DOMException("Aborted", "AbortError");
    }
  };

  while (true) {
    checkAbort();
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    let currentEvent = "";
    let currentData = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
        currentData = "";
      } else if (line.startsWith("data: ")) {
        // 支持多行 SSE data（thinking 文本含换行）
        currentData += (currentData ? "\n" : "") + line.slice(6);
      } else if (line === "" && currentEvent && currentData) {
        // 空行 = 事件结束
        if (currentEvent === "thinking") {
          handlers.onThinking?.(currentData);
        } else if (currentEvent === "progress") {
          handlers.onProgress?.(currentData);
        } else if (currentEvent === "result") {
          return JSON.parse(currentData) as T;
        } else if (currentEvent === "error") {
          let message = currentData;
          try {
            const err = JSON.parse(currentData);
            message = err.message || currentData;
          } catch {
            // 非 JSON 格式，直接用原文本
          }
          throw new Error(message);
        }
        currentEvent = "";
        currentData = "";
      }
    }
  }

  throw new Error("流在返回结果前意外结束");
}

/** 手动模式：流式分析（图片 + 模板） */
export async function analyzeReimbursementStream(
  images: File[],
  template: File,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<ReimbursementAnalysis> {
  const form = new FormData();
  images.forEach((img) => form.append("images", img));
  form.append("template", template);

  const response = await fetch(`${API_BASE}/reimbursement/analyze-stream`, {
    method: "POST",
    body: form,
    signal,
    credentials: "include",
    headers: { Accept: "text/event-stream" },
  });

  return consumeSSEStream<ReimbursementAnalysis>(response, handlers, signal);
}

/** ZIP 模式：流式分析（压缩包） */
export async function autoAnalyzeStream(
  zipfile: File,
  handlers: StreamHandlers,
  geminiApiKey?: string,
  model?: string,
  signal?: AbortSignal,
): Promise<ZipAnalysisOutput> {
  const form = new FormData();
  form.append("zipfile", zipfile);
  if (geminiApiKey) form.append("geminiApiKey", geminiApiKey);
  if (model) form.append("model", model);

  const response = await fetch(`${API_BASE}/reimbursement/auto-analyze-stream`, {
    method: "POST",
    body: form,
    signal,
    credentials: "include",
    headers: { Accept: "text/event-stream" },
  });

  return consumeSSEStream<ZipAnalysisOutput>(response, handlers, signal);
}
