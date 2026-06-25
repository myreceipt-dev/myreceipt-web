'use client'

import { Button } from '@/components/ui/button'
import { useReimbursementStore } from '@/stores/reimbursement-store'
import { Sparkles, X } from 'lucide-react'

function AnalyzingAnimation() {
  const { cancelAnalyze } = useReimbursementStore()

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-20">
      {/* ---- 图标区域 ---- */}
      <div className="relative flex items-center justify-center">
        {/* 同心圆波纹 */}
        <span
          className="absolute h-24 w-24 rounded-full bg-primary/20"
          style={{
            animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <span
          className="absolute h-24 w-24 rounded-full bg-primary/15"
          style={{
            animation:
              'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.6s',
          }}
        />
        <span
          className="absolute h-24 w-24 rounded-full bg-primary/10"
          style={{
            animation:
              'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1.2s',
          }}
        />

        {/* 轨道粒子 */}
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/60"
            style={{
              animation: `orbit 3s linear infinite ${i * 1}s`,
            }}
          />
        ))}

        {/* 中央图标 */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
          <Sparkles className="h-10 w-10 text-primary-foreground" />

          {/* 扫描线 */}
          <span
            className="absolute inset-x-2 h-0.5 rounded-full bg-white/60 blur-[1px]"
            style={{ animation: 'scan 2s ease-in-out infinite' }}
          />
        </div>
      </div>

      {/* ---- 文字 + 动态点点 ---- */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold tracking-wide">
          AI 正在识别支付凭证截图、发票信息
          <span
            className="inline-block ml-0.5"
            style={{ animation: 'typing-dot 1.4s ease-in-out infinite' }}
          >
            .
          </span>
          <span
            className="inline-block"
            style={{ animation: 'typing-dot 1.4s ease-in-out infinite 0.2s' }}
          >
            .
          </span>
          <span
            className="inline-block"
            style={{ animation: 'typing-dot 1.4s ease-in-out infinite 0.4s' }}
          >
            .
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          这可能需要几秒到几十秒，请耐心等待
        </p>
      </div>

      {/* ---- 渐变进度条 ---- */}
      <div className="w-72 overflow-hidden rounded-full bg-muted">
        <div
          className="h-1.5 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, var(--primary) 0%, var(--chart-1) 25%, var(--primary) 50%, var(--chart-1) 75%, var(--primary) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer-bar 2s linear infinite',
            width: '100%',
          }}
        />
      </div>

      {/* ---- 浮动粒子 ---- */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary/50"
            style={{
              animation: `float-particle 2s ease-in-out infinite ${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* ---- 取消按钮 ---- */}
      <Button variant="ghost" size="sm" onClick={cancelAnalyze}>
        <X className="h-4 w-4 mr-1" />
        取消分析
      </Button>
    </div>
  )
}

export function StepAnalyzing() {
  const { error, analyze, reset } = useReimbursementStore()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-3xl">!</span>
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-medium">分析失败</p>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={reset}>
            重新上传
          </Button>
          <Button onClick={() => analyze()}>重试</Button>
        </div>
      </div>
    )
  }

  return <AnalyzingAnimation />
}
