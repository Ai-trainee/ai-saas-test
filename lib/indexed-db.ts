export interface ChatHistory {
  id?: number
  timestamp: number
  title: string
  messages: any[]
  imageUrl?: string
  lastMessage?: string
}

class IndexedDBManager {
  private dbName = 'vision-chat-db'
  private version = 1
  private db: IDBDatabase | null = null
  private dbReady: Promise<IDBDatabase> | null = null

  constructor() {
    // 在构造函数中初始化数据库
    if (typeof window !== 'undefined') {
      this.dbReady = this.initDB()
    }
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    console.log('初始化 IndexedDB...')
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version)

        request.onerror = (event) => {
          console.error('IndexedDB 打开失败:', request.error)
          reject(request.error)
        }

        request.onsuccess = (event) => {
          console.log('IndexedDB 打开成功')
          this.db = request.result
          
          // 添加错误处理
          this.db.onerror = (event) => {
            console.error('数据库错误:', (event.target as any).error)
          }
          
          resolve(this.db)
        }

        request.onupgradeneeded = (event) => {
          console.log('IndexedDB 升级中...')
          const db = (event.target as IDBOpenDBRequest).result
          
          // 删除旧的存储空间（如果存在）
          if (db.objectStoreNames.contains('chatHistory')) {
            db.deleteObjectStore('chatHistory')
          }
          
          // 创建新的存储空间
          console.log('创建 chatHistory 存储')
          const store = db.createObjectStore('chatHistory', {
            keyPath: 'id',
            autoIncrement: true
          })
          
          // 创建索引
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('title', 'title', { unique: false })
          
          console.log('存储空间和索引创建完成')
        }

        request.onblocked = (event) => {
          console.error('数据库被阻塞:', event)
          reject(new Error('数据库被阻塞'))
        }
      } catch (error) {
        console.error('初始化数据库时出错:', error)
        reject(error)
      }
    })
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbReady) {
      this.dbReady = this.initDB()
    }
    return this.dbReady
  }

  async saveChatHistory(history: ChatHistory): Promise<number> {
    console.log('准备保存聊天记录:', history)
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['chatHistory'], 'readwrite')
        const store = transaction.objectStore('chatHistory')
        
        // 移除 id 字段（如果是新记录）
        if (!history.id) {
          const { id, ...newHistory } = history
          history = newHistory as ChatHistory
        }
        
        const request = store.add(history)

        request.onsuccess = () => {
          const id = request.result as number
          console.log('聊天记录保存成功, ID:', id)
          resolve(id)
        }

        request.onerror = () => {
          console.error('保存聊天记录失败:', request.error)
          reject(request.error)
        }

        transaction.oncomplete = () => {
          console.log('保存事务完成')
        }

        transaction.onerror = () => {
          console.error('保存事务失败:', transaction.error)
          reject(transaction.error)
        }
      } catch (error) {
        console.error('保存过程中出错:', error)
        reject(error)
      }
    })
  }

  async getChatHistory(): Promise<ChatHistory[]> {
    console.log('准备获取所有聊天记录')
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['chatHistory'], 'readonly')
        const store = transaction.objectStore('chatHistory')
        const request = store.index('timestamp').openCursor(null, 'prev')
        const results: ChatHistory[] = []

        request.onsuccess = () => {
          const cursor = request.result
          if (cursor) {
            results.push(cursor.value)
            cursor.continue()
          } else {
            console.log('获取到的聊天记录数量:', results.length)
            resolve(results)
          }
        }

        request.onerror = () => {
          console.error('获取聊天记录失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('获取过程中出错:', error)
        reject(error)
      }
    })
  }

  async updateChatHistory(history: ChatHistory): Promise<void> {
    console.log('准备更新聊天记录:', history)
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['chatHistory'], 'readwrite')
        const store = transaction.objectStore('chatHistory')
        const request = store.put(history)

        request.onsuccess = () => {
          console.log('聊天记录更新成功')
          resolve()
        }

        request.onerror = () => {
          console.error('更新聊天记录失败:', request.error)
          reject(request.error)
        }

        transaction.oncomplete = () => {
          console.log('更新事务完成')
        }
      } catch (error) {
        console.error('更新过程中出错:', error)
        reject(error)
      }
    })
  }

  async deleteChatHistory(id: number): Promise<void> {
    console.log('准备删除聊天记录:', id)
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['chatHistory'], 'readwrite')
        const store = transaction.objectStore('chatHistory')
        const request = store.delete(id)

        request.onsuccess = () => {
          console.log('聊天记录删除成功')
          resolve()
        }

        request.onerror = () => {
          console.error('删除聊天记录失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('删除过程中出错:', error)
        reject(error)
      }
    })
  }

  async clearAllData(): Promise<void> {
    console.log('准备清空所有数据')
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['chatHistory'], 'readwrite')
        const store = transaction.objectStore('chatHistory')
        const request = store.clear()

        request.onsuccess = () => {
          console.log('数据清空成功')
          resolve()
        }

        request.onerror = () => {
          console.error('清空数据失败:', request.error)
          reject(request.error)
        }
      } catch (error) {
        console.error('清空过程中出错:', error)
        reject(error)
      }
    })
  }
}

// 创建单例实例
export const db = new IndexedDBManager() 