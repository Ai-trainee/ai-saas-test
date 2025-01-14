```thinking
让我思考一下如何给后续开发者提供清晰的国际化指南...

主要需要说明的几个关键点:
1. 项目已经搭建了完整的国际化框架,使用了 language-context 和 language.ts 配置文件
2. 所有新增功能都需要支持中英文切换
3. 需要展示已经国际化的文件作为示例
4. 提供一个简单的步骤指南,说明如何为新功能添加国际化支持

我应该:
1. 写一个简洁的 README 说明国际化要求
2. 用实际代码示例来说明如何添加翻译
3. 重点强调需要注意的地方
4. 保持文档简单直接,避免太多技术细节

让我来组织一个清晰的说明文档...
```

好的,我来帮你写一个简洁的国际化指南,供后续开发者参考:

# 项目国际化(i18n)开发指南

## 基本要求
- 所有新功能必须同时支持中文和英文
- 所有用户可见的文本都需要使用翻译配置,不允许硬编码
- 默认语言为英文(en)

## 项目国际化架构
1. 语言上下文: `contexts/language-context.tsx`
2. 翻译配置: `config/language.ts` 
3. 组件调用: 使用 `useLanguage` hook 获取当前语言

## 如何为新功能添加国际化支持

1. 在 `config/language.ts` 中添加新功能的翻译配置:
```typescript
export const translations = {
  // 已有配置...
  
  yourNewFeature: {
    en: {
      title: "Feature Name",
      description: "Feature Description",
      // 其他文本...
    },
    zh: {
      title: "功能名称",
      description: "功能描述",
      // 其他文本...
    }
  }
}
```

2. 在组件中使用翻译:
```typescript
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

export function YourComponent() {
  const { language } = useLanguage()
  const t = translations.yourNewFeature[language]

  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.description}</p>
    </div>
  )
}
```

## 已完成国际化的组件示例
- `app/dashboard/page.tsx`
- `app/blog/page.tsx` 
- `app/login/page.tsx`
- `components/service-nav.tsx`
- `components/nav-menu.tsx`
- `components/pricing-section.tsx`
- `app/dashboard/image-generation/page.tsx`
- `app/dashboard/vision-analysis/page.tsx`
- `app/dashboard/copycoder/page.tsx`

你可以参考这些文件来了解如何实现国际化。

## 注意事项
1. 确保所有用户界面文本都通过翻译配置提供
2. 测试时需要在中英文环境下都进行验证
3. 保持翻译键名语义化且易于理解
4. 对于复杂的文本结构,建议在翻译配置中进行适当的分类

## 常见问题
Q: 在哪里切换语言?
A: 通过 Navbar 的语言切换按钮,或使用 `useLanguage` hook 的 `setLanguage` 方法

Q: 如何处理动态内容的翻译?
A: 使用翻译模板并通过代码注入动态内容

如有任何问题,请参考已完成国际化的组件代码或联系项目负责人。
