/**
 * 后端认证服务
 * 使用后端API进行登录、注册等操作
 */

// 获取API基础URL
// 开发环境：使用相对路径，通过 Vite 代理
// 生产环境：使用完整的后端API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : 'https://api.xpj66666.com/api')

/**
 * 通用请求方法
 */
async function request(endpoint: string, method: string = 'GET', data: any = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }

    // 获取token（如果已登录）
    // 参考 tongmeng-main：优先使用 'token'，然后是 'auth_token' 和 'access_token'
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
      response = await fetch(url, options)
    } catch (fetchError: any) {
      // 网络错误（CORS、连接失败等）
      const error = new Error(fetchError.message || 'NetworkError when attempting to fetch resource')
      ;(error as any).isNetworkError = true
      ;(error as any).originalError = fetchError
      throw error
    }
    
    // 处理响应
    const contentType = response.headers.get('content-type')
    let result: any
    try {
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        const text = await response.text()
        try {
          result = JSON.parse(text)
        } catch {
          result = { message: text, success: false }
        }
      }
    } catch (parseError: any) {
      // 如果响应体解析失败，创建一个错误对象
      const error = new Error(`Failed to parse response: ${parseError.message}`)
      ;(error as any).status = response.status
      ;(error as any).isParseError = true
      throw error
    }

    // 记录响应日志（用于调试登录）
    if (url.includes('/auth/login')) {
      console.log('登录API响应:', {
        status: response.status,
        ok: response.ok,
        result: result,
      })
    }

    // 检查HTTP状态码和业务状态
    if (!response.ok) {
      // HTTP错误（4xx, 5xx）
      const errorMsg = result.message || result.error || result.msg || `HTTP error! status: ${response.status}`
      const error = new Error(errorMsg)
      ;(error as any).status = response.status // 保存状态码
      throw error
    }

    // 检查业务状态（后端可能返回success: false但HTTP状态码是200）
    if (result.success === false || (result.status === 'error')) {
      const errorMsg = result.message || result.error || result.msg || '操作失败'
      throw new Error(errorMsg)
    }

    return result
  } catch (error: any) {
    // 如果是网络错误（CORS、502等），不记录详细错误日志（避免日志过多）
    // 这些错误会在调用方（如getCurrentUser）中处理
    if (!error.isNetworkError && !error.isParseError) {
      console.error('Auth API Error:', error)
    }
    throw error
  }
}

/**
 * 认证服务
 */
export const authService = {
  /**
   * 登录
   * @param identifier - 用户名或邮箱
   * @param password - 密码
   * @param options - 可选参数（验证码等）
   */
  async signIn(identifier: string, password: string, options: any = {}) {
    try {
      const response = await request('/auth/login', 'POST', {
        name: identifier, // 后端使用name字段
        password,
        ...options, // 可能包含captcha和key
      })

      console.log('登录响应:', response)

      // 后端返回格式: {status: "success", code: 200, data: {access_token: '...', ...}, message: ''}
      // 注意：后端返回的格式是 status: "success" 而不是 success: true
      if ((response.status === 'success' || response.success === true) && response.data) {
        // 后端返回格式: response.data.access_token（不是嵌套的data.data）
        const token = response.data.access_token || response.data.token
        
        if (!token) {
          console.error('登录响应中没有token:', response)
          throw new Error(response.message || '登录失败：未返回token')
        }
        
        // 保存token到localStorage（参考 tongmeng-main：使用 'token' 作为主要key）
        localStorage.setItem('token', token)
        sessionStorage.setItem('token', token)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('access_token', token)
        
        // 触发自定义事件，通知其他组件登录状态变化
        window.dispatchEvent(new CustomEvent('auth-storage-change', {
          detail: { key: 'token', value: token }
        }))
        
        // 获取用户信息
        const userInfo = await this.getCurrentUser()
        
        return {
          data: {
            user: userInfo,
            token,
            session: {
              access_token: token,
            },
          },
          error: null,
        }
      } else {
        // 检查是否有错误信息
        const errorMsg = response.message || response.error || '登录失败'
        console.error('登录失败:', errorMsg, response)
        throw new Error(errorMsg)
      }
    } catch (error: any) {
      console.error('登录异常:', error)
      return {
        data: null,
        error: {
          message: error.message || '登录失败，请稍后重试',
        },
      }
    }
  },

  /**
   * 注册
   * @param userData - 用户数据
   */
  async signUp(userData: any) {
    try {
      const response = await request('/auth/register', 'POST', userData)
      
      if (response.success && response.data && response.data.token) {
        const token = response.data.token
        
        // 保存token（参考 tongmeng-main：使用 'token' 作为主要key）
        localStorage.setItem('token', token)
        sessionStorage.setItem('token', token)
        localStorage.setItem('auth_token', token)
        localStorage.setItem('access_token', token)
        
        // 触发自定义事件，通知其他组件登录状态变化
        window.dispatchEvent(new CustomEvent('auth-storage-change', {
          detail: { key: 'token', value: token }
        }))
        
        // 获取用户信息
        const userInfo = await this.getCurrentUser()
        
        return {
          data: {
            user: userInfo,
            token,
            session: {
              access_token: token,
            },
          },
          error: null,
        }
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '注册失败，请稍后重试',
        },
      }
    }
  },

  /**
   * 登出
   */
  async signOut() {
    try {
      await request('/auth/logout', 'POST')
      // 清除本地token（参考 tongmeng-main：清除所有可能的token key）
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('access_token')
      
      // 触发自定义事件，通知其他组件登录状态变化
      window.dispatchEvent(new CustomEvent('auth-storage-change', {
        detail: { key: 'token', value: null }
      }))
      
      return { error: null }
    } catch (error: any) {
      // 即使API失败，也清除本地token（参考 tongmeng-main：清除所有可能的token key）
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('access_token')
      
      // 触发自定义事件，通知其他组件登录状态变化
      window.dispatchEvent(new CustomEvent('auth-storage-change', {
        detail: { key: 'token', value: null }
      }))
      
      return { error: { message: error.message } }
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    try {
      // 参考 tongmeng-main：优先使用 'token'，然后是 'auth_token' 和 'access_token'
      const token = localStorage.getItem('token') || 
                    sessionStorage.getItem('token') ||
                    localStorage.getItem('auth_token') || 
                    localStorage.getItem('access_token')
      if (!token) {
        return null
      }

      const response = await request('/auth/me', 'POST')
      
      // 后端返回格式可能是 {status: "success", data: {...}} 或 {success: true, data: {...}}
      if ((response.status === 'success' || response.success === true) && response.data) {
        // 如果data是嵌套的，提取内层data
        return response.data.data || response.data
      }
      
      // 如果返回格式不符合预期，尝试直接返回data
      if (response.data) {
        return response.data.data || response.data
      }
      
      return null
    } catch (error: any) {
      // 如果是502错误或网络错误，可能是后端服务问题，但不应该阻止登录状态更新
      // 如果token存在，我们可以假设用户已登录（即使无法获取详细信息）
      const token = localStorage.getItem('token') || 
                    sessionStorage.getItem('token') ||
                    localStorage.getItem('auth_token') || 
                    localStorage.getItem('access_token')
      if (token) {
        // 检查是否是502错误、网络错误或其他服务器错误
        const isServerError = error.status === 502 || 
                             error.status === 503 || 
                             error.status === 504 ||
                             error.isNetworkError ||
                             error.isParseError ||
                             error.message.includes('502') ||
                             error.message.includes('503') ||
                             error.message.includes('504') ||
                             error.message.includes('NetworkError') ||
                             error.message.includes('Failed to fetch') ||
                             error.message.includes('CORS') ||
                             error.message.includes('跨源请求')
        
        if (isServerError) {
          // 只在开发环境或首次遇到时记录警告，避免日志过多
          if (!(window as any)._authErrorLogged) {
            console.warn('后端服务可能暂时不可用，但token存在，假设用户已登录', {
              status: error.status,
              message: error.message,
              isNetworkError: error.isNetworkError,
              isParseError: error.isParseError
            })
            ;(window as any)._authErrorLogged = true
            // 5秒后重置标志，允许再次记录
            setTimeout(() => { (window as any)._authErrorLogged = false }, 5000)
          }
          // 返回一个基本的用户对象，表示已登录但无法获取详细信息
          return { id: null, logged_in: true, error: '无法获取用户详细信息' }
        }
      }
      
      // 非服务器错误（如401未授权），记录错误
      console.error('获取用户信息失败:', error)
      return null
    }
  },

  /**
   * 获取用户会话
   */
  async getSession() {
    // 参考 tongmeng-main：优先使用 'token'，然后是 'auth_token' 和 'access_token'
    const token = localStorage.getItem('token') || 
                  sessionStorage.getItem('token') ||
                  localStorage.getItem('auth_token') || 
                  localStorage.getItem('access_token')
    if (!token) {
      return null
    }

    const user = await this.getCurrentUser()
    
    // 如果user为null，但token存在，可能是网络错误
    // 在这种情况下，返回一个基本的session对象，表示已登录但无法获取详细信息
    if (!user) {
      // 检查是否是网络错误导致的
      // 如果token存在，假设用户已登录
      return {
        access_token: token,
        user: { logged_in: true, error: '无法获取用户详细信息' },
      }
    }
    
    // 如果user有logged_in标志，说明token有效但无法获取详细信息
    if ((user as any).logged_in && !(user as any).id) {
      return {
        access_token: token,
        user,
      }
    }

    // 正常情况：有完整的用户信息
    return {
      access_token: token,
      user,
    }
  },

  /**
   * 获取验证码
   */
  async getCaptcha() {
    try {
      const response = await request('/auth/captcha', 'POST')
      if (response.status === 'success' || response.success) {
        return {
          success: true,
          data: {
            key: response.data?.key || '',
            image: response.data?.img || response.data?.image || '',
          },
        }
      } else {
        throw new Error(response.message || '获取验证码失败')
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '获取验证码失败',
      }
    }
  },
}
