# BG Remover — MVP 需求文档

**版本:** v0.1  
**日期:** 2026-03-16  
**状态:** 草稿

---

## 1. 产品概述

### 1.1 产品定位

一个面向全球用户的在线图片背景去除工具，用户上传图片后自动去除背景，下载透明 PNG。

**目标关键词:** `image background remover`（月搜索量 ~1M+）

### 1.2 核心价值

- 免费、快速、无需注册
- 图片不存储，保护用户隐私
- 支持任意图片类型（人像、商品、宠物等）

### 1.3 目标用户

| 用户群 | 场景 |
|--------|------|
| 电商卖家 | 商品图去背景，制作白底图 |
| 设计师 | 快速抠图，节省 PS 时间 |
| 普通用户 | 证件照换底色、头像制作 |
| 内容创作者 | 社交媒体素材处理 |

---

## 2. 技术架构

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端 | Next.js 16 + Tailwind CSS v4 | App Router，Edge-ready |
| API | Next.js Route Handler (Edge Runtime) | 服务端调用，隐藏 API Key |
| 去背景引擎 | Remove.bg API | 精度高，支持多场景 |
| 部署 | Cloudflare Pages + Edge Functions | 全球 CDN，低延迟 |
| 存储 | 无 | 图片全内存处理，不落地 |

---

## 3. MVP 功能范围

### 3.1 核心功能（必须上线）

#### F1 — 图片上传
- 支持点击选择文件
- 支持拖拽上传
- 支持格式：JPG、PNG、WebP
- 文件大小限制：≤ 10MB
- 上传后立即触发处理，无需额外点击

#### F2 — 背景去除
- 调用 Remove.bg API 处理
- 处理中显示 loading 动画 + 原图预览
- 处理时间目标：< 5s（取决于 Remove.bg 响应）

#### F3 — 结果预览
- 棋盘格背景展示透明区域
- 按住"Hold to compare"按钮可对比原图
- 结果图居中展示，最大高度 500px

#### F4 — 下载
- 下载格式：PNG（透明背景）
- 文件名：`原文件名-no-bg.png`
- 点击下载按钮直接触发浏览器下载

#### F5 — 错误处理
- 文件格式不支持 → 提示错误
- 文件过大 → 提示错误
- API 调用失败 → 显示错误信息 + 重试按钮
- API Key 未配置 → 500 错误

#### F6 — 重置
- 处理完成后提供"Try Another"按钮
- 点击后回到初始上传状态

### 3.2 非功能需求

| 指标 | 目标 |
|------|------|
| 首屏加载 | < 2s（Cloudflare CDN） |
| 移动端适配 | 响应式，支持手机上传 |
| SEO | 完整 meta/og 标签，语义化 HTML |
| 隐私 | 图片不存储，不记录用户数据 |
| 安全 | API Key 仅服务端可见，不暴露前端 |

### 3.3 MVP 不包含（后续迭代）

- 用户注册 / 登录
- 历史记录
- 批量处理
- 背景替换（换颜色 / 换图片）
- 积分 / 付费墙
- 多语言

---

## 4. 页面设计

### 4.1 唯一页面：首页 `/`

**状态机：**

```
idle → loading → done
                ↓
              error
```

| 状态 | 展示内容 |
|------|----------|
| idle | 上传区域（拖拽框）+ 功能介绍卡片 |
| loading | 转圈动画 + 原图半透明预览 |
| done | 结果图 + 下载按钮 + Try Another |
| error | 错误信息 + Try Again 按钮 |

### 4.2 视觉风格

- 深色主题（slate-900 + purple 渐变）
- 简洁，突出上传区域
- 无多余导航，单一操作路径

---

## 5. API 设计

### POST `/api/remove-bg`

**Runtime:** Edge

**Request:**
```
Content-Type: multipart/form-data
Body: image (File)
```

**Response (成功):**
```
Content-Type: image/png
Body: 透明背景图片二进制
```

**Response (失败):**
```json
{ "error": "错误描述" }
```

**错误码：**

| HTTP 状态 | 原因 |
|-----------|------|
| 400 | 未上传文件 / 文件过大 |
| 500 | API Key 未配置 |
| 4xx/5xx | Remove.bg API 返回错误（透传） |

---

## 6. 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `REMOVE_BG_API_KEY` | Remove.bg API Key | ✅ |

---

## 7. 部署流程

```bash
# 本地开发
cp .env.example .env.local
# 填入 REMOVE_BG_API_KEY
npm run dev

# 部署到 Cloudflare Pages
npm run deploy
# 首次需要 wrangler login

# Cloudflare Dashboard 配置环境变量
# Pages → 项目 → Settings → Environment Variables
# 添加 REMOVE_BG_API_KEY
```

---

## 8. 成功指标（MVP 验证）

| 指标 | 目标（上线后 30 天） |
|------|---------------------|
| 日活用户 | > 100 |
| 处理成功率 | > 95% |
| 平均处理时长 | < 5s |
| 用户自然搜索占比 | > 30% |

---

## 9. 后续迭代方向

1. **批量处理** — 最高频用户需求，电商场景刚需
2. **背景替换** — 上传完成后可选换背景色/图
3. **付费墙** — 免费处理低分辨率，高清下载收费
4. **API 服务** — 对外提供 REST API，面向开发者
