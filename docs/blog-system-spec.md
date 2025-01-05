# Next.js 博客系统开发规格说明

## 系统概述

这是一个基于Next.js 14+的博客系统，专门用于展示AI相关的文章和最佳实践。系统采用文件系统作为存储，支持HTML文章的直接渲染，并提供现代化的用户界面。

## 技术栈

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui 组件库

## 目录结构

```
app/
  blog/
    [slug]/
      page.tsx        # 文章详情页
    page.tsx          # 文章列表页
  content/
    posts/           # HTML文章文件
    metadata/        # 文章元数据JSON文件
  api/
    posts/
      [slug]/
        route.ts     # 单篇文章API
      route.ts       # 文章列表API
scripts/
  add-post.js       # 文章添加脚本
```

## 核心功能实现

### 1. 文章存储

文章采用双文件存储方式：
- HTML文件：存储在 `app/content/posts/` 目录
- 元数据文件：存储在 `app/content/metadata/` 目录

元数据JSON格式：
```json
{
  "title": "文章标题",
  "date": "2024-01-04",
  "excerpt": "文章摘要",
  "author": "作者名称",
  "slug": "url-friendly-title"
}
```

### 2. 路由设计

- `/blog` - 文章列表页
- `/blog/[slug]` - 文章详情页
- `/api/posts` - 获取文章列表API
- `/api/posts/[slug]` - 获取单篇文章API

### 3. 数据流

1. 文章列表页：
   - 客户端通过 `/api/posts` 获取所有文章元数据
   - 使用 Grid 布局展示文章卡片
   - 支持响应式设计

2. 文章详情页：
   - 通过 `/api/posts/[slug]` 获取文章内容
   - 使用 dangerouslySetInnerHTML 渲染HTML内容
   - 支持暗色模式

### 4. 文章管理

提供了 `add-post.js` 脚本用于添加新文章：
```bash
node scripts/add-post.js "文章.html"
```

脚本功能：
- 自动提取文章标题和描述
- 生成URL友好的slug
- 创建元数据文件
- 复制HTML文件到正确位置

## 样式设计

1. 文章列表页：
   - 使用卡片式布局
   - 响应式网格（1/2/3列）
   - 悬停效果
   - 现代化的排版

2. 文章详情页：
   - 清晰的文章标题
   - 适合阅读的字体大小和行高
   - 优化的图片显示
   - 暗色模式支持

## 开发注意事项

1. HTML文件要求：
   - UTF-8编码
   - 包含必要的meta标签
   - 自包含的样式
   - 响应式设计

2. 元数据要求：
   - 标题必须与HTML文件中的title一致
   - 日期格式：YYYY-MM-DD
   - slug必须唯一

3. 性能优化：
   - 文章内容静态渲染
   - 图片优化
   - 样式隔离

## 使用示例

1. 添加新文章：
```bash
# 1. 准备HTML文章文件
# 2. 运行添加脚本
node scripts/add-post.js "新文章.html"
# 3. 确认文件生成
# 4. 访问 http://localhost:3000/blog 查看
```

2. 修改文章：
- 直接编辑 `app/content/posts/` 中的HTML文件
- 更新 `app/content/metadata/` 中的元数据

3. 删除文章：
- 删除对应的HTML和JSON文件

## 后续优化建议

1. 功能增强：
   - 添加文章分类
   - 实现搜索功能
   - 添加标签系统
   - 集成评论功能

2. 性能优化：
   - 实现增量静态再生成
   - 添加图片优化
   - 实现预加载

3. 开发体验：
   - 添加文章预览
   - 改进错误处理
   - 添加测试用例 