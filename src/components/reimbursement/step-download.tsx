"use client";

import { useReimbursementStore } from "@/stores/reimbursement-store";
import { Button } from "@/components/ui/button";
import { FileDown, RotateCw, ArrowLeft } from "lucide-react";

export function StepDownload() {
  const { mode, analysisResult, setStep, downloadResult, reset } =
    useReimbursementStore();

  const isZip = mode === "zip";
  const dataCount =
    (analysisResult as { rowsData?: unknown[] })?.rowsData?.length || 0;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="text-5xl">✅</div>
      <div>
        <p className="text-xl font-semibold">处理完成</p>
        <p className="text-sm text-muted-foreground mt-1">
          已导出 {dataCount} 条数据记录
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={reset}>
          <RotateCw className="h-4 w-4 mr-1" /> 处理新的报销单
        </Button>
        <Button variant="outline" onClick={() => setStep(3)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> 返回预览编辑
        </Button>
        <Button onClick={downloadResult}>
          <FileDown className="h-4 w-4 mr-1" />
          重新下载{isZip ? " ZIP" : " Excel"}
        </Button>
      </div>
    </div>
  );
}
