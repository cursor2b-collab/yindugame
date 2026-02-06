import React, { useState, useEffect, useCallback } from 'react';
import { register, getCaptcha, getUserInfo } from '@/lib/api/auth';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPass: '',
    realname: '',
    paypassword: '',
    lang: 'zh_cn',
    code: '',
    key: '',
    inviteCode: ''
  });
  const [captchaImage, setCaptchaImage] = useState('');
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // 从URL参数获取邀请码
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const inviteCode = searchParams.get('i') || '';
    if (inviteCode) {
      setFormData((prev) => ({ ...prev, inviteCode }));
    }
  }, []);

  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await getCaptcha();
      if (res.code === 200 && res.data) {
        const img = res.data.img || res.data.image || '';
        setCaptchaImage(img.startsWith('data:') ? img : 'data:image/png;base64,' + img);
        setFormData((prev) => ({ ...prev, key: res.data.key || res.data.captcha_key || '' }));
      }
    } catch (err) {
      console.error('Failed to get captcha', err);
    }
  }, []);

  useEffect(() => {
    refreshCaptcha();
    const lang = localStorage.getItem('ly_lang') || 'zh_cn';
    setFormData((prev) => ({ ...prev, lang }));
  }, [refreshCaptcha]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.password || !formData.confirmPass || !formData.paypassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPass) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.code) {
      setError('Please enter verification code');
      return;
    }

    // Auto generate default name
    const defaultNames = ['User1', 'User2', 'User3'];
    const randomName = defaultNames[Math.floor(Math.random() * defaultNames.length)];
    
    const registerData = {
      ...formData,
      realname: randomName
    };

    setLoading(true);
    try {
      const res = await register(registerData);
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
            window.location.href = '/';
          }, 1000);
        } else {
          setError('Registration failed: No token returned');
        }
      } else {
        setError(res.message || 'Registration failed');
        setFormData((prev) => ({ ...prev, code: '' }));
        refreshCaptcha();
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed, please try again later');
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
      background: '#151A23',
      position: 'relative',
      zIndex: 0
    }}>
      {/* Background Image */}
      <img
        src="/images/newimg/bg.avif"
        alt="Background"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Second Image Container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1
      }}>
        <img
          src="/image/banner/9f2a899d-8958-4f86-ab9f-938e5a20acf0.png"
          alt="Background"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            position: 'relative',
            zIndex: 1
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        
        {/* Tab Switch */}
        <div style={{
          position: 'absolute',
          top: '90%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px 0',
          lineHeight: 1,
          color: '#fff',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          <div style={{ 
            pointerEvents: 'auto', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%'
          }}>
            <div 
              onClick={() => window.location.href = '/login'} 
              style={{
                padding: '8px 20px',
                margin: '0 8px',
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer'
              }}
            >
              Login
            </div>
            <div style={{
              padding: '8px 20px',
              margin: '0 8px',
              fontSize: '18px',
              color: '#fff',
              cursor: 'pointer',
              position: 'relative',
              fontWeight: 500
            }}>
              Register
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '22px',
                backgroundImage: 'url(/images/newimg/daaf2.avif)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                zIndex: -1,
                pointerEvents: 'none'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ marginTop: '360px', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <form onSubmit={handleRegister}>
          {error && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              background: 'rgba(217, 28, 28, 0.1)',
              border: '1px solid rgba(217, 28, 28, 0.3)',
              borderRadius: '4px',
              color: '#d91c1c',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'name' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img 
                src="https://www.xpj00000.vip/loginImg/account.png" 
                style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} 
                alt="Username" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
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
                  color: focusedInput === 'name' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'password' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img 
                src="https://www.xpj00000.vip/loginImg/password.png" 
                style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} 
                alt="Password" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
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
                  color: focusedInput === 'password' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'confirmPass' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img 
                src="https://www.xpj00000.vip/loginImg/password.png" 
                style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} 
                alt="Confirm Password" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
              <input
                type="password"
                name="confirmPass"
                value={formData.confirmPass}
                onChange={handleChange}
                onFocus={() => setFocusedInput('confirmPass')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Confirm password"
                maxLength={32}
                autoComplete="new-password"
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: focusedInput === 'confirmPass' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* Payment Password */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'paypassword' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img 
                src="https://www.xpj00000.vip/loginImg/password.png" 
                style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} 
                alt="Payment Password" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
              <input
                type="password"
                name="paypassword"
                value={formData.paypassword}
                onChange={handleChange}
                onFocus={() => setFocusedInput('paypassword')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Enter payment password"
                maxLength={32}
                autoComplete="new-password"
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: focusedInput === 'paypassword' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* Invite Code (Optional) */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'inviteCode' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img 
                src="https://www.xpj00000.vip/loginImg/recommend.png" 
                style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} 
                alt="Invite Code" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
              <input
                type="text"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                onFocus={() => setFocusedInput('inviteCode')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Invite code (optional)"
                maxLength={50}
                style={{
                  flex: 1,
                  height: '100%',
                  fontSize: '16px',
                  color: focusedInput === 'inviteCode' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  caretColor: '#ffc53e'
                }}
              />
            </div>
          </div>

          {/* Verification Code */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              height: '44px',
              paddingLeft: '12px',
              paddingRight: '16px',
              background: 'rgba(0, 0, 0, 0.45098039215686275)',
              border: focusedInput === 'code' ? '1px solid #ffc53e' : '1px solid rgba(199, 218, 255, 0.0784313725490196)',
              borderRadius: '12px',
              position: 'relative',
              transition: 'border-color 0.3s ease'
            }}>
              <img 
                src="https://www.xpj00000.vip/loginImg/recommend.png" 
                style={{ width: '28px', flexShrink: 0, marginRight: '15px' }} 
                alt="Verification Code" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '16px', marginRight: '15px' }}>|</div>
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
                  color: focusedInput === 'code' ? 'hsla(0,0%,100%,.8509803921568627)' : '#fff',
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
                  height: '32px',
                  marginLeft: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                {captchaImage ? (
                  <img
                    src={captchaImage}
                    alt="Verification Code"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Click to refresh</span>
                )}
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              marginTop: '20px',
              background: 'linear-gradient(135deg, #ffc53e 0%, #ffb800 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.3s'
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
