import { create } from "zustand";
import {
  analyzeReimbursement,
  autoAnalyze,
  exportReimbursement,
  autoExport,
  type ReimbursementAnalysis,
  type ZipAnalysisOutput,
} from "@/api/modules/reimbursement";

interface ReimbursementState {
  step: 1 | 2 | 3 | 4;
  mode: "manual" | "zip";

  // uploaded files
  images: File[];
  template: File | null;
  zipfile: File | null;

  // analysis
  analysisResult: ReimbursementAnalysis | ZipAnalysisOutput | null;
  error: string | null;
  analyzing: boolean;
  exporting: boolean;

  // streaming thinking content
  thinkingContent: string;

  // internal: AbortController for cancellation
  _abortController: AbortController | null;

  // actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setMode: (mode: "manual" | "zip") => void;
  setImages: (images: File[]) => void;
  setTemplate: (template: File | null) => void;
  setZipfile: (zipfile: File | null) => void;

  analyze: (geminiApiKey?: string, model?: string) => Promise<void>;
  cancelAnalyze: () => void;
  downloadResult: () => Promise<void>;
  reset: () => void;
}

export const useReimbursementStore = create<ReimbursementState>((set, get) => ({
  step: 1,
  mode: "zip",
  images: [],
  template: null,
  zipfile: null,
  analysisResult: null,
  error: null,
  analyzing: false,
  exporting: false,
  thinkingContent: "",
  _abortController: null,

  setStep: (step) => set({ step }),
  setMode: (mode) => set({ mode }),
  setImages: (images) => set({ images }),
  setTemplate: (template) => set({ template }),
  setZipfile: (zipfile) => set({ zipfile }),

  async analyze(geminiApiKey?, model?) {
    const { mode, images, template, zipfile, _abortController: prev } = get();
    // Abort any in-flight request
    prev?.abort();

    const controller = new AbortController();
    set({
      step: 2,
      error: null,
      analyzing: true,
      thinkingContent: "",
      _abortController: controller,
    });

    try {
      if (mode === "manual") {
        if (!template) throw new Error("请上传模板文件");
        if (images.length === 0) throw new Error("请上传支付凭证截图 / 发票图片");
        const result = await analyzeReimbursement(
          images,
          template,
          controller.signal,
        );
        set({
          analysisResult: result,
          step: 3,
          analyzing: false,
          _abortController: null,
        });
      } else {
        if (!zipfile) throw new Error("请上传 ZIP 文件");
        const result = await autoAnalyze(
          zipfile,
          geminiApiKey,
          model,
          controller.signal,
        );
        set({
          analysisResult: result,
          step: 3,
          analyzing: false,
          _abortController: null,
        });
      }
    } catch (err) {
      // If aborted, just go back to upload step silently
      if (controller.signal.aborted) {
        set({ step: 1, analyzing: false, _abortController: null });
        return;
      }
      const message = err instanceof Error ? err.message : "分析失败";
      set({ error: message, analyzing: false, _abortController: null });
    }
  },

  cancelAnalyze() {
    const { _abortController } = get();
    _abortController?.abort();
  },

  async downloadResult() {
    const { mode, template, zipfile, analysisResult } = get();
    if (!analysisResult) return;
    set({ error: null, exporting: true });

    try {
      let blob: Blob;
      let filename: string;

      if (mode === "manual") {
        if (!template) throw new Error("缺少模板文件");
        blob = await exportReimbursement(template, analysisResult as ReimbursementAnalysis);
        filename = "报销单.xlsx";
      } else {
        if (!zipfile) throw new Error("缺少 ZIP 文件");
        blob = await autoExport(zipfile, analysisResult as ZipAnalysisOutput);
        filename = "报销单.zip";
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      set({ step: 4, exporting: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "导出失败";
      set({ error: message, step: 3, exporting: false });
    }
  },

  reset: () => {
    get()._abortController?.abort();
    set({
      step: 1,
      images: [],
      template: null,
      zipfile: null,
      analysisResult: null,
      error: null,
      analyzing: false,
      exporting: false,
      thinkingContent: "",
      _abortController: null,
    });
  },
}));
