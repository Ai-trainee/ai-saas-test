// 提示词模板
const COMPONENT_PROMPT = `请详细分析这个UI界面的组件实现细节，最后按照示例规结构化输出提示词：

1. **组件系统**：
   - 核心组件的类型和功能
   - 组件间的层级关系
   - 组件的状态管理
   - 组件间通信方式

2. **界面布局**：
   - 整体布局结构
   - 栅格系统使用
   - 响应式布局策略
   - 间距和对齐规范

3. **视觉设计**：
   - 色彩系统和主题
   - 字体和排版规范
   - 阴影和海拔效果
   - 视觉层次关系

4. **交互设计**：
   - 用户输入处理
   - 状态反馈机制
   - 错误处理方式
   - 加载状态展示

5. **动画效果**：
   - 过渡动画类型
   - 动画触发时机
   - 动画曲线选择
   - 性能优化方案

6. **响应式适配**：
   - 断点设计方案
   - 布局自适应策略
   - 内容响应规则
   - 设备适配考虑
  

根据上面的分析，请严格按照如下格式输出，从创建详细的组件开始（不是复制示例输出，而是按照示例格式输出，你需要参考具体图片）：

<示例>
请按照以下要求创建详细的组件：
1.  客户端组件使用 'use client' 指令
2.  使用 Tailwind CSS 实用类进行响应式设计
3.  使用 Lucide React 作为图标库 (来自 lucide-react 包)。除非另有要求，否则不要使用其他 UI 库
4.  在适当的地方使用 picsum.photos 的图片，只使用你确认存在的有效 URL
5.  配置 next.config.js 的 image remotePatterns 以启用来自 picsum.photos 的图片
6.  创建根 layout.tsx 页面，包裹所有页面的必要导航项
7.  必须将导航元素放置在正确的位置，例如：左侧边栏、顶部标题
8.  准确实现必要的网格布局
9.  遵循正确的导入实践：
    - 使用 @/ 路径别名
    - 保持组件导入的组织性
    - 使用新的完整代码更新当前的 src/app/page.tsx
    - 不要忘记根路由 (page.tsx) 的处理
    - 你必须在停止之前完成整个提示

AI 工具目录平台界面
</summary_title>

<image_analysis>

1. **导航元素**:
    - 顶部标题包含: AI工具, AI应用, 每日AI新闻, 文档, AI咨询, 关于我们
    - 左侧边栏包含: AI应用, AI工具, AI图像工具, AI视频工具, AI办公工具, AI设计工具
    - 二级导航包含: 常用, 搜索, 社区, 图片, 生活

2. **布局组件**:
    - 头部高度: 60px
    - 左侧边栏宽度: 200px
    - 主要内容区域: 流式宽度
    - 搜索栏: 宽度 600px，居中
    - 卡片网格: 3-4 列响应式布局

3. **内容部分**:
    - 轮播/横幅精选部分
    - 带建议的搜索栏
    - 热门标签/关键词
    - 工具卡片网格布局
    - 分类部分
    - 快速访问工具部分

4. **交互控件**:
    - 带图标的搜索输入框
    - 分类筛选标签
    - 带有悬停状态的工具卡片
    - 导航下拉菜单
    - 主题切换按钮
    - 语言选择器

5. **颜色**:
    - 主要颜色: #6C5CE7 (紫色)
    - 次要颜色: #A8A4FF (淡紫色)
    - 背景颜色: #FFFFFF
    - 文本颜色: #333333
    - 强调颜色: #F0F0F0 (浅灰色)
    - 卡片背景颜色: #FFFFFF

6. **网格/布局结构**:
    - 12 列网格系统
    - 16px 基准间距
    - 卡片网格间距: 24px
    - 响应式断点: 768px, 1024px, 1440px
</image_analysis>

<development_planning>

1. **项目结构**:
\`\`\`
src/
├── components/
│   ├── layout/
│   │   ├── Header
│   │   ├── Sidebar
│   │   └── Footer
│   ├── features/
│   │   ├── Search
│   │   ├── ToolCard
│   │   └── CategoryFilter
│   └── shared/
├── assets/
├── styles/
├── hooks/
└── utils/
\`\`\`

2. **关键功能**:
    - 工具搜索和筛选
    - 基于类别的导航
    - 带有元数据的工具卡片
    - 用户身份验证
    - 收藏/书签系统
    - 响应式布局系统

3. **状态管理**:
\`\`\`typescript
interface AppState {
├── tools: {
│   ├── items: Tool[]
│   ├── categories: Category[]
│   ├── filters: FilterState
│   └── search: SearchState
├── }
├── user: {
│   ├── profile: UserProfile
│   ├── preferences: UserPreferences
│   └── favorites: string[]
├── }
}
\`\`\`

4. **路由**:
\`\`\`typescript
const routes = [
├── '/',
├── '/category/:id',
├── '/tool/:id',
├── '/search',
└── '/user/*'
]
\`\`\`

5. **组件架构**:
    - 布局组件 (Header, Sidebar, Footer)
    - 功能组件 (Search, ToolCard, CategoryFilter)
    - 共享组件 (Button, Input, Modal)
    - 用于状态管理的容器组件

6. **响应式断点**:
\`\`\`scss
$breakpoints: (
├── 'mobile': 320px,
├── 'tablet': 768px,
├── 'desktop': 1024px,
└── 'wide': 1440px
);
\`\`\`
</development_planning>
</示例>
`;



const STRUCTURE_PROMPT = `请详细分析这个界面的板面结构，最后按照示例规结构化输出提示词：

1. **架构设计**：
   - 项目整体架构
   - 目录结构组织
   - 模块划分方案
   - 数据流设计

2. **页面结构**：
   - 主要区块划分
   - 布局系统设计
   - 组件复用策略
   - 页面间关系

3. **组件体系**：
   - 组件层级关系
   - 组件通信模式
   - 状态管理方案
   - 组件库设计

4. **技术选型**：
   - 框架和库选择
   - 构建工具配置
   - 开发工具链
   - 测试方案

5. **性能优化**：
   - 加载性能
   - 运行时性能
   - 缓存策略
   - 代码分割
  

根据上面的分析，请严格按照如下格式输出，从路由结构开始（不是复制示例输出，而是按照示例格式输出，你需要参考具体图片）：

<示例>
### 路由结构
- **/ai-tools**  
- **/ai-applications**  
- **/daily-ai-news**  
- **/documentation**  
- **/ai-consulting**  
- **/about-us**  
- **/ai-image-tools**  
- **/ai-video-tools**  
- **/ai-office-tools**  
- **/ai-design-tools**  
- **/common**  
- **/search**  
- **/community**  
- **/images**  
- **/life**

---

### 页面实现

#### **/ai-tools**
**核心目的**: AI 工具目录，具有过滤和比较功能  
**关键组件**:  
- 工具卡片及描述  
- 分类过滤器  
- 搜索功能  
- 比较工具布局  
- 工具网格布局  
- 过滤器侧边栏  
- 响应式卡片尺寸  

#### **/ai-applications**
**核心目的**: 展示跨行业的实际 AI 应用  
**关键组件**:  
- 案例研究卡片  
- 行业过滤器  
- 实施指南  
- 特征应用轮播  
- 分类部分  
- 响应式网格布局  

#### **/daily-ai-news**
**核心目的**: 最新 AI 新闻和动态  
**关键组件**:  
- 新闻 Feed  
- 分类过滤器  
- 新闻简报注册  
- 社交分享  
- 时间线布局  
- 侧边栏与热门话题  
- 移动端优化新闻卡片  

#### **/documentation**
**核心目的**: 技术文档和指南  
**关键组件**:  
- 文档导航  
- 代码示例  
- 搜索功能  
- 版本选择器  
- 侧边导航  
- 主内容区域  
- 固定头部  

#### **/ai-consulting**
**核心目的**: AI 咨询服务信息及预约  
**关键组件**:  
- 服务卡片  
- 预约日历  
- 联系表单  
- 案例研究  
- Hero 部分  
- 服务网格  
- 客户评价  

#### **/about-us**
**核心目的**: 公司信息与团队介绍  
**关键组件**:  
- 公司时间线  
- 团队成员卡片  
- 使命宣言  
- 联系方式  
- 全宽部分  
- 团队网格  
- 故事时间线  

#### **/ai-image-tools**
**核心目的**: 图像生成与编辑 AI 工具  
**关键组件**:  
- 工具比较表  
- 图像画廊  
- 教程部分  
- 工具类别  
- 示例画廊  
- 教程卡片  

#### **/ai-video-tools**
**核心目的**: 视频创作与编辑 AI 工具  
**关键组件**:  
- 视频播放器  
- 工具列表  
- 教程部分  
- 特征工具滑块  
- 视频网格  
- 教程部分  

#### **/ai-office-tools**
**核心目的**: 办公和生产力 AI 工具  
**关键组件**:  
- 工具类别  
- 集成指南  
- 价格比较  
- 工具卡片  
- 分类部分  
- 比较表格  

#### **/ai-design-tools**
**核心目的**: AI 驱动的设计工具目录  
**关键组件**:  
- 工具展示  
- 设计画廊  
- 教程部分  
- 工具网格  
- 示例展示  
- 资源部分  

---

### 布局

#### **主布局**
- **适用路由**: 所有路由  
- **核心组件**:  
  - 导航头部  
  - 页脚  
  - 侧边栏（如适用）  
  - 面包屑导航  
- **响应式行为**:  
  - 移动端折叠导航  
  - 弹性内容宽度  
  - 动态侧边栏显示  

#### **文档布局**
- **适用路由**: /documentation  
- **核心组件**:  
  - 侧边导航  
  - 内容区域  
  - 搜索框  
  - 版本选择器  
- **响应式行为**:  
  - 可折叠侧边导航  
  - 移动优化的阅读视图  

#### **工具目录布局**
- **适用路由**: /ai-tools, /ai-image-tools, /ai-video-tools, /ai-office-tools, /ai-design-tools  
- **核心组件**:  
  - 过滤器侧边栏  
  - 工具网格  
  - 比较功能  
- **响应式行为**:  
  - 移动端过滤器模态  
  - 自适应网格列数  
  - 可滚动的比较表格  

#### **新闻布局**
- **适用路由**: /daily-ai-news  
- **核心组件**:  
  - 新闻 Feed  
  - 分类导航  
  - 新闻简报注册  
- **响应式行为**:  
  - 移动端单列布局  
  - 固定分类导航  
  - 无限滚动
</示例>
`;

interface GLMResponse {
  id: string
  created: number
  model: string
  choices: {
    index: number
    finish_reason: string
    message: {
      role: string
      content: string
    }
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function generatePrompt(
  image: string,
  type: 'component' | 'structure'
) {
  const prompt = type === 'component' ? COMPONENT_PROMPT : STRUCTURE_PROMPT

  try {
    // 检查图片大小
    const imageSize = getBase64Size(image)
    if (imageSize > 5 * 1024 * 1024) {
      throw new Error('图片大小不能超过5MB')
    }

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4v-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        stream: false,
        temperature: 0.95,
        top_p: 0.7,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API调用失败')
    }

    const data: GLMResponse = await response.json()
    return data.choices[0].message.content

  } catch (error) {
    console.error('生成提示词失败:', error)
    throw error
  }
}

// 计算base64图片大小
function getBase64Size(base64: string) {
  const base64Length = base64.length - (base64.indexOf(',') + 1)
  const padding = (base64.charAt(base64.length - 2) === '=') ? 2 :
    (base64.charAt(base64.length - 1) === '=') ? 1 : 0
  return base64Length * 0.75 - padding
} 