# myreceipt-web

MyReceipt 报销单智能识别前端项目。支持上传支付凭证截图 / 发票图片 + Excel 模板，通过 AI 自动识别并生成结构化报销数据，支持在线编辑校验后导出。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 数据请求 | @tanstack/react-query |
| 状态管理 | zustand |
| UI 组件库 | Shadcn UI（Radix UI） |
| HTTP 客户端 | ofetch |
| 文件上传 | react-dropzone |
| 样式方案 | Tailwind CSS |
| 包管理器 | pnpm |

## 快速开始

```bash
pnpm install      # 安装依赖
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
```

## 目录结构

```
src/
├── app/                        # Next.js App Router
│   ├── globals.css             # 全局样式 + Shadcn CSS 变量
│   └── layout.tsx              # 根布局
├── api/
│   ├── request.ts              # ofetch 实例、请求封装
│   ├── interfaces/
│   │   └── reimbursement.ts    # 报销相关类型定义
│   └── modules/
│       ├── auth.ts             # 认证 API
│       ├── reimbursement.ts    # 报销分析/导出 API
│       └── user.ts             # 用户 API
├── components/
│   ├── providers.tsx           # QueryClientProvider
│   ├── ui/                     # Shadcn UI 组件（table, input, button, dialog 等）
│   └── reimbursement/          # 报销流程组件
│       ├── step-indicator.tsx  # 步骤指示器
│       ├── step-upload.tsx     # 步骤1: 上传文件
│       ├── step-analyzing.tsx  # 步骤2: 分析中
│       ├── step-review.tsx     # 步骤3: 数据预览与编辑
│       ├── step-download.tsx   # 步骤4: 导出下载
│       ├── analysis-table.tsx  # Excel 数据预览表格
│       ├── file-analysis-card.tsx  # ZIP 模式文件分析卡片
│       └── file-upload-zone.tsx    # 文件拖拽上传区域
├── hooks/                      # 自定义 hooks
├── stores/
│   └── reimbursement-store.ts  # 报销流程 Zustand store
├── lib/
│   └── api.ts                  # API 基础配置
└── utils/
    └── cn.ts                   # className 合并工具
```

## 核心数据流

### 报销流程（4 个步骤）

```
步骤1: 上传文件 (step-upload)
  → 手动模式: 上传截图/发票 + 模板
  → ZIP 模式: 上传包含凭证和发票的 ZIP 包
  → 可选: Gemini API Key

步骤2: AI 分析 (step-analyzing)
  → 调用后端 SSE 流式 API，实时展示 AI 思考过程
  → Thinking 面板将 AI 推理拆分为结构化步骤，打字机动画逐字显示
  → 返回结构化报销数据 (ReimbursementAnalysis)

步骤3: 数据预览编辑 (step-review)
  → AnalysisTable: 可编辑的 Excel 数据预览
  → ZIP 模式额外显示金额校验结果
  → 支持: 单元格编辑、行插入、行删除、序号自动重编

步骤4: 导出下载 (step-download)
  → 手动模式: 导出 Excel (.xlsx)
  → ZIP 模式: 导出含重命名图片的 ZIP 包
```

### 状态管理

报销流程的状态由 `reimbursement-store.ts` 统一管理：

```typescript
interface ReimbursementState {
  step: 1 | 2 | 3 | 4           // 当前步骤
  mode: 'manual' | 'zip'        // 上传模式
  images: File[]                 // 上传的图片
  template: File | null          // Excel 模板
  zipfile: File | null           // ZIP 文件
  analysisResult: ReimbursementAnalysis | null  // 分析结果
  analyzing: boolean             // 是否正在分析
  thinkingContent: string        // AI 思考过程（SSE 流式累积）
  error: string | null           // 错误信息
}
```

### 核心类型

```typescript
interface ReimbursementAnalysis {
  headerRowIndex: number           // 表头所在行
  columnMapping: Record<string, string>  // 列名 → Excel 列映射
  rowsData: Record<string, unknown>[]    // 数据行
  dataStartRow: number             // 数据起始行号
  dataEndRow: number               // 数据结束行号
  summaryRowIndex: number          // 汇总行
  summaryColumns: string[]         // 汇总列
  dateFormat: string               // 日期格式
}

interface ZipAnalysisOutput extends ReimbursementAnalysis {
  fileAnalysis: FileAnalysisResult[]   // 文件分析结果
  amountValidations: AmountValidation[] // 金额校验结果
}
```

## AnalysisTable 功能

`analysis-table.tsx` 是数据预览编辑的核心组件：

| 功能 | 说明 |
|------|------|
| 日期列识别 | 自动检测列名含 `日期`、`时间`、`date` 等的列，渲染为 `<input type="date">` |
| 序号列识别 | 自动检测列名含 `序号`、`编号`、`No` 等的列，增删行时自动重编号 |
| 单元格编辑 | 点击单元格直接编辑，通过 `onChange` 回调同步到 store |
| 行插入 | 每行操作列有「新增」按钮，在当前行下方插入空行 |
| 行删除 | 每行操作列有「删除」按钮，点击弹出确认对话框 |
| 操作列固定 | 操作列使用 `sticky right-0` 固定在表格右侧 |

