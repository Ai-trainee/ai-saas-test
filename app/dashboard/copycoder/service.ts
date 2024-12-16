// 提示词模板
const COMPONENT_PROMPT = `分析这个UI界面的组件实现细节，包括:
1. 组件的类型和功能
2. 布局和样式特点
3. 交互行为
4. 动画效果
5. 响应式设计考虑
请用专业的前端开发术语描述，并给出关键的实现建议。`

const STRUCTURE_PROMPT = `分析这个界面的整体结构，包括:
1. 页面布局架构
2. 主要区块划分
3. 组件层级关系
4. 设计系统特点
5. 技术栈建议
请从前端架构的角度进行分析，并给出实现建议。`

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