import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite' // 新增

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 自动导入配置
    AutoImport({
      // 目标文件（默认扫描src下的所有ts/tsx/vue文件）
      include: [/\.(ts|tsx|vue)$/],
      // 需自动导入的库（可扩展其他库如vue-router）
      imports: [
        'vue', // 自动导入vue的所有API（如ref、reactive、onMounted等）
        'vue-router', // 自动导入vue-router的所有API（如useRouter、useRoute等）
      ],
      // 生成类型声明文件（解决TS类型提示）
      dts: 'src/auto-imports.d.ts', // 自动生成的类型声明路径
      // 自定义导入别名（可选）
      // resolvers: [/* 自定义解析器 */]
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-pxtorem')({
          rootValue: 16,
          propList: ['*'],
          exclude: /node_modules/i,
        }),
      ],
    },
    preprocessorOptions: {
      scss: {
        // 自动导入基础变量和工具类
        additionalData: `
          @use "@/assets/styles/variables.scss" as *;
          @use "@/assets/styles/mixins.scss" as *;
        `,
      },
    },
  },
})
