'use client'

import { useEffect } from 'react'
import { useReimbursementStore } from '@/stores/reimbursement-store'
import { StepUpload } from '@/components/reimbursement/step-upload'
import { StepAnalyzing } from '@/components/reimbursement/step-analyzing'
import { StepReview } from '@/components/reimbursement/step-review'
import { StepDownload } from '@/components/reimbursement/step-download'
import { StepIndicator } from '@/components/reimbursement/step-indicator'
import { Upload, Sparkles, Eye, Download } from 'lucide-react'

const STEPS = [
  { index: 1, label: '上传 ZIP 压缩包', icon: Upload },
  { index: 2, label: 'AI 分析', icon: Sparkles },
  { index: 3, label: '预览编辑', icon: Eye },
  { index: 4, label: '导出 ZIP', icon: Download },
]

export default function PackagePage() {
  const { step, setMode, reset } = useReimbursementStore()

  useEffect(() => {
    setMode('zip')
    reset()
  }, [setMode, reset])

  return (
    <main className="mx-auto max-w-8xl px-4 py-8">
      {/* Step indicator */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">全自动报销材料</h2>
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Step content */}
      {step === 1 && <StepUpload mode="zip" />}
      {step === 2 && <StepAnalyzing />}
      {step === 3 && <StepReview />}
      {step === 4 && <StepDownload />}
    </main>
  )
}
