# API 接口说明

本项目已添加登录注册功能和游戏接口，与 `stake-vue` 项目保持一致。

## 后端服务器

### 启动后端服务器

```bash
# 安装依赖
npm install

# 启动后端服务器（端口 3001）
npm run server

# 或使用 nodemon 自动重启（开发模式）
npm run dev:server
```

### API 端点

#### 认证相关 API

- `POST /api/auth/captcha` - 获取验证码
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/me` - 获取当前用户信息（需要认证）
- `POST /api/auth/logout` - 用户登出（需要认证）
- `POST /api/auth/info/update` - 更新用户信息（需要认证）
- `POST /api/auth/reset_pass` - 重置密码

#### 游戏相关 API

- `GET /api/game-api/vendors/list` - 获取供应商列表
- `POST /api/game-api/games/list` - 获取游戏列表
- `POST /api/game-api/game/detail` - 获取游戏详情
- `POST /api/game-api/game/launch-url` - 获取游戏启动URL（需要认证）
- `POST /api/game-api/user/create` - 创建游戏用户（需要认证）
- `POST /api/game-api/user/balance` - 获取用户余额（需要认证）
- `POST /api/game-api/user/deposit` - 存款（需要认证）
- `POST /api/game-api/user/withdraw` - 提款（需要认证）
- `POST /api/game-api/user/withdraw-all` - 全部提款（需要认证）
- `GET /api/game-api/status` - API状态检查

## 前端服务

### 认证服务 (`src/services/authService.ts`)

```typescript
import { authService } from '@/services/authService'

// 登录
const { data, error } = await authService.signIn('username', 'password', {
  captcha: '验证码',
  key: '验证码key'
})

// 注册
const { data, error } = await authService.signUp({
  name: '用户名',
  email: 'email@example.com',
  password: '密码',
  confirmPassword: '确认密码'
})

// 获取当前用户
const user = await authService.getCurrentUser()

// 获取会话
const session = await authService.getSession()

// 登出
await authService.signOut()

// 获取验证码
const { success, data } = await authService.getCaptcha()
```

### 游戏 API 服务 (`src/services/gameApiService.ts`)

```typescript
import { gameApiService } from '@/services/gameApiService'

// 获取供应商列表
const vendors = await gameApiService.getVendorsList()

// 获取游戏列表
const games = await gameApiService.getGamesList('PRAGMATIC', 'zh')

// 获取游戏详情
const gameDetail = await gameApiService.getGameDetail('PRAGMATIC', 'GAME001')

// 获取启动URL
const launchUrl = await gameApiService.getLaunchUrl(
  'PRAGMATIC',
  'GAME001',
  'userCode',
  'zh'
)

// 创建游戏用户
await gameApiService.createUser('userCode')

// 获取用户余额
const balance = await gameApiService.getUserBalance('userCode')

// 存款
await gameApiService.deposit('userCode', 100)

// 提款
await gameApiService.withdraw('userCode', 50)
```

## 环境变量

可以在 `.env` 文件中配置：

```env
# API 基础URL
VITE_API_BASE_URL=http://localhost:3001/api

# 游戏API基础URL
VITE_GAME_API_BASE_URL=http://localhost:3001

# 游戏API路径
VITE_GAME_API_PATH=/api/game-api

# JWT密钥（后端）
JWT_SECRET=your-secret-key-change-in-production
```

## 注意事项

1. **生产环境**：当前实现使用内存存储，生产环境应使用数据库（如 MongoDB、PostgreSQL 等）
2. **密码加密**：当前密码以明文存储，生产环境应使用 bcrypt 等加密库
3. **JWT密钥**：请在生产环境中更改 JWT_SECRET
4. **CORS配置**：确保后端 CORS 配置允许前端域名访问

## 与 stake-vue 的兼容性

本实现与 `stake-vue` 项目的 API 接口格式保持一致，包括：

- 相同的请求/响应格式
- 相同的错误处理方式
- 相同的认证机制（JWT Token）
- 相同的游戏 API 接口

可以直接在前端使用相同的服务调用方式。
