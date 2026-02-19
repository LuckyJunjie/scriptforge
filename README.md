# 🎬 ScriptForge - AI 互动剧本工具

> 让每个有想法的人，都能快速写出自己的互动故事

## 项目简介

AI 互动剧本工具是一个支持 AI 生成、剧情树编辑、多模型切换的互动剧本创作平台。

## 技术栈

### 当前版本 (v1.0 - Node.js + SQLite)
| 层级 | 技术 |
|------|------|
| 前端 | HTML + JavaScript (演示版) |
| 后端 | Node.js + Express |
| 数据库 | SQLite |
| AI | 模拟 API (可接入 GPT-4o/Claude) |

### 目标版本 (v2.0 - Vue 3 + Spring Boot)
| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Element Plus |
| 后端 | Spring Boot 3.x + Java 17 |
| 数据库 | MySQL 8.0 + Redis |
| AI | GPT-4o / Claude 3.5 / MiniMax |

## 功能特性

- 🎯 12 类预设配置 (类型/风格/结构/题材)
- 🤖 多模型 AI 切换
- ✍️ AI 协创 (续写/润色/检查)
- 🌲 可视化剧情树编辑
- 📱 移动端阅读器
- 🔗 独立链接分享
- 👥 运营后台

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/scriptforge.git
cd scriptforge
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务
npm start
```

服务启动后访问: http://localhost:3000

### 3. 使用演示版前端

直接用浏览器打开 `demo.html` 文件即可体验完整功能。

## 测试账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 可访问管理后台 |
| 创作者 | creator | creator123 | 可创建和编辑剧本 |
| 会员 | vipuser | vip123 | 高级用户 |
| 普通用户 | testuser | test123 | 基础用户 |

## API 接口

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/info | 获取用户信息 |
| GET | /api/auth/users | 获取用户列表 (admin) |

### 剧本接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/script/public | 获取公开剧本 |
| GET | /api/script | 获取用户剧本 |
| GET | /api/script/:id | 获取剧本详情 |
| POST | /api/script | 创建剧本 |
| PUT | /api/script/:id | 更新剧本 |
| DELETE | /api/script/:id | 删除剧本 |

### AI 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/ai/generate | AI 生成剧本 |
| POST | /api/ai/continue | AI 续写 |
| POST | /api/ai/polish | AI 润色 |
| POST | /api/ai/check | AI 检查 |

### 预设接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/presets | 获取预设配置 |
| GET | /api/presets/random-prompt | 随机灵感 |

### 管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/stats | 统计数据 |
| GET | /api/admin/users | 用户管理 |
| PUT | /api/admin/users/:id/role | 修改角色 |

## Docker 部署

### 1. 构建镜像

```bash
# 构建后端镜像
docker build -t scriptforge-backend ./backend

# 或使用 docker-compose 启动全部服务
docker-compose up -d
```

### 2. 启动服务

```bash
# 后端服务
docker run -d -p 3000:3000 scriptforge-backend

# 或启动全部 (后端 + Nginx)
docker-compose up -d
```

### 3. 访问服务

- 后端 API: http://localhost:3000
- 前端: http://localhost (需配置 Nginx)

## 本地开发

### 后端开发

```bash
cd backend
npm install
npm run dev  # 开发模式 (热重载)
```

### 前端开发 (Vue 3)

```bash
cd frontend
npm install
npm run dev  # 启动开发服务器
```

## 项目结构

```
scriptforge/
├── backend/                 # 后端服务
│   ├── server.js           # 主服务文件
│   ├── test/               # 测试文件
│   │   └── index.js        # API 测试套件
│   ├── package.json        # 依赖配置
│   ├── Dockerfile          # Docker 配置
│   └── scriptforge.db      # SQLite 数据库
│
├── frontend/               # Vue 3 前端 (v2.0)
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面视图
│   │   ├── stores/        # 状态管理
│   │   ├── router/        # 路由配置
│   │   └── types/         # TypeScript 类型
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                  # 开发文档
│   ├── phase1-7-*.md      # 各阶段报告
│   └── phase*-preview.html # 预览页面
│
├── demo.html              # 演示页面
├── index.html             # 旧版演示
├── docker-compose.yml     # Docker Compose 配置
├── nginx.conf             # Nginx 配置
└── README.md              # 本文件
```

## 开发计划

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 基础框架 + 用户系统 | ✅ 完成 |
| Phase 2 | 剧本 CRUD + 预设系统 | ✅ 完成 |
| Phase 3 | AI 核心 | ✅ 完成 |
| Phase 4 | 剧情树编辑器 | ✅ 完成 |
| Phase 5 | 阅读器 + 分享 | ✅ 完成 |
| Phase 6 | 运营后台 | ✅ 完成 |
| Phase 7 | 部署测试 | 🔄 进行中 |

## 运行测试

```bash
# 后端测试
cd backend
npm test
```

测试覆盖:
- ✅ 用户认证 (注册/登录/JWT)
- ✅ 剧本 CRUD
- ✅ AI 生成/续写/润色
- ✅ 管理员功能
- ✅ 权限控制

## 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| API 响应时间 | < 200ms | ~50ms |
| 页面加载 | < 2s | ~500ms |
| 并发用户 | 100+ | 待测试 |

## 许可证

MIT License

## 联系方式

- Email: support@scriptforge.app
- GitHub: https://github.com/your-repo/scriptforge
