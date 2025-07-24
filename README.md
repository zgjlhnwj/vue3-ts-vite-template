# vue3-ts-vite-template

## 一、项目简介
基于 Vue 3 + TypeScript + Vite 的前端开发模板，集成常用开发工具链（类型检查、代码规范、样式预处理等），适用于中后台管理系统或移动端项目开发。

## 二、技术栈
### 2.1 核心框架
- Vue 3（Composition API + `<script setup>` 语法糖）
- Vue Router（路由管理，支持动态路由与守卫）

### 2.2 构建工具
- Vite（ESBuild 预构建，快速冷启动与热更新）

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
- unplugin-auto-import（自动导入 Vue/路由等 API）

## 三、项目结构
vue3-ts-vite-template/
├── src/
│   ├── hooks/          # 自定义 Hooks
│   ├── view/           # 页面组件（如课堂场景页面）
│   ├── components/     # 通用组件（待扩展）
│   ├── assets/         # 静态资源（样式、图标等）
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── .gitignore          # Git 忽略配置
├── package.json        # 依赖与脚本配置
├── vite.config.ts      # Vite 构建配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 项目说明文档


## 四、运行命令
| 命令               | 说明                 |
|--------------------|----------------------|
| `npm run dev`      | 开发模式（热更新）   |
| `npm run build`    | 构建生产包           |
| `npm run lint`     | 代码检查与修复       |
| `npm run format`   | 代码格式化           |