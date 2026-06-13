"use client";

import { useReimbursementStore } from "@/stores/reimbursement-store";
import { FileUploadZone } from "./file-upload-zone";
import { Button } from "@/components/ui/button";

const IMAGE_ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp"],
};

const EXCEL_ACCEPT = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

const ZIP_ACCEPT = {
  "application/zip": [".zip"],
};

interface StepUploadProps {
  mode: "manual" | "zip";
}

export function StepUpload({ mode }: StepUploadProps) {
  const {
    images,
    setImages,
    template,
    setTemplate,
    zipfile,
    setZipfile,
    analyze,
    error,
  } = useReimbursementStore();

  const canSubmit =
    (mode === "manual" && template && images.length > 0) ||
    (mode === "zip" && zipfile);

  return (
    <div className="space-y-6">

      {/* Panel: 分步上传 */}
      {mode === "manual" && (
        <div className="space-y-4">
          <FileUploadZone
            accept={EXCEL_ACCEPT}
            maxFiles={1}
            files={template ? [template] : []}
            onChange={(fs) => setTemplate(fs[0] || null)}
            label="上传 Excel 模板"
            hint="拖拽或点击上传 .xlsx 模板文件"
          />
          <FileUploadZone
            accept={IMAGE_ACCEPT}
            maxFiles={50}
            files={images}
            onChange={setImages}
            label="上传支付凭证截图 / 发票图片"
            hint="支持 jpg / png / webp / bmp，最多 50 张"
          />
        </div>
      )}

      {/* Panel: ZIP 上传 */}
      {mode === "zip" && (
        <div className="space-y-4">
          <FileUploadZone
            accept={ZIP_ACCEPT}
            maxFiles={1}
            files={zipfile ? [zipfile] : []}
            onChange={(fs) => setZipfile(fs[0] || null)}
            label="上传 ZIP 压缩包"
            hint="包含模板 .xlsx + 支付凭证截图 + 电子发票 PDF + 打车行程单 PDF 的 ZIP 文件"
          />
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => analyze()} disabled={!canSubmit} size="lg">
          开始分析
        </Button>
      </div>
    </div>
  );
}
