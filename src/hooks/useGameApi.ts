import { useState, useCallback } from 'react';
import { gameApiService } from '@/services/gameApiService';
import { authService } from '@/services/authService';

/**
 * 游戏API Hook
 * 提供响应式的游戏API调用和状态管理（参考 stake-vue 的 useGameApi）
 */
export function useGameApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState(0);

  /**
   * 获取当前用户代码（参考 tongmeng-main 的实现）
   */
  const getUserCode = useCallback(async () => {
    try {
      // 优先尝试从localStorage获取用户ID（参考 tongmeng-main）
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          const userId = user.id || user.user_id || user.username || null;
          // 确保返回字符串类型（根据新游戏接口文档，userCode必须是string）
          if (userId !== null) {
            return String(userId).trim();
          }
        } catch (e) {
          console.warn('解析userInfo失败:', e);
        }
      }
      
      // 如果没有，尝试从API获取
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('用户未登录');
      }
      // 使用用户ID作为userCode，确保转换为字符串
      const userCode = (user as any).id || (user as any).user_id || (user as any).username || (user as any).userCode;
      if (!userCode) {
        throw new Error('无法获取用户代码');
      }
      // 确保返回字符串类型
      return String(userCode).trim();
    } catch (error: any) {
      console.error('获取用户代码失败:', error);
      throw new Error('无法获取用户代码，请先登录');
    }
  }, []);

  /**
   * 获取供应商列表
   */
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await gameApiService.getVendorsList();
      if (result.success && result.message) {
        const vendorsList = Array.isArray(result.message) ? result.message : [];
        setVendors(vendorsList);
        return vendorsList;
      }
      return [];
    } catch (err: any) {
      const errorMsg = err.message || '获取供应商列表失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取游戏列表（参考 stake-vue 的实现）
   * @param vendorCode - 供应商代码
   * @param language - 语言代码（可选，默认从localStorage获取并映射）
   */
  const fetchGames = useCallback(async (vendorCode: string, language?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 不传递 language 参数，让 gameApiService 自动从 localStorage 获取并映射
      const result = await gameApiService.getGamesList(vendorCode, language);
      if (result.success && result.message) {
        const gamesList = Array.isArray(result.message) ? result.message : [];
        setGames(gamesList);
        return gamesList;
      }
      // 如果返回格式不符合预期，返回空数组
      return [];
    } catch (err: any) {
      // 检查是否是 errorCode 9（供应商不存在）
      const errorCode = err?.errorCode || err?.response?.errorCode;
      if (errorCode === 9) {
        // errorCode 9 表示供应商不存在，返回空数组而不是抛出错误
        console.warn(`供应商 ${vendorCode} 不存在或暂无游戏 (errorCode: 9)`);
        setError(null); // 不设置错误，因为这是正常的业务情况
        return [];
      }
      const errorMsg = err.message || '获取游戏列表失败';
      setError(errorMsg);
      // 对于其他错误，也返回空数组而不是抛出，让调用方使用默认数据
      console.warn('获取游戏列表失败，返回空数组:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取用户余额
   */
  const fetchUserBalance = useCallback(async (userCode: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      if (!userCode) {
        userCode = await getUserCode();
      }
      // 确保userCode是字符串且不为空
      userCode = String(userCode || '').trim();
      if (!userCode || userCode === '0' || userCode === 'null' || userCode === 'undefined') {
        console.warn('用户代码无效，跳过余额获取:', userCode);
        return 0;
      }
      const result = await gameApiService.getUserBalance(userCode);
      if (result.success && result.message !== undefined) {
        const balance = parseFloat(result.message as any) || 0;
        setUserBalance(balance);
        return balance;
      }
      return 0;
    } catch (err: any) {
      // 余额获取失败不影响其他功能，只记录错误
      console.warn('获取用户余额失败:', err);
      setError(err.message || '获取用户余额失败');
      // 不抛出错误，返回0作为默认值
      return 0;
    } finally {
      setLoading(false);
    }
  }, [getUserCode]);

  /**
   * 启动游戏（参考 stake-vue 的实现）
   * @param vendorCode - 供应商代码
   * @param gameCode - 游戏代码
   * @param language - 语言代码（可选，默认从localStorage获取并映射）
   * @param lobbyUrl - 大厅URL（可选，某些游戏提供商关闭游戏时需要重定向）
   */
  const launchGame = useCallback(async (
    vendorCode: string,
    gameCode: string,
    language?: string,
    lobbyUrl: string | null = null
  ) => {
    setLoading(true);
    setError(null);
    try {
      // 获取用户代码并确保是字符串
      let userCode = await getUserCode();
      userCode = String(userCode).trim();
      
      // 验证参数
      if (!userCode || userCode === '0' || userCode === 'null' || userCode === 'undefined') {
        throw new Error('用户代码无效，请重新登录');
      }
      
      // 确保vendorCode和gameCode是字符串且不为空
      vendorCode = String(vendorCode || '').trim();
      gameCode = String(gameCode || '').trim();
      
      if (!vendorCode || vendorCode.length === 0) {
        throw new Error('供应商代码不能为空');
      }
      
      if (!gameCode || gameCode.length === 0 || gameCode === '0') {
        throw new Error('游戏代码不能为空');
      }
      
      // 验证vendorCode（参考 tongmeng-main：从供应商列表获取并验证）
      try {
        const vendorsResponse = await gameApiService.getVendorsList();
        if (vendorsResponse && vendorsResponse.success && vendorsResponse.message && Array.isArray(vendorsResponse.message)) {
          const vendors = vendorsResponse.message;
          
          // 检查vendorCode是否存在
          const foundVendor = vendors.find((v: any) => v.vendorCode === vendorCode);
          if (!foundVendor) {
            console.warn(`⚠️ vendorCode "${vendorCode}" 不存在于供应商列表中`);
            // 尝试根据名称匹配
            const nameMatch = vendors.find((v: any) => 
              v.name?.toLowerCase().includes(vendorCode.toLowerCase()) ||
              v.vendorCode?.toLowerCase().includes(vendorCode.toLowerCase())
            );
            if (nameMatch) {
              vendorCode = nameMatch.vendorCode;
              console.log(`✅ 找到匹配的供应商: ${vendorCode}`);
            } else {
              console.warn(`⚠️ 无法找到匹配的供应商，使用原值: ${vendorCode}`);
            }
          }
        }
      } catch (vendorError: any) {
        console.warn('⚠️ 获取供应商列表失败，使用原vendorCode:', vendorError);
      }
      
      // language 会在 getLaunchUrl 中自动从 localStorage 获取并映射（如果不提供）
      // 这里只需要确保它是字符串（如果提供了的话）
      if (language) {
        language = String(language).trim() || undefined;
      }
      
      console.log('🎮 启动游戏参数:', {
        vendorCode,
        gameCode,
        userCode,
        language: language || '(将从localStorage自动获取)',
        lobbyUrl
      });
      
      // 自动创建用户（如果用户不存在，API会创建；如果已存在，API会返回成功）
      try {
        console.log('👤 自动创建用户:', userCode);
        const createUserResponse = await gameApiService.createUser(userCode);
        console.log('📥 创建用户响应:', createUserResponse);
        
        // 检查响应中的errorCode
        if (createUserResponse && (createUserResponse as any).errorCode !== undefined) {
          // errorCode: 0 表示成功
          // errorCode: 1 可能表示用户已存在（根据API文档，某些API会这样返回）
          if ((createUserResponse as any).errorCode === 0) {
            console.log('✅ 用户创建成功');
          } else if ((createUserResponse as any).errorCode === 1) {
            console.log('ℹ️ 用户可能已存在 (errorCode: 1)，继续...');
          } else {
            console.warn('⚠️ 用户创建返回错误码:', (createUserResponse as any).errorCode, createUserResponse);
          }
        } else if (createUserResponse && (createUserResponse as any).success === true) {
          console.log('✅ 用户创建成功 (success: true)');
        } else {
          console.log('ℹ️ 用户创建响应:', createUserResponse);
        }
      } catch (userError: any) {
        // 如果创建用户失败，检查是否是用户已存在的错误
        const errorCode = userError?.errorCode || userError?.response?.errorCode || userError?.error?.errorCode;
        const errorMessage = userError?.message || userError?.response?.message || userError?.error?.message || '';
        
        console.warn('⚠️ 用户创建检查失败:', {
          errorCode,
          message: errorMessage,
          error: userError
        });
        
        // errorCode: 1 通常表示用户已存在，可以继续
        // 其他错误也继续尝试，因为可能是网络问题等临时错误
        if (errorCode === 1) {
          console.log('ℹ️ 用户可能已存在 (errorCode: 1)，继续尝试获取游戏URL...');
        } else {
          console.warn('⚠️ 用户创建失败，但继续尝试获取游戏URL (可能用户已存在)');
        }
      }

      // 自动转入余额到游戏（参考 tongmeng-main 的实现）
      try {
        // 1. 获取用户钱包余额（参考 tongmeng-main：使用 getUserInfo API）
        let walletBalance = 0;
        try {
          // 调用 authService.getCurrentUser() 获取用户信息
          const userInfo = await authService.getCurrentUser();
          if (userInfo) {
            // 优先使用 money 字段，然后是 balance 字段（参考 tongmeng-main）
            const userData = userInfo as any;
            walletBalance = userData?.money !== undefined && userData?.money !== null
              ? userData.money
              : (userData?.balance !== undefined && userData?.balance !== null
                ? userData.balance
                : 0);
            console.log('💰 钱包余额:', walletBalance);
          }
        } catch (userInfoError: any) {
          console.warn('⚠️ 获取用户钱包余额失败:', userInfoError);
          walletBalance = 0;
        }
        
        if (walletBalance > 0) {
          // 2. 获取游戏中的余额（对于分离钱包，需要传递 vendorCode）
          let gameBalance = 0;
          try {
            const balanceResponse = await gameApiService.getUserBalance(userCode, vendorCode);
            if (balanceResponse && balanceResponse.success === true) {
              const balanceStr = balanceResponse.message || (balanceResponse as any).data?.balance || (balanceResponse as any).balance || '0';
              gameBalance = parseFloat(String(balanceStr)) || 0;
            }
          } catch (balanceError: any) {
            console.warn('⚠️ 获取游戏中余额失败，假设余额为0:', balanceError);
            gameBalance = 0;
          }
          
          // 3. 计算需要转入的金额（钱包余额 - 游戏中余额）
          const transferAmount = walletBalance - gameBalance;
          
          // 4. 如果有余额需要转入，执行转入操作
          if (transferAmount > 0) {
            // 生成订单号
            const orderNo = `DEPOSIT_${userCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            try {
              const depositResponse = await gameApiService.deposit(
                userCode,
                transferAmount,
                orderNo,
                vendorCode
              );
              
              if (depositResponse && depositResponse.success === true) {
                const newGameBalance = parseFloat(depositResponse.message as any || '0') || 0;
                console.log('✅ 余额转入成功，游戏余额:', newGameBalance);
              } else {
                console.warn('⚠️ 余额转入失败:', depositResponse);
              }
            } catch (depositError: any) {
              console.error('❌ 余额转入异常:', depositError);
              // 余额转入失败不影响游戏启动，继续执行
            }
          } else if (transferAmount < 0) {
            console.log('ℹ️ 游戏中余额大于钱包余额，无需转入');
          } else {
            console.log('ℹ️ 余额已同步，无需转入');
          }
        } else {
          console.log('ℹ️ 钱包余额为0，无需转入');
        }
      } catch (transferError: any) {
        console.error('❌ 自动转入余额过程异常:', transferError);
        // 余额转入失败不影响游戏启动，继续执行
      }
      
      // 构建 lobbyUrl（游戏关闭时的重定向地址，参考 tongmeng-main）
      // 检测是否为移动端
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // 如果没有提供 lobbyUrl，自动构建（参考 tongmeng-main）
      if (!lobbyUrl) {
        if (isMobileDevice) {
          // 移动端：使用游戏大厅页面
          lobbyUrl = `${window.location.origin}/gamelobby`;
        } else {
          // PC端：使用游戏大厅页面
          lobbyUrl = `${window.location.origin}/gamelobby`;
        }
      }
      
      // 调用新游戏接口获取游戏启动URL
      console.log('📞 准备调用新游戏接口 getLaunchUrl...');
      const result = await gameApiService.getLaunchUrl(
        vendorCode,
        gameCode,
        userCode,
        language,
        lobbyUrl
      );
      
      console.log('📥 获取启动URL响应:', result);
      
      if (result.success && result.message) {
        // 在新窗口打开游戏
        window.open(result.message as string, '_blank');
        return result.message;
      } else {
        const errorMsg = (result.message as string) || '获取游戏启动URL失败';
        console.error('❌ 获取游戏启动URL失败:', errorMsg, result);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || '启动游戏失败';
      setError(errorMsg);
      console.error('❌ 启动游戏失败:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getUserCode]);

  /**
   * 存款
   */
  const deposit = useCallback(async (amount: number, orderNo: string | null = null, vendorCode: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const userCode = await getUserCode();
      const result = await gameApiService.deposit(userCode, amount, orderNo, vendorCode);
      
      if (result.success) {
        // 更新余额
        await fetchUserBalance(userCode);
        return result.message;
      } else {
        throw new Error((result.message as string) || '存款失败');
      }
    } catch (err: any) {
      const errorMsg = err.message || '存款失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getUserCode, fetchUserBalance]);

  /**
   * 提款
   */
  const withdraw = useCallback(async (amount: number, orderNo: string | null = null, vendorCode: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const userCode = await getUserCode();
      const result = await gameApiService.withdraw(userCode, amount, orderNo, vendorCode);
      
      if (result.success) {
        // 更新余额
        await fetchUserBalance(userCode);
        return result.message;
      } else {
        throw new Error((result.message as string) || '提款失败');
      }
    } catch (err: any) {
      const errorMsg = err.message || '提款失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getUserCode, fetchUserBalance]);

  /**
   * 获取游戏详情
   */
  const fetchGameDetail = useCallback(async (vendorCode: string, gameCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gameApiService.getGameDetail(vendorCode, gameCode);
      if (result.success) {
        return result.message;
      } else {
        throw new Error((result.message as string) || '获取游戏详情失败');
      }
    } catch (err: any) {
      const errorMsg = err.message || '获取游戏详情失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // 状态
    loading,
    error,
    vendors,
    games,
    userBalance,
    
    // 方法
    fetchVendors,
    fetchGames,
    fetchUserBalance,
    launchGame,
    deposit,
    withdraw,
    fetchGameDetail,
    getUserCode,
  };
}
