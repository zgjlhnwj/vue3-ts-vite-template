# vue3-ts-vite-template
## 项目简介
基于 Vue 3 + TypeScript + Vite 的前端开发模板，集成常用开发工具链，支持类型检查、代码规范、样式预处理等功能，适用于中后台管理系统或移动端项目开发。

## 技术栈架构
### 核心框架
- Vue 3 ：采用 Composition API 和 <script setup> 语法糖，提升组件逻辑复用性与代码可维护性 `package.json` 。
- Vue Router ：路由管理，支持动态路由与路由守卫 `package.json` 。
### 构建工具
- Vite ：新一代前端构建工具，基于 ESBuild 预构建，提供快速冷启动与热更新能力 `vite.config.ts` 。
### 类型检查
- TypeScript ：严格类型系统，提升代码健壮性，支持 .vue 文件类型推导 `tsconfig.json` 。
### 样式处理
- Sass ：CSS 预处理器，支持嵌套规则、变量、混合等特性 `package.json` 。
- PostCSS ：自动添加 CSS 前缀（ autoprefixer ），支持 px 转 rem （ postcss-pxtorem ）适配移动端 `vite.config.ts` 。
### 代码规范
- ESLint ：JavaScript/TypeScript 代码质量检查，集成 Vue 3 规则 `eslintrc.cjs` 。
- Prettier ：代码风格统一，与 ESLint 集成避免规则冲突 `prettier.config.cjs` 。
### 其他工具
- lodash-es ：实用工具函数库（ES 模块版本） `package.json` 。
- unplugin-auto-import ：自动导入 Vue/路由等 API，减少重复 import 代码 `vite.config.ts` 。

## 项目结构
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

## 运行命令
# 开发模式
npm run dev

# 构建生产包
npm run build

# 代码检查与修复
npm run lint

# 代码格式化
npm run format