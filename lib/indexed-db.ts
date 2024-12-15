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

  async init() {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // 创建历史记录存储
        if (!db.objectStoreNames.contains('chatHistory')) {
          const store = db.createObjectStore('chatHistory', {
            keyPath: 'id',
            autoIncrement: true
          })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('title', 'title')
        }
      }
    })
  }

  async saveChatHistory(history: ChatHistory): Promise<number> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatHistory'], 'readwrite')
      const store = transaction.objectStore('chatHistory')
      const request = store.add(history)

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getChatHistory(): Promise<ChatHistory[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatHistory'], 'readonly')
      const store = transaction.objectStore('chatHistory')
      const request = store.index('timestamp').openCursor(null, 'prev')
      const results: ChatHistory[] = []

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteChatHistory(id: number): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chatHistory'], 'readwrite')
      const store = transaction.objectStore('chatHistory')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async searchChatHistory(query: string): Promise<ChatHistory[]> {
    const allHistory = await this.getChatHistory()
    return allHistory.filter(history => 
      history.title.toLowerCase().includes(query.toLowerCase()) ||
      history.lastMessage?.toLowerCase().includes(query.toLowerCase())
    )
  }

  async exportChatHistory(): Promise<string> {
    const history = await this.getChatHistory()
    return JSON.stringify(history, null, 2)
  }
}

export const db = new IndexedDBManager() 