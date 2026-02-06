import React, { useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/authService';
import { X, Eye, EyeOff, Lock, User } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export default function LoginModal({ isOpen, onClose, defaultTab = 'login' }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    phone: '', 
    password: '', 
    code: '', 
    key: '' 
  });
  const [registerData, setRegisterData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    code: '',
    key: '',
    agreeTerms: false
  });
  const [captchaImage, setCaptchaImage] = useState('');
  const [error, setError] = useState('');

  // 获取验证码
  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await authService.getCaptcha();
      if (res.success && res.data) {
        const img = res.data.image || '';
        setCaptchaImage(img.startsWith('data:') ? img : 'data:image/png;base64,' + img);
        setFormData((prev) => ({ ...prev, key: res.data.key || '' }));
        setRegisterData((prev) => ({ ...prev, key: res.data.key || '' }));
      }
    } catch (err) {
      console.error('获取验证码失败:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshCaptcha();
      setActiveTab(defaultTab);
      setError('');
    }
  }, [isOpen, defaultTab, refreshCaptcha]);

  // 登录表单变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // 注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegisterData({ 
      ...registerData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    setError('');
  };

  // 登录处理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone || !formData.password) {
      setError('请输入手机号和密码');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.signIn(formData.phone, formData.password, {
        captcha: formData.code,
        key: formData.key
      });

      if (result.error) {
        setError(result.error.message || '登录失败');
        setFormData((prev) => ({ ...prev, code: '' }));
        refreshCaptcha();
      } else {
        if (result.data?.user) {
          localStorage.setItem('userInfo', JSON.stringify(result.data.user));
        }
        
        window.dispatchEvent(new CustomEvent('auth-storage-change', {
          detail: { key: 'token', value: result.data?.token }
        }));

        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (err: any) {
      setError(err?.message || '登录失败，请稍后重试');
      setFormData((prev) => ({ ...prev, code: '' }));
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerData.phone || !registerData.password || !registerData.confirmPassword) {
      setError('请填写所有必填项');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (registerData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    if (!registerData.agreeTerms) {
      setError('请同意用户协议');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.signUp({
        name: registerData.phone,
        phone: registerData.phone,
        password: registerData.password,
        captcha: registerData.code,
        key: registerData.key
      });

      if (result.error) {
        setError(result.error.message || '注册失败');
        setRegisterData((prev) => ({ ...prev, code: '' }));
        refreshCaptcha();
      } else {
        if (result.data?.user) {
          localStorage.setItem('userInfo', JSON.stringify(result.data.user));
        }

        window.dispatchEvent(new CustomEvent('auth-storage-change', {
          detail: { key: 'token', value: result.data?.token }
        }));

        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (err: any) {
      setError(err?.message || '注册失败，请稍后重试');
      setRegisterData((prev) => ({ ...prev, code: '' }));
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[420px] mx-4">
        {/* 弹窗主体 */}
        <div 
          className="rounded-[10px] overflow-hidden shadow-2xl border border-white/10"
          style={{ 
            borderRadius: '10px',
            backgroundColor: '#2a2118',
            background: '#2a2118'
          }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-6 h-6 flex items-center justify-center text-white hover:text-zinc-300 transition-colors"
            style={{ fontSize: '24px', lineHeight: '24px' }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* 标签导航 */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="flex relative">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`relative flex-1 py-2 text-center font-medium transition-all ${
                  activeTab === 'login'
                    ? 'text-white'
                    : 'text-zinc-400'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                className={`relative flex-1 py-2 text-center font-medium transition-all ${
                  activeTab === 'register'
                    ? 'text-white'
                    : 'text-zinc-400'
                }`}
              >
                Registro
              </button>
              {/* 活动标签下的三角形指示器 */}
              <div 
                className={`absolute bottom-0 h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white transition-all duration-300 ${
                  activeTab === 'login' ? 'left-0' : 'left-1/2'
                }`}
                style={{
                  transform: activeTab === 'register' ? 'translateX(-50%)' : 'none'
                }}
              />
            </div>
          </div>

          {/* 表单内容区域 */}
          <div className="px-6 pb-6">
            {activeTab === 'login' ? (
              /* 登录表单 */
              <form onSubmit={handleLogin} className="space-y-0">
                {/* 手机号输入 */}
                <div className="input-group" style={{ marginTop: '0' }}>
                  <div 
                    className="flex items-center"
                    style={{
                      padding: '0px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      height: '45px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgb(255, 255, 255)'
                    }}
                  >
                    <div className="flex items-center mr-2" style={{ color: 'rgb(196, 180, 155)' }}>
                      <User className="w-[19px] h-[19px]" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 border-0 outline-none text-white"
                      style={{ 
                        fontSize: '15px',
                        backgroundColor: 'transparent',
                        color: 'rgb(255, 255, 255)'
                      }}
                      placeholder="Telefone"
                      maxLength={11}
                      required
                    />
                  </div>
                </div>

                {/* 密码输入 */}
                <div className="input-group" style={{ marginTop: '10px' }}>
                  <div 
                    className="flex items-center"
                    style={{
                      padding: '0px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      height: '45px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgb(255, 255, 255)'
                    }}
                  >
                    <div className="flex items-center mr-2" style={{ color: 'rgb(196, 180, 155)' }}>
                      <Lock className="w-[19px] h-[19px]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="flex-1 border-0 outline-none text-white"
                      style={{ 
                        fontSize: '15px',
                        backgroundColor: 'transparent',
                        color: 'rgb(255, 255, 255)'
                      }}
                      placeholder="Senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2"
                      style={{ color: 'rgb(196, 180, 155)' }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-[19px] h-[19px]" />
                      ) : (
                        <Eye className="w-[19px] h-[19px]" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center mt-4">{error}</div>
                )}

                {/* 登录按钮 */}
                <div style={{ marginTop: '20px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-medium text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(rgb(253, 255, 171) 0%, rgb(208, 161, 56) 52%, rgb(238, 213, 98) 100%)',
                      boxShadow: 'rgb(197, 150, 46) 0px -3px 0px 0px inset',
                      height: '45px',
                      color: 'rgb(0, 0, 0)',
                      border: 'medium',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </div>
              </form>
            ) : (
              /* 注册表单 */
              <form onSubmit={handleRegister} className="space-y-0">
                {/* 手机号输入 */}
                <div className="input-group" style={{ marginTop: '0' }}>
                  <div 
                    className="flex items-center"
                    style={{
                      padding: '0px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      height: '45px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgb(255, 255, 255)'
                    }}
                  >
                    <div className="flex items-center mr-2" style={{ color: 'rgb(196, 180, 155)' }}>
                      <User className="w-[19px] h-[19px]" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-[rgb(192,196,204)]"
                      style={{ fontSize: '15px' }}
                      placeholder="Telefone"
                      maxLength={11}
                      required
                    />
                  </div>
                </div>

                {/* 密码输入 */}
                <div className="input-group" style={{ marginTop: '10px' }}>
                  <div 
                    className="flex items-center"
                    style={{
                      padding: '0px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      height: '45px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgb(255, 255, 255)'
                    }}
                  >
                    <div className="flex items-center mr-2" style={{ color: 'rgb(196, 180, 155)' }}>
                      <Lock className="w-[19px] h-[19px]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-[rgb(192,196,204)]"
                      style={{ fontSize: '15px' }}
                      placeholder="Senha"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2"
                      style={{ color: 'rgb(196, 180, 155)' }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-[19px] h-[19px]" />
                      ) : (
                        <Eye className="w-[19px] h-[19px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 确认密码输入 */}
                <div className="input-group" style={{ marginTop: '10px' }}>
                  <div 
                    className="flex items-center"
                    style={{
                      padding: '0px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      height: '45px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgb(255, 255, 255)'
                    }}
                  >
                    <div className="flex items-center mr-2" style={{ color: 'rgb(196, 180, 155)' }}>
                      <Lock className="w-[19px] h-[19px]" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="flex-1 bg-transparent border-0 outline-none text-white placeholder:text-[rgb(192,196,204)]"
                      style={{ fontSize: '15px' }}
                      placeholder="Confirmar senha"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="ml-2"
                      style={{ color: 'rgb(196, 180, 155)' }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-[19px] h-[19px]" />
                      ) : (
                        <Eye className="w-[19px] h-[19px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 同意条款复选框 */}
                <div className="flex items-start gap-3 py-4">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={registerData.agreeTerms}
                    onChange={handleRegisterChange}
                    className="mt-1 w-5 h-5 rounded border-white/20 bg-[rgba(255,255,255,0.04)] text-amber-500 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <label className="text-sm text-zinc-300 leading-relaxed cursor-pointer">
                    Tenho +18 anos, li e concordo com os Termos de Uso{' '}
                    <span className="text-orange-500 underline cursor-pointer">《Acordo de Usuário》</span>
                  </label>
                </div>

                {error && (
                  <div className="text-red-400 text-sm text-center mb-4">{error}</div>
                )}

                {/* 注册按钮 */}
                <div style={{ marginTop: '20px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-medium text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(rgb(253, 255, 171) 0%, rgb(208, 161, 56) 52%, rgb(238, 213, 98) 100%)',
                      boxShadow: 'rgb(197, 150, 46) 0px -3px 0px 0px inset',
                      height: '45px',
                      color: 'rgb(0, 0, 0)',
                      border: 'medium',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {loading ? 'Registrando...' : 'Registro'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
