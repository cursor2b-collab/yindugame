/**
 * 后端 API 服务器
 * 提供登录注册和游戏接口功能
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const svgCaptcha = require('svg-captcha');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 内存存储（生产环境应使用数据库）
const users = new Map();
const captchaStore = new Map();
const gameUsers = new Map(); // 游戏用户数据

// 辅助函数：生成 JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// 辅助函数：验证 token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 中间件：验证认证
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: '未提供认证令牌'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: '无效的认证令牌'
    });
  }

  req.userId = decoded.userId;
  next();
}

// ==================== 认证相关 API ====================

/**
 * 获取验证码
 * POST /api/auth/captcha
 */
app.post('/api/auth/captcha', (req, res) => {
  try {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      background: '#f0f0f0'
    });

    const key = crypto.randomBytes(16).toString('hex');
    captchaStore.set(key, captcha.text.toLowerCase());

    // 设置过期时间（5分钟）
    setTimeout(() => {
      captchaStore.delete(key);
    }, 5 * 60 * 1000);

    res.json({
      status: 'success',
      code: 200,
      data: {
        key: key,
        img: 'data:image/svg+xml;base64,' + Buffer.from(captcha.data).toString('base64')
      },
      message: ''
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: '获取验证码失败'
    });
  }
});

/**
 * 用户登录
 * POST /api/auth/login
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { name, password, captcha, key } = req.body;

    // 验证验证码
    if (key && captcha) {
      const storedCaptcha = captchaStore.get(key);
      if (!storedCaptcha || storedCaptcha !== captcha.toLowerCase()) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: '验证码错误'
        });
      }
      // 验证成功后删除验证码
      captchaStore.delete(key);
    }

    if (!name || !password) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: '用户名和密码不能为空'
      });
    }

    // 查找用户（简单验证，生产环境应使用数据库和密码哈希）
    const user = Array.from(users.values()).find(u => 
      (u.name === name || u.email === name) && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: '用户名或密码错误'
      });
    }

    const token = generateToken(user.id);

    res.json({
      status: 'success',
      code: 200,
      data: {
        access_token: token,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          balance: user.balance || 0
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: '登录失败：' + error.message
    });
  }
});

/**
 * 用户注册
 * POST /api/auth/register
 */
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: '请填写完整的注册信息'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: '两次输入的密码不一致'
      });
    }

    // 检查用户是否已存在
    const existingUser = Array.from(users.values()).find(u => 
      u.name === name || u.email === email
    );

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: '用户名或邮箱已存在'
      });
    }

    // 创建新用户
    const userId = crypto.randomBytes(16).toString('hex');
    const newUser = {
      id: userId,
      name: name,
      email: email,
      password: password, // 生产环境应使用 bcrypt 加密
      balance: 0,
      createdAt: new Date().toISOString()
    };

    users.set(userId, newUser);

    const token = generateToken(userId);

    res.json({
      status: 'success',
      code: 200,
      success: true,
      data: {
        token: token,
        access_token: token,
        user: {
          id: userId,
          name: name,
          email: email,
          balance: 0
        }
      },
      message: '注册成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: '注册失败：' + error.message
    });
  }
});

/**
 * 获取当前用户信息
 * POST /api/auth/me
 */
app.post('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      status: 'success',
      code: 200,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance || 0
      },
      message: ''
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: '获取用户信息失败'
    });
  }
});

/**
 * 用户登出
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    status: 'success',
    code: 200,
    message: '登出成功'
  });
});

/**
 * 更新用户信息
 * POST /api/auth/info/update
 */
app.post('/api/auth/info/update', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: '用户不存在'
      });
    }

    // 更新用户信息
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    users.set(req.userId, user);

    res.json({
      status: 'success',
      code: 200,
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance || 0
      },
      message: '更新成功'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: '更新失败'
    });
  }
});

/**
 * 重置密码
 * POST /api/auth/reset_pass
 */
app.post('/api/auth/reset_pass', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: '请提供邮箱地址'
      });
    }

    // 查找用户
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: '该邮箱未注册'
      });
    }

    // 这里应该发送重置密码邮件，暂时只返回成功
    res.json({
      status: 'success',
      code: 200,
      success: true,
      data: {},
      message: '重置密码链接已发送到您的邮箱'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: '重置密码失败'
    });
  }
});

// ==================== 游戏相关 API ====================

/**
 * 获取供应商列表
 * GET /api/game-api/vendors/list
 */
app.get('/api/game-api/vendors/list', (req, res) => {
  try {
    // 示例供应商列表
    const vendors = [
      { code: 'PRAGMATIC', name: 'Pragmatic Play' },
      { code: 'EVOLUTION', name: 'Evolution Gaming' },
      { code: 'NETENT', name: 'NetEnt' },
      { code: 'MICROGAMING', name: 'Microgaming' },
      { code: 'PLAYTECH', name: 'Playtech' }
    ];

    res.json({
      success: true,
      errorCode: 0,
      message: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '获取供应商列表失败'
    });
  }
});

/**
 * 获取游戏列表
 * POST /api/game-api/games/list
 */
app.post('/api/game-api/games/list', (req, res) => {
  try {
    const { vendorCode, language = 'zh' } = req.body;

    // 示例游戏列表（参考 stake-vue 的格式，确保包含 gameCode 和 vendorCode）
    const games = [
      {
        gameCode: 'GAME001',
        code: 'GAME001',
        gameName: '示例游戏1',
        name: '示例游戏1',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME001'
      },
      {
        gameCode: 'GAME002',
        code: 'GAME002',
        gameName: '示例游戏2',
        name: '示例游戏2',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME002'
      },
      {
        gameCode: 'GAME003',
        code: 'GAME003',
        gameName: '示例游戏3',
        name: '示例游戏3',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME003'
      },
      {
        gameCode: 'GAME004',
        code: 'GAME004',
        gameName: '示例游戏4',
        name: '示例游戏4',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME004'
      },
      {
        gameCode: 'GAME005',
        code: 'GAME005',
        gameName: '示例游戏5',
        name: '示例游戏5',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME005'
      },
      {
        gameCode: 'GAME006',
        code: 'GAME006',
        gameName: '示例游戏6',
        name: '示例游戏6',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME006'
      },
      {
        gameCode: 'GAME007',
        code: 'GAME007',
        gameName: '示例游戏7',
        name: '示例游戏7',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME007'
      },
      {
        gameCode: 'GAME008',
        code: 'GAME008',
        gameName: '示例游戏8',
        name: '示例游戏8',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME008'
      },
      {
        gameCode: 'GAME009',
        code: 'GAME009',
        gameName: '示例游戏9',
        name: '示例游戏9',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME009'
      },
      {
        gameCode: 'GAME010',
        code: 'GAME010',
        gameName: '示例游戏10',
        name: '示例游戏10',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME010'
      },
      {
        gameCode: 'GAME011',
        code: 'GAME011',
        gameName: '示例游戏11',
        name: '示例游戏11',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME011'
      },
      {
        gameCode: 'GAME012',
        code: 'GAME012',
        gameName: '示例游戏12',
        name: '示例游戏12',
        vendorCode: vendorCode || 'PRAGMATIC',
        vendorName: 'Pragmatic Play',
        category: 'slots',
        thumbnail: 'https://via.placeholder.com/300x200',
        imageUrl: 'https://via.placeholder.com/300x200',
        image: 'https://via.placeholder.com/300x200',
        id: 'GAME012'
      }
    ];

    res.json({
      success: true,
      errorCode: 0,
      message: games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '获取游戏列表失败'
    });
  }
});

/**
 * 获取游戏详情
 * POST /api/game-api/game/detail
 */
app.post('/api/game-api/game/detail', (req, res) => {
  try {
    const { vendorCode, gameCode } = req.body;

    const gameDetail = {
      code: gameCode,
      name: '示例游戏',
      vendorCode: vendorCode,
      description: '这是一个示例游戏',
      image: 'https://via.placeholder.com/300x200',
      category: 'slots'
    };

    res.json({
      success: true,
      errorCode: 0,
      message: gameDetail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '获取游戏详情失败'
    });
  }
});

/**
 * 获取启动URL
 * POST /api/game-api/game/launch-url
 */
app.post('/api/game-api/game/launch-url', authenticateToken, (req, res) => {
  try {
    const { vendorCode, gameCode, userCode, language = 'zh', lobbyUrl } = req.body;

    if (!vendorCode || !gameCode || !userCode) {
      return res.status(400).json({
        success: false,
        errorCode: 422,
        message: '缺少必需参数'
      });
    }

    // 确保游戏用户已创建
    if (!gameUsers.has(userCode)) {
      gameUsers.set(userCode, {
        userCode: userCode,
        balance: 0,
        createdAt: new Date().toISOString()
      });
    }

    // 生成游戏启动URL（示例）
    const launchUrl = `https://example-game-provider.com/game?vendor=${vendorCode}&game=${gameCode}&user=${userCode}&lang=${language}`;

    res.json({
      success: true,
      errorCode: 0,
      message: launchUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '获取启动URL失败'
    });
  }
});

/**
 * 创建游戏用户
 * POST /api/game-api/user/create
 */
app.post('/api/game-api/user/create', authenticateToken, (req, res) => {
  try {
    const { userCode } = req.body;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        errorCode: 422,
        message: '用户代码不能为空'
      });
    }

    // 检查用户是否已存在
    if (gameUsers.has(userCode)) {
      return res.json({
        success: true,
        errorCode: 1, // 1 表示用户已存在
        message: '用户已存在'
      });
    }

    // 创建新游戏用户
    gameUsers.set(userCode, {
      userCode: userCode,
      balance: 0,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      errorCode: 0,
      message: '用户创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '创建用户失败'
    });
  }
});

/**
 * 获取用户余额
 * POST /api/game-api/user/balance
 */
app.post('/api/game-api/user/balance', authenticateToken, (req, res) => {
  try {
    const { userCode } = req.body;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        errorCode: 422,
        message: '用户代码不能为空'
      });
    }

    const gameUser = gameUsers.get(userCode);
    const balance = gameUser ? gameUser.balance : 0;

    res.json({
      success: true,
      errorCode: 0,
      message: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '获取余额失败'
    });
  }
});

/**
 * 存款
 * POST /api/game-api/user/deposit
 */
app.post('/api/game-api/user/deposit', authenticateToken, (req, res) => {
  try {
    const { userCode, balance, orderNo, vendorCode } = req.body;

    if (!userCode || balance === undefined) {
      return res.status(400).json({
        success: false,
        errorCode: 422,
        message: '缺少必需参数'
      });
    }

    let gameUser = gameUsers.get(userCode);
    if (!gameUser) {
      gameUser = {
        userCode: userCode,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      gameUsers.set(userCode, gameUser);
    }

    gameUser.balance += parseFloat(balance);
    gameUsers.set(userCode, gameUser);

    res.json({
      success: true,
      errorCode: 0,
      message: `存款成功，当前余额：${gameUser.balance}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '存款失败'
    });
  }
});

/**
 * 提款
 * POST /api/game-api/user/withdraw
 */
app.post('/api/game-api/user/withdraw', authenticateToken, (req, res) => {
  try {
    const { userCode, balance, orderNo, vendorCode } = req.body;

    if (!userCode || balance === undefined) {
      return res.status(400).json({
        success: false,
        errorCode: 422,
        message: '缺少必需参数'
      });
    }

    const gameUser = gameUsers.get(userCode);
    if (!gameUser) {
      return res.status(404).json({
        success: false,
        errorCode: 404,
        message: '用户不存在'
      });
    }

    if (gameUser.balance < parseFloat(balance)) {
      return res.status(400).json({
        success: false,
        errorCode: 400,
        message: '余额不足'
      });
    }

    gameUser.balance -= parseFloat(balance);
    gameUsers.set(userCode, gameUser);

    res.json({
      success: true,
      errorCode: 0,
      message: `提款成功，当前余额：${gameUser.balance}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '提款失败'
    });
  }
});

/**
 * 全部提款
 * POST /api/game-api/user/withdraw-all
 */
app.post('/api/game-api/user/withdraw-all', authenticateToken, (req, res) => {
  try {
    const { userCode, vendorCode } = req.body;

    if (!userCode) {
      return res.status(400).json({
        success: false,
        errorCode: 422,
        message: '用户代码不能为空'
      });
    }

    const gameUser = gameUsers.get(userCode);
    if (!gameUser) {
      return res.status(404).json({
        success: false,
        errorCode: 404,
        message: '用户不存在'
      });
    }

    const balance = gameUser.balance;
    gameUser.balance = 0;
    gameUsers.set(userCode, gameUser);

    res.json({
      success: true,
      errorCode: 0,
      message: `全部提款成功，提款金额：${balance}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 500,
      message: '全部提款失败'
    });
  }
});

/**
 * API状态检查
 * GET /api/game-api/status
 */
app.get('/api/game-api/status', (req, res) => {
  res.json({
    success: true,
    errorCode: 0,
    message: 'API运行正常'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API 基础路径: http://localhost:${PORT}/api`);
});

module.exports = app;
