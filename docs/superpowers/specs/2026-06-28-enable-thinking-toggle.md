# Enable Thinking Toggle — AI 思考过程开关

## 概述

在报销单分析页面上新增一个开关，让用户控制是否开启 AI 思考过程。开启后调用 v2 流式 API，实时展示 AI 推理步骤。

## 数据流

```
Switch toggle → store.enableThinking
  → 用户点击「开始分析」
  → store.analyze() 读取 enableThinking
     ├─ ON  → 调用流式 API（SSE），enableThinking: true
     │        → SSE thinking 事件 → thinkingContent 累积
     │        → ThinkingPanel 实时展示
     │        → SSE result 事件 → analysisResult → step 3
     └─ OFF → 调用现有同步 API（行为不变）
```

## API 路由

| mode   | thinking OFF              | thinking ON                              |
|--------|---------------------------|------------------------------------------|
| manual | POST /analyze (sync)      | POST /analyze-stream + enableThinking    |
| zip    | POST /auto-analyze-v2     | POST /auto-analyze-stream-v2 + enableThinking |

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/components/ui/switch.tsx` | 新增 Switch 组件 |
| `src/api/modules/reimbursement.ts` | `analyzeReimbursementStream()` 增加 enableThinking 参数；新增 `autoAnalyzeStreamV2()` |
| `src/stores/reimbursement-store.ts` | 新增 `enableThinking` 状态 + setter；`analyze()` 分流式/同步路径 |
| `src/components/reimbursement/step-upload.tsx` | 新增 Switch UI |

## UI 设计

在 StepUpload 的「开始分析」按钮上方添加一行带 Switch 的卡片：

- Brain 图标 + "AI 思考过程" 标题
- 副标题："开启后实时展示 AI 的推理步骤，分析耗时可能略长"
- 默认关闭
