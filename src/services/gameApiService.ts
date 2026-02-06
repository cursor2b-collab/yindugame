/**
 * 游戏API服务类
 * 封装所有游戏相关的API调用
 */

// 获取游戏API URL
// ⚠️ 始终通过后端API代理，绝不直接调用游戏API
const getGameApiUrl = () => {
  // 开发环境：使用相对路径，通过 Vite 代理
  // 生产环境：使用完整的后端API URL（因为生产环境可能没有 nginx 代理）
  const apiBaseUrl = import.meta.env.VITE_API_URL || 
    (import.meta.env.DEV ? '/api' : 'https://api.xpj66666.com/api')
  const gameApiUrl = `${apiBaseUrl}/game-api`
  return gameApiUrl
}

/**
 * 游戏API服务类
 * 封装所有游戏相关的API调用
 */
class GameApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = getGameApiUrl()
  }

  /**
   * 通用请求方法
   */
  private async request(endpoint: string, method: string = 'GET', data: any = null) {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }

      // 获取认证token（如果使用JWT或其他认证方式）
      // 优先从localStorage获取token（参考 tongmeng-main）
      const token = localStorage.getItem('token') || 
                   sessionStorage.getItem('token') ||
                   localStorage.getItem('auth_token') || 
                   localStorage.getItem('access_token')
      
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data)
      }

      let response
      try {
        // 添加超时处理（30秒）
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          controller.abort()
        }, 30000)
        
        try {
          response = await fetch(url, {
            ...options,
            signal: controller.signal
          })
          clearTimeout(timeoutId)
        } catch (fetchError: any) {
          clearTimeout(timeoutId)
          
          // 如果是超时错误
          if (fetchError.name === 'AbortError') {
            const timeoutError: any = new Error('请求超时（30秒），请检查网络连接或稍后重试')
            timeoutError.isTimeout = true
            timeoutError.url = url
            throw timeoutError
          }
          throw fetchError
        }
      } catch (fetchError: any) {
        // 处理网络错误（CORS、连接失败等）
        console.error('游戏API网络错误:', {
          url,
          error: fetchError,
          message: fetchError.message,
          name: fetchError.name,
          isTimeout: fetchError.isTimeout
        })
        
        // 如果是 CORS 错误或网络错误
        if (fetchError.message?.includes('CORS') || 
            fetchError.message?.includes('NetworkError') ||
            fetchError.name === 'TypeError' ||
            fetchError.message?.includes('Failed to fetch') ||
            fetchError.isTimeout) {
          const networkError: any = new Error(
            fetchError.isTimeout 
              ? '请求超时，请检查网络连接'
              : '网络连接失败，可能是跨域问题或网络不可达。请检查：1) 后端API的CORS配置 2) 网络连接 3) API地址是否正确'
          )
          networkError.isNetworkError = true
          networkError.isCorsError = fetchError.message?.includes('CORS') || false
          networkError.isTimeout = fetchError.isTimeout || false
          networkError.originalError = fetchError
          networkError.url = url
          throw networkError
        }
        throw fetchError
      }
      
      // 处理非JSON响应
      const contentType = response.headers.get('content-type')
      let result: any
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json()
        } catch (e) {
          const text = await response.text()
          console.error('JSON解析失败:', text)
          throw new Error('响应格式错误: 无法解析JSON')
        }
      } else {
        const text = await response.text()
        try {
          result = JSON.parse(text)
        } catch {
          result = { message: text, success: false }
        }
      }

      // 检查业务错误码
      if (result && result.errorCode && result.errorCode !== 0) {
        console.error('❌ 新游戏API业务错误:', {
          url,
          errorCode: result.errorCode,
          message: result.message,
          result: result
        })
        
        // 将errorCode附加到错误对象，方便调用方检查
        const error: any = new Error()
        error.errorCode = result.errorCode
        error.response = result
        
          // 根据errorCode提供更详细的错误信息
          let errorMessage = result.message || result.error
          if (!errorMessage) {
            // 如果没有message，根据errorCode提供默认错误信息
            const errorCodeMessages: { [key: number]: string } = {
              1: '用户已存在', // 这个错误在createUser中会被特殊处理
              9: '供应商不存在或该供应商暂无游戏', // errorCode 9 通常表示供应商不存在
              10: '游戏启动失败：用户可能未创建或参数错误',
              401: '认证失败：Token无效或已过期',
              403: '访问被拒绝：IP未在白名单中',
              404: '资源不存在：游戏或供应商不存在',
              422: '参数验证失败：请检查请求参数',
              429: '请求过于频繁：请稍后重试',
              500: '服务器内部错误：请稍后重试'
            }
            errorMessage = errorCodeMessages[result.errorCode] || `请求失败 (错误代码: ${result.errorCode})`
          }
          error.message = errorMessage
          throw error
      }

      // 检查HTTP状态码
      if (!response.ok) {
        // 422 通常是验证错误
        if (response.status === 422) {
          const errorMsg = result.message || result.error || '请求参数验证失败'
          const validationErrors = result.errors || result.data || {}
          console.error('❌ 游戏API验证错误 (422):', {
            url,
            status: response.status,
            result,
            validationErrors,
            '发送的参数': data
          })
          
          // 构建详细的错误消息
          let detailedError = errorMsg
          if (validationErrors && Object.keys(validationErrors).length > 0) {
            const errorDetails = Object.entries(validationErrors)
              .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ')
            detailedError = `${errorMsg} - ${errorDetails}`
          }
          
          throw new Error(detailedError)
        }
        console.error('❌ 游戏API请求失败:', {
          url,
          status: response.status,
          statusText: response.statusText,
          result,
          '发送的参数': data
        })
        throw new Error(result?.message || result?.error || `HTTP error! status: ${response.status}`)
      }

      return result
    } catch (error: any) {
      console.error('❌ 游戏API错误:', {
        endpoint: `${this.baseUrl}${endpoint}`,
        url: `${this.baseUrl}${endpoint}`,
        error: error,
        message: error.message,
        isNetworkError: error.isNetworkError,
        isCorsError: error.isCorsError
      })
      
      // 如果是网络错误，提供更详细的错误信息
      if (error.isNetworkError || error.isCorsError) {
        const detailedError: any = new Error(
          error.message || '网络连接失败。请检查：1) 后端API是否正常运行 2) CORS配置是否正确 3) 网络连接是否正常'
        )
        detailedError.isNetworkError = true
        detailedError.isCorsError = error.isCorsError
        detailedError.url = `${this.baseUrl}${endpoint}`
        detailedError.originalError = error
        throw detailedError
      }
      
      throw error
    }
  }

  /**
   * 2.2 获取供应商列表
   */
  async getVendorsList() {
    return this.request('/vendors/list', 'GET')
  }

  /**
   * 2.3 获取游戏列表
   * @param vendorCode - 供应商代码
   * @param language - 语言代码，默认从localStorage获取并映射
   */
  async getGamesList(vendorCode: string, language?: string) {
    // 如果没有提供language，从localStorage获取并映射
    if (!language) {
      const { getGameApiLanguage } = await import('@/utils/languageMapper');
      language = getGameApiLanguage();
    }
    
    return this.request('/games/list', 'POST', {
      vendorCode,
      language,
    })
  }

  /**
   * 2.4 获取迷你游戏列表
   * @param language - 语言代码，默认从localStorage获取并映射
   */
  async getMiniGamesList(language?: string) {
    // 如果没有提供language，从localStorage获取并映射
    if (!language) {
      const { getGameApiLanguage } = await import('@/utils/languageMapper');
      language = getGameApiLanguage();
    }
    
    // 注意：根据API文档，/games/mini/list 是GET请求，可能需要language参数
    // 如果API支持，可以在URL参数中传递
    return this.request(`/games/mini/list${language ? `?language=${language}` : ''}`, 'GET')
  }

  /**
   * 2.5 获取游戏详情
   * @param vendorCode - 供应商代码
   * @param gameCode - 游戏代码
   */
  async getGameDetail(vendorCode: string, gameCode: string) {
    return this.request('/game/detail', 'POST', {
      vendorCode,
      gameCode,
    })
  }

  /**
   * 2.6 获取启动URL
   * @param vendorCode - 供应商代码
   * @param gameCode - 游戏代码
   * @param userCode - 用户代码
   * @param language - 语言代码，默认从localStorage获取并映射
   * @param lobbyUrl - 大厅URL（可选，某些游戏提供商关闭游戏时需要重定向）
   */
  async getLaunchUrl(
    vendorCode: string,
    gameCode: string,
    userCode: string,
    language?: string,
    lobbyUrl: string | null = null
  ) {
    // 如果没有提供language，从localStorage获取并映射
    if (!language) {
      const { getGameApiLanguage } = await import('@/utils/languageMapper');
      language = getGameApiLanguage();
    }
    
    // 确保所有参数都是字符串且不为空
    vendorCode = String(vendorCode || '').trim()
    gameCode = String(gameCode || '').trim()
    userCode = String(userCode || '').trim()
    language = String(language || 'zh').trim() || 'zh'
    
    // 验证必需参数
    if (!vendorCode || vendorCode.length === 0) {
      throw new Error('供应商代码不能为空')
    }
    if (!gameCode || gameCode.length === 0 || gameCode === '0') {
      throw new Error('游戏代码不能为空')
    }
    if (!userCode || userCode === '0' || userCode === 'null' || userCode === 'undefined') {
      throw new Error('用户代码无效，请重新登录')
    }
    
    const data: any = {
      vendorCode,
      gameCode,
      userCode,
      language,
    }
    if (lobbyUrl) {
      data.lobbyUrl = String(lobbyUrl).trim()
    }
    
    console.log('📤 调用getLaunchUrl，参数:', data)
    return this.request('/game/launch-url', 'POST', data)
  }

  /**
   * 2.11 创建用户
   * @param userCode - 用户代码（用户标识符）
   */
  async createUser(userCode: string) {
    // 确保userCode是字符串且不为空
    userCode = String(userCode || '').trim()
    if (!userCode || userCode === '0' || userCode === 'null' || userCode === 'undefined') {
      throw new Error('用户代码无效')
    }
    
    try {
      const result = await this.request('/user/create', 'POST', { userCode })
      
      // 检查响应中的errorCode
      // errorCode: 0 表示成功创建
      // errorCode: 1 表示用户已存在（这也是成功的情况）
      if (result && result.errorCode !== undefined) {
        if (result.errorCode === 0) {
          return result
        } else if (result.errorCode === 1) {
          // 返回一个成功的响应对象
          return {
            success: true,
            errorCode: 1,
            message: '用户已存在'
          }
        } else {
          // 其他错误码，抛出错误
          throw new Error(result.message || `创建用户失败 (errorCode: ${result.errorCode})`)
        }
      }
      
      // 如果result.success为true，也认为是成功
      if (result && result.success === true) {
        return result
      }
      
      // 如果request没有抛出错误，说明成功
      return result
    } catch (error: any) {
      // 检查错误信息中是否包含errorCode: 1（用户已存在）
      const errorCode = error?.errorCode || error?.response?.errorCode
      const errorMessage = error?.message || ''
      
      // errorCode: 1 通常表示用户已存在，这是可以接受的
      if (errorCode === 1 || errorMessage.includes('errorCode: 1') || errorMessage.includes('errorCode:1')) {
        console.log('ℹ️ 用户已存在 (errorCode: 1)，继续...')
        // 返回一个成功的响应对象
        return {
          success: true,
          errorCode: 1,
          message: '用户已存在'
        }
      }
      
      // 其他错误，重新抛出
      throw error
    }
  }

  /**
   * 2.12 获取用户余额
   * @param userCode - 用户代码
   * @param vendorCode - 供应商代码（可选，分离钱包时需要）
   */
  async getUserBalance(userCode: string, vendorCode?: string) {
    // 确保userCode是字符串且不为空
    userCode = String(userCode || '').trim()
    if (!userCode || userCode === '0' || userCode === 'null' || userCode === 'undefined') {
      throw new Error('用户代码无效')
    }
    const data: any = {
      userCode
    }
    
    // 如果提供了 vendorCode（分离钱包时需要），添加到请求中
    if (vendorCode) {
      data.vendorCode = vendorCode
    }
    
    console.log('📤 调用getUserBalance，userCode:', userCode, vendorCode ? `vendorCode: ${vendorCode}` : '')
    return this.request('/user/balance', 'POST', data)
  }

  /**
   * 2.13 存款
   * @param userCode - 用户代码
   * @param balance - 金额
   * @param orderNo - 订单号（可选）
   * @param vendorCode - 供应商代码（可选）
   */
  async deposit(userCode: string, balance: number, orderNo: string | null = null, vendorCode: string | null = null) {
    const data: any = { userCode, balance }
    if (orderNo) data.orderNo = orderNo
    if (vendorCode) data.vendorCode = vendorCode
    return this.request('/user/deposit', 'POST', data)
  }

  /**
   * 2.14 提款
   * @param userCode - 用户代码
   * @param balance - 金额
   * @param orderNo - 订单号（可选）
   * @param vendorCode - 供应商代码（可选）
   */
  async withdraw(userCode: string, balance: number, orderNo: string | null = null, vendorCode: string | null = null) {
    const data: any = { userCode, balance }
    if (orderNo) data.orderNo = orderNo
    if (vendorCode) data.vendorCode = vendorCode
    return this.request('/user/withdraw', 'POST', data)
  }

  /**
   * 2.15 全部提款
   * @param userCode - 用户代码
   * @param vendorCode - 供应商代码（可选）
   */
  async withdrawAll(userCode: string, vendorCode: string | null = null) {
    const data: any = { userCode }
    if (vendorCode) data.vendorCode = vendorCode
    return this.request('/user/withdraw-all', 'POST', data)
  }

  /**
   * 1.3 API状态检查
   */
  async getStatus() {
    return this.request('/status', 'GET')
  }
}

// 导出单例
export const gameApiService = new GameApiService()

// 导出类以便需要时创建新实例
export default GameApiService
