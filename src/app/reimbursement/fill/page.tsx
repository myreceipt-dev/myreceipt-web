'use client'

import { useEffect } from 'react'
import { useReimbursementStore } from '@/stores/reimbursement-store'
import { StepUpload } from '@/components/reimbursement/step-upload'
import { StepAnalyzing } from '@/components/reimbursement/step-analyzing'
import { StepReview } from '@/components/reimbursement/step-review'
import { StepDownload } from '@/components/reimbursement/step-download'
import { StepIndicator } from '@/components/reimbursement/step-indicator'

const STEPS = [
  { index: 1, label: '上传模板与截图' },
  { index: 2, label: 'AI 分析' },
  { index: 3, label: '预览编辑' },
  { index: 4, label: '导出 Excel' },
]

export default function FillPage() {
  const { step, setMode, reset } = useReimbursementStore()

  useEffect(() => {
    setMode('manual')
    reset()
  }, [setMode, reset])

  return (
    <main className="mx-auto max-w-8xl px-4 py-8">
      {/* Step indicator */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">报销单填报</h2>
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Step content */}
      {step === 1 && <StepUpload mode="manual" />}
      {step === 2 && <StepAnalyzing />}
      {step === 3 && <StepReview />}
      {step === 4 && <StepDownload />}
    </main>
  )
}
