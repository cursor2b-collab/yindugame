# Vercel 部署指南

## 快速开始

1. **安装 Vercel CLI**（可选）
   ```bash
   npm i -g vercel
   ```

2. **部署项目**
   ```bash
   vercel
   ```
   或者通过 [Vercel Dashboard](https://vercel.com) 导入 GitHub/GitLab/Bitbucket 仓库。

## 环境变量配置

在 Vercel Dashboard 中配置以下环境变量：

### 必需的环境变量

- `VITE_API_URL` - API 基础 URL（例如：`https://api.xpj66666.com/api`）

### 可选的环境变量

- `NODE_ENV` - 环境模式（生产环境会自动设置为 `production`）

## 配置说明

### vercel.json

配置文件包含以下设置：

- **构建命令**: `npm run build`
- **输出目录**: `build`（与 vite.config.ts 中的 outDir 一致）
- **路由重写**: 所有路由都重定向到 `index.html`（支持 React Router）
- **缓存策略**: 静态资源（JS、CSS、图片等）设置长期缓存

### 部署流程

1. Vercel 会自动检测到 `vercel.json` 配置文件
2. 运行 `npm install` 安装依赖
3. 运行 `npm run build` 构建项目
4. 将 `build` 目录部署到 Vercel CDN

## 注意事项

1. **后端服务器**: `server/index.js` 不会在 Vercel 上运行。如果需要后端 API，请：
   - 使用 Vercel Serverless Functions
   - 或单独部署后端到其他平台（如 Railway、Render 等）

2. **环境变量**: 确保在 Vercel Dashboard 中配置所有必需的环境变量

3. **构建输出**: 确保 `vite.config.ts` 中的 `outDir` 与 `vercel.json` 中的 `outputDirectory` 一致

## 自定义域名

在 Vercel Dashboard 中可以：
1. 添加自定义域名
2. 配置 SSL 证书（自动）
3. 设置 DNS 记录

## 故障排除

如果部署失败，检查：
1. 构建日志中的错误信息
2. 环境变量是否正确配置
3. `package.json` 中的构建脚本是否正确
4. Node.js 版本是否兼容（Vercel 默认使用 Node.js 18.x）
