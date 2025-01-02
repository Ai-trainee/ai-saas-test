# AI服务网站

这是一个基于Next.js构建的AI服务网站,通过无代码方式快速搭建。项目源自文章:[从0到1用AI做了个AI服务网站, 全程没写一行代码](https://mp.weixin.qq.com/s/eo5Ke_Plu_CBtlP6Fsn5tA)

## 功能特点

- 🚀 基于Next.js 13框架
- 🎨 使用Tailwind CSS构建现代UI
- 🔥 集成Supabase后端服务
- 🤖 GLM API提供AI能力
- 📱 响应式设计,支持多端适配

## 环境要求

- Node.js 16.x或更高版本
- npm/yarn/pnpm包管理器
- Supabase账号
- GLM API密钥

## 快速开始

### 1. 克隆项目

```bash
git clone <项目地址>
cd <项目目录>
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境变量

在项目根目录创建`.env.local`文件(不要将此文件提交到代码库),添加以下配置:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
NEXT_PUBLIC_GLM_API_KEY=你的GLM API密钥
```

### 4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 http://localhost:3000 查看网站

## 生产环境部署

### 1. 构建项目

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 2. 启动生产服务器

```bash
npm run start
# 或
yarn start
# 或
pnpm start
```

### 3. 环境变量配置

在生产环境中,请确保正确配置以下环境变量:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GLM_API_KEY`

> ⚠️ 注意: 永远不要将包含实际API密钥的.env文件提交到代码库。在生产环境中,应通过服务器的环境变量或密钥管理系统来配置这些值。

## 安全提示

为了保护您的API密钥和敏感信息:

1. 不要将`.env`或`.env.local`文件提交到版本控制系统
2. 在`.gitignore`中添加这些文件
3. 使用环境变量管理敏感信息
4. 定期轮换API密钥
5. 在生产环境使用加密的密钥管理服务

## 相关资源

- [Next.js文档](https://nextjs.org/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [Supabase文档](https://supabase.com/docs)
- [项目教程文章](https://mp.weixin.qq.com/s/eo5Ke_Plu_CBtlP6Fsn5tA)

## 许可证

MIT
