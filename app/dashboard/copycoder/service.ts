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

// 自定义错误类
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 重试配置
const RETRY_COUNT = 3
const RETRY_DELAY = 1000

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 重试函数
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = RETRY_COUNT,
  delayMs: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs)
      return retryOperation(operation, retries - 1, delayMs * 1.5)
    }
    throw error
  }
}

export async function generatePrompt(
  image: string,
  type: 'component' | 'structure'
): Promise<string> {
  const prompt = type === 'component' ? COMPONENT_PROMPT : STRUCTURE_PROMPT
  
  try {
    // 检查图片大小
    const imageSize = getBase64Size(image)
    if (imageSize > 5 * 1024 * 1024) {
      throw new APIError('图片大小不能超过5MB', 400, 'IMAGE_TOO_LARGE')
    }

    // 检查API密钥
    const apiKey = process.env.NEXT_PUBLIC_GLM_API_KEY
    if (!apiKey) {
      throw new APIError('缺少API密钥配置', 500, 'MISSING_API_KEY')
    }

    // 发起API请求
    const response = await retryOperation(async () => {
      const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
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

      if (!res.ok) {
        const error = await res.json()
        throw new APIError(
          error.message || '服务调用失败',
          res.status,
          error.code
        )
      }

      return res
    })

    const data: GLMResponse = await response.json()
    
    // 检查响应数据
    if (!data.choices?.[0]?.message?.content) {
      throw new APIError('无效的响应数据', 500, 'INVALID_RESPONSE')
    }

    return data.choices[0].message.content

  } catch (error) {
    console.error('生成提示词失败:', error)
    
    if (error instanceof APIError) {
      throw error
    }
    
    throw new APIError(
      '服务暂时不可用,请稍后重试',
      500,
      'SERVICE_UNAVAILABLE'
    )
  }
}

// 计算base64图片大小
function getBase64Size(base64: string): number {
  const base64Length = base64.length - (base64.indexOf(',') + 1)
  const padding = (base64.charAt(base64.length - 2) === '=') ? 2 : 
                 (base64.charAt(base64.length - 1) === '=') ? 1 : 0
  return base64Length * 0.75 - padding
} 