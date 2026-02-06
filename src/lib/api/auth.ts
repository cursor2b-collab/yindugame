/**
 * 认证相关API - 参考 tongmeng-main
 */
import apiClient from './client';

export interface LoginRequest {
  name: string;
  password: string;
  code: string;
  key: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
  confirmPass: string;
  realname: string;
  paypassword: string;
  lang: string;
  code: string;
  inviteCode: string;
  key: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    api_token?: string;
    access_token?: string;
    user?: any;
  };
}

export interface CaptchaResponse {
  code: number;
  message: string;
  data: {
    img?: string;
    image?: string;
    key?: string;
    captcha_key?: string;
  };
}

// 登录
export const login = (data: LoginRequest): Promise<AuthResponse> => {
  const postData = {
    name: data.name,
    password: data.password,
    key: data.key || '',
    captcha: data.code || '',
    register_site: window.location.origin || ''
  };
  
  return apiClient.post('/auth/login', postData, {
    params: { lang: localStorage.getItem('ly_lang') || 'zh_cn' },
    headers: {
      Accept: 'application/json'
    }
  });
};

// 注册
export const register = (data: RegisterRequest): Promise<AuthResponse> => {
  const lang = data.lang || localStorage.getItem('ly_lang') || 'zh_cn';
  
  const postData: any = {
    name: data.name,
    password: data.password,
    password_confirmation: data.confirmPass || data.password,
    qk_pwd: data.paypassword,
    realname: data.realname || '',
    invite_code: data.inviteCode || '',
    register_site: window.location.origin || 'http://localhost:3000',
    lang: lang,
    is_mobile: 1
  };
  
  if (data.code && data.key) {
    postData.captcha = data.code;
    postData.key = data.key;
  }
  
  return apiClient.post('/auth/register?lang=' + encodeURIComponent(lang), postData);
};

// 获取验证码
export const getCaptcha = (): Promise<CaptchaResponse> => {
  return apiClient.post('/auth/captcha', {});
};

// 获取用户信息
export const getUserInfo = (): Promise<any> => {
  return apiClient.post('/auth/me', {});
};
