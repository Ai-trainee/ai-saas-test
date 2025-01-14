```thinking
让我深入思考这个需求:

1. 核心需求分析:
- 需要为后续开发者提供国际化开发指南
- 要确保新功能开发时保持双语支持
- 需要提供现有国际化实现的参考代码
- 这是一个知识传递和最佳实践的问题

2. 关键挑战:
- 如何让新开发者快速理解现有的国际化架构
- 如何确保新功能开发时不会破坏现有的国际化支持
- 如何制定清晰的国际化开发规范
- 如何提供足够详细但又不过于复杂的文档

3. 解决方案构思:
- 编写完整的国际化开发指南文档
- 提供现有代码的最佳实践示例
- 制定国际化开发规范和检查清单
- 提供工具和辅助函数说明

4. 实现策略:
- 分层次组织文档内容
- 结合具体代码示例说明
- 提供开发流程和注意事项
- 添加常见问题解答

让我来制定一个完整的方案
```

基于以上思考,我来编写一个完整的国际化开发指南文档:

# AI-SaaS 项目国际化(i18n)开发指南

## 1. 项目国际化架构概述

### 1.1 核心实现
- 使用 Context API 实现语言切换功能
- 语言配置文件集中管理所有翻译文本
- 组件通过 `useLanguage` hook 获取当前语言环境

### 1.2 关键文件
```typescript
// contexts/language-context.tsx - 语言环境管理
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'zh'>('en')
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

// config/language.ts - 翻译文本配置
export const translations = {
  moduleName: {
    en: {
      key: "English text",
      // ...
    },
    zh: {
      key: "中文文本",
      // ...
    }
  }
}
```

## 2. 新功能开发国际化规范

### 2.1 开发流程
1. 在 `config/language.ts` 中添加新功能的翻译配置
2. 使用 `useLanguage` hook 获取当前语言
3. 使用翻译文本替换所有硬编码的文字

### 2.2 代码示例
```typescript
// 1. 添加翻译配置
// config/language.ts
export const translations = {
  // ... existing translations
  newFeature: {
    en: {
      title: "New Feature",
      description: "This is a new feature"
    },
    zh: {
      title: "新功能",
      description: "这是一个新功能"
    }
  }
}

// 2. 在组件中使用
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

export function NewFeature() {
  const { language } = useLanguage()
  const t = translations.newFeature[language]
  
  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.description}</p>
    </div>
  )
}
```

### 2.3 开发注意事项
- ✅ 所有用户可见的文本必须支持中英文
- ✅ 使用语义化的翻译 key，如 `title`, `description` 等
- ✅ 保持翻译文本结构的一致性
- ❌ 避免在组件中硬编码文本
- ❌ 不要直接修改 `language-context.tsx` 的核心逻辑

## 3. 现有国际化实现示例

### 3.1 基础组件示例
```typescript
// components/service-