import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { login, getCaptcha, getUserInfo } from '@/lib/api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', password: '', code: '', key: '' });
  const [captchaImage, setCaptchaImage] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await getCaptcha();
      if (res.code === 200 && res.data) {
        const img = res.data.img || res.data.image || '';
        setCaptchaImage(img.startsWith('data:') ? img : 'data:image/png;base64,' + img);
        setFormData((prev) => ({ ...prev, key: res.data.key || res.data.captcha_key || '' }));
      }
    } catch (err) {
      console.error('Failed to get captcha:', err);
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.password) {
      setError('Please enter username and password');
      return;
    }
    if (!formData.code) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData);
      if (res.code === 200) {
        const token = res.data && (res.data.api_token || res.data.access_token);
        if (token) {
          sessionStorage.setItem('token', token);
          localStorage.setItem('token', token);
          
          try {
            const userRes = await getUserInfo();
            if (userRes.code === 200 && userRes.data) {
              const userData = {
                ...userRes.data,
                username: userRes.data.username || userRes.data.name,
                balance: userRes.data.balance || userRes.data.money || 0
              };
              localStorage.setItem('userInfo', JSON.stringify(userData));
            }
          } catch (userErr) {
            console.error('Failed to get user info:', userErr);
          }
          
          window.dispatchEvent(new Event('authStateChange'));
          
          setTimeout(() => {
            sessionStorage.setItem('hasVisited', 'false');
            navigate('/');
          }, 1000);
        } else {
          setError('Login failed: No token returned');
        }
      } else {
        setError(res.message || 'Login failed');
        setFormData((prev) => ({ ...prev, code: '' }));
        refreshCaptcha();
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed, please try again later');
      setFormData((prev) => ({ ...prev, code: '' }));
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      overflow: 'auto',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #151A23 50%, #0a0a0a 100%)',
      position: 'relative',
      zIndex: 0,
      paddingBottom: '40px'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 197, 62, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 197, 62, 0.03) 0%, transparent 50%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 100,
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 197, 62, 0.2)';
          e.currentTarget.style.borderColor = '#ffc53e';
          e.currentTarget.style.transform = 'translateX(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <ArrowLeft size={24} color="#ffc53e" />
      </button>

      {/* Tab Navigation */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '30px 20px 20px',
        zIndex: 1,
        position: 'relative'
      }}>
          <div style={{
            padding: '10px 24px',
            fontSize: '18px',
            fontWeight: 600,
            color: '#ffc53e',
            position: 'relative',
            cursor: 'default',
            textShadow: '0 0 10px rgba(255, 197, 62, 0.5)'
          }}>
            Login
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #ffc53e, transparent)',
              borderRadius: '2px',
              boxShadow: '0 0 8px rgba(255, 197, 62, 0.6)'
            }} />
          </div>
          <div 
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 24px',
              fontSize: '18px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
          >
            Register
          </div>
        </div>

      {/* Content Area */}
      <div style={{
        maxWidth: '420px',
        margin: '0 auto',
        padding: '0 20px',
        position: 'relative',
        zIndex: 2
      }}>
        <form onSubmit={handleLogin}>
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 16px',
              background: 'rgba(217, 28, 28, 0.15)',
              border: '1px solid rgba(217, 28, 28, 0.4)',
              borderRadius: '12px',
              color: '#ff6b6b',
              fontSize: '14px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(217, 28, 28, 0.2)'
            }}>
              {error}
            </div>
          )}

          {/* Username Input */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '52px',
              paddingLeft: '16px',
              paddingRight: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: focusedInput === 'name' 
                ? '2px solid #ffc53e' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxShadow: focusedInput === 'name' 
                ? '0 0 0 4px rgba(255, 197, 62, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 197, 62, 0.7)" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Enter username"
                maxLength={50}
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '52px',
              paddingLeft: '16px',
              paddingRight: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: focusedInput === 'password' 
                ? '2px solid #ffc53e' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxShadow: focusedInput === 'password' 
                ? '0 0 0 4px rgba(255, 197, 62, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 197, 62, 0.7)" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Enter password"
                maxLength={32}
                autoComplete="new-password"
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* Verification Code Input */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '52px',
              paddingLeft: '16px',
              paddingRight: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: focusedInput === 'code' 
                ? '2px solid #ffc53e' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxShadow: focusedInput === 'code' 
                ? '0 0 0 4px rgba(255, 197, 62, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 197, 62, 0.7)" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                onFocus={() => setFocusedInput('code')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Enter verification code"
                maxLength={6}
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
              <div
                onClick={refreshCaptcha}
                style={{
                  width: '100px',
                  height: '36px',
                  marginLeft: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 197, 62, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {captchaImage ? (
                  <img
                    src={captchaImage}
                    alt="Verification Code"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>Refresh</span>
                )}
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '52px',
              marginBottom: '20px',
              background: loading 
                ? 'rgba(255, 197, 62, 0.5)' 
                : 'linear-gradient(135deg, #ffc53e 0%, #ffb800 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontSize: '18px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading
                ? 'none'
                : '0 4px 16px rgba(255, 197, 62, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 197, 62, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 197, 62, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
