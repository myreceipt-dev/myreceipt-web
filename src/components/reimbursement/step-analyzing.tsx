'use client'

import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useReimbursementStore } from '@/stores/reimbursement-store'
import { Sparkles, X, Brain, CheckCircle2, Loader2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// 思考步骤解析
// ---------------------------------------------------------------------------

interface ThinkingStep {
  title: string
  body: string
}

/**
 * 将 Gemini 的思考文本解析为结构化步骤。
 * Gemini 输出格式：**Step Title**\nDescription text...
 */
function parseThinkingSteps(raw: string): ThinkingStep[] {
  const parts = raw.split(/(\*\*[^*]+\*\*)/g)
  const steps: ThinkingStep[] = []

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith('**') && part.endsWith('**')) {
      const title = part.slice(2, -2).trim()
      const body =
        i + 1 < parts.length && !parts[i + 1].startsWith('**')
          ? parts[i + 1].trim()
          : ''
      if (title) {
        steps.push({ title, body })
      }
    }
  }

  return steps
}

// ---------------------------------------------------------------------------
// TypewriterText — 逐字打字动画
// ---------------------------------------------------------------------------

function TypewriterText({
  text,
  speed = 12,
  className,
  onReveal,
}: {
  text: string
  speed?: number
  className?: string
  onReveal?: () => void
}) {
  const [shown, setShown] = useState(0)
  const posRef = useRef(0)
  const prevRef = useRef('')

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = text

    if (!text.startsWith(prev)) {
      posRef.current = 0
      setShown(0)
    }

    const timer = setInterval(() => {
      posRef.current += 1
      setShown(posRef.current)
      onReveal?.()
      if (posRef.current >= text.length) {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, onReveal])

  const safeEnd = Math.min(shown, text.length)
  return <span className={className}>{text.slice(0, safeEnd)}</span>
}

// ---------------------------------------------------------------------------
// ThinkingPanel — 结构化展示 AI 思考过程
// ---------------------------------------------------------------------------

function ThinkingPanel() {
  const { thinkingContent } = useReimbursementStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  const steps = useMemo(() => parseThinkingSteps(thinkingContent), [thinkingContent])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  // SSE chunk 到达时滚动
  useEffect(() => {
    scrollToBottom()
  }, [thinkingContent, scrollToBottom])

  if (steps.length === 0) return null

  return (
    <details className="group w-full max-w-lg" open>
      <summary className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors select-none">
        <Brain className="h-4 w-4" />
        <span>AI 思考过程</span>
        <span className="ml-auto text-xs text-muted-foreground/60 tabular-nums">
          {steps.length} 步
        </span>
      </summary>

      <div
        className="mt-3 max-h-72 overflow-y-auto rounded-xl border bg-card/50 p-4"
      >
        <div className="relative pl-6">
          {/* 时间线 */}
          <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />

          <ol className="space-y-3">
            {steps.map((step, i) => {
              const isLatest = i === steps.length - 1
              const isPrev = i === steps.length - 2
              return (
                <li
                  key={i}
                  className="relative animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  {/* 时间线节点 */}
                  <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center">
                    {isLatest ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </span>

                  {/* 步骤卡片 */}
                  <div
                    className={
                      isLatest
                        ? 'rounded-lg bg-primary/5 border border-primary/20 p-2.5'
                        : 'rounded-lg p-2.5'
                    }
                  >
                    <p className="text-sm font-semibold leading-snug">
                      {isLatest || (isPrev && !step.body) ? (
                        <TypewriterText text={step.title} speed={15} onReveal={scrollToBottom} />
                      ) : (
                        step.title
                      )}
                    </p>
                    {step.body && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {isLatest ? (
                          <TypewriterText text={step.body} speed={8} onReveal={scrollToBottom} />
                        ) : (
                          step.body.length > 120
                            ? step.body.slice(0, 120) + '…'
                            : step.body
                        )}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>

          {/* 底部哨兵 — 每次 thinkingContent 变化时自动滚入视野 */}
          <div ref={bottomRef} />
        </div>
      </div>
    </details>
  )
}

function AnalyzingAnimation() {
  const { cancelAnalyze } = useReimbursementStore()

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
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

      {/* ---- AI 思考面板 ---- */}
      <ThinkingPanel />

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
