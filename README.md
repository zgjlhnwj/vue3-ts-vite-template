# vue3-ts-vite-template

## 一、项目简介
基于 Vue 3 + TypeScript + Vite 的前端开发模板，集成常用开发工具链（类型检查、代码规范、样式预处理、状态管理等），适用于中后台管理系统或移动端项目开发。

## 二、技术栈
### 2.1 核心框架
- Vue 3（Composition API + `<script setup>` 语法糖）
- Vue Router（路由管理，支持动态路由与守卫）
- Pinia（Vue 官方状态管理库，支持 TypeScript 类型推导）
- pinia-plugin-persistedstate（Pinia 持久化插件，支持状态自动存储到 localStorage）

### 2.2 构建工具
- Vite（ESBuild 预构建，快速冷启动与热更新）
- unplugin-auto-import（自动导入 Vue/路由/Pinia 等 API，减少重复 import 代码）

### 2.3 类型检查
- TypeScript（严格类型系统，支持 `.vue` 文件类型推导）

### 2.4 样式处理
- Sass（CSS 预处理器，支持嵌套规则、变量、混合）
- PostCSS（自动添加 CSS 前缀 + px 转 rem 适配移动端）

### 2.5 代码规范
- ESLint（JS/TS 代码质量检查，集成 Vue 3 规则）
- Prettier（代码风格统一，与 ESLint 无规则冲突）

### 2.6 其他工具
- lodash-es（ES 模块版本实用工具库）

## 三、项目结构
```
vue3-ts-vite-template/
├── .gitignore               # Git 忽略规则配置
├── .vscode/                  # VSCode 开发配置（如推荐插件）
│   └── extensions.json       # 推荐安装的扩展列表
├── README.md                 # 项目说明文档
├── eslintrc.cjs              # ESLint 代码检查配置
├── index.html                # 应用入口 HTML
├── package.json              # 依赖管理与脚本配置
├── pnpm-lock.yaml            # pnpm 依赖版本锁定文件
├── postcss.config.cjs        # PostCSS 样式处理配置
├── prettier.config.cjs       # Prettier 代码格式化配置
├── public/                   # 静态资源（构建时直接复制）
│   └── vite.svg              # Vite 图标
├── src/                      # 核心业务代码
│   ├── App.vue               # 根组件
│   ├── assets/               # 需构建处理的静态资源
│   │   ├── styles/           # 全局样式文件
│   │   └── vue.svg           # Vue 图标
│   ├── auto-imports.d.ts     # 自动导入 API 类型声明
│   ├── components/           # 通用组件（如按钮、表单）
│   ├── hooks/                # 自定义 Hooks（逻辑复用）
│   ├── main.scss             # 全局 SCSS 样式入口
│   ├── main.ts               # 应用入口文件
│   ├── router/               # 路由配置
│   │   └── index.ts          # 路由定义文件
│   ├── store/                # 状态管理（Pinia）
│   │   ├── index.ts          # Pinia 实例初始化
│   │   └── counter.ts        # 示例计数器状态
│   ├── view/                 # 页面级组件
│   │   └── classroom.vue     # 课堂场景页面
│   └── vite-env.d.ts         # Vite 环境变量类型声明
├── tsconfig.app.json         # TypeScript 应用配置
├── tsconfig.json             # TypeScript 全局配置
├── tsconfig.node.json        # TypeScript Node.js 配置
└── vite.config.ts            # Vite 构建配置
```

## 四、运行命令
| 命令               | 说明                 |
|--------------------|----------------------|
| `npm run dev`      | 开发模式（热更新）   |
| `npm run build`    | 构建生产包           |
| `npm run lint`     | 代码检查与修复       |
| `npm run format`   | 代码格式化           |
        