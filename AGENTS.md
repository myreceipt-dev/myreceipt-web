<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Backend API Docs

文档位于同级目录 `../myreceipt-web-api/docs/api/`，入口 `README.md`，按模块分 `auth/`、`users/`、`reimbursement/`。

**统一响应格式:** `{ code, data, msg }` — 成功 code 为 `0` 或 `200`，错误为 HTTP 状态码。认证方式: Session + Cookie (`mrsid`)。

### Auth (`/auth/*`)
| 接口 | 认证 | 说明 |
|------|------|------|
| POST `/auth/register` | 否 | 注册 (username+email+password)，自动登录 |
| POST `/auth/login` | 否 | 登录 (username 支持邮箱) |
| POST `/auth/logout` | 是 | 登出 |
| POST `/auth/forgot-password` | 否 | 发送6位验证码到邮箱, 10分钟有效, 1分钟限频 |
| POST `/auth/reset-password` | 否 | 验证码+新密码→重置, 最多5次错误尝试 |
| GET `/auth/me` | 是 | 获取当前用户 |

### Users (`/user/*`)
| 接口 | 认证 | 说明 |
|------|------|------|
| GET/PUT `/user/settings` | 是 | AI 设置 (Gemini model/key) |
| PUT `/user/password` | 是 | 修改密码 (需当前密码) |

### Reimbursement (`/reimbursement/*`)
| 接口 | 认证 | 说明 |
|------|------|------|
| POST `/reimbursement/analyze` | 否 | AI 联合解析 (图片+Excel模板) |
| POST `/reimbursement/parse` | 否 | AI 解析+Excel 导出一步到位 |
| POST `/reimbursement/export` | 否 | Wasm 无损导出 |
| POST `/reimbursement/auto-analyze` | 否 | AI 解析 Zip 包 |
| POST `/reimbursement/auto-export` | 否 | 结构化数据+Zip→输出Zip |
| POST `/reimbursement/auto-parse` | 否 | auto-analyze+auto-export 一步到位 |
| POST `/reimbursement/analyze-stream` | 否 | 🔥 SSE 流式解析 (图片+模板)，含 AI 思考过程 |
| POST `/reimbursement/auto-analyze-stream` | 否 | 🔥 SSE 流式解析 Zip 包，含 AI 思考过程 |

流式端点 (`*-stream`) 返回 `text/event-stream`（SSE），事件类型：
- `thinking` — AI 推理过程文本（Gemini thought blocks），前端展示为结构化步骤
- `progress` — 最终 JSON 的流式片段
- `result` — 完整分析结果 JSON（后处理完成）
- `error` — 错误信息

### 前端架构要点

**Thinking 面板** (`src/components/reimbursement/step-analyzing.tsx`):
- 解析 SSE `thinking` 事件的 `**Title**` 格式，拆分为结构化步骤列表
- 时间线 UI：已完成步骤 → 绿色 ✓，当前步骤 → 旋转 Spinner + 蓝色卡片
- 最新步骤标题/正文使用 TypewriterText 逐字打字动画（12-15ms/字）
- 新 chunk 到达时自动判断接续还是新步骤，打字机从断点继续

**SSE 消费** (`src/api/modules/reimbursement.ts`):
- `analyzeReimbursementStream()` / `autoAnalyzeStream()` 使用 `fetch()` + `ReadableStream`
- 按 `\n\n` 分割 SSE 事件，聚合多行 `data:` 为完整数据后回调
- 支持 AbortController 取消

**Store** (`src/stores/reimbursement-store.ts`):
- `thinkingContent` 状态字段累积所有 thinking 文本
- `analyze()` action 内部按 mode 自动选择流式或同步 API
- `cancelAnalyze()` 触发 AbortController → 中断 fetch + reader
