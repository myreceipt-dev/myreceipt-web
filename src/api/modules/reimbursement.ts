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
