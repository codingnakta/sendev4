import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './AuthPage.css';

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/invalid-email': '올바른 이메일 주소를 입력해주세요.',
  'auth/user-not-found': '가입되지 않은 이메일입니다.',
  'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '너무 많이 시도했습니다. 잠시 후 다시 시도해주세요.',
  'auth/network-request-failed': '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'auth/account-exists-with-different-credential': '이미 다른 방식으로 가입된 이메일입니다.',
  'auth/popup-blocked': '팝업이 차단되었습니다. 브라우저 팝업 차단을 해제해주세요.',
};

function getAuthErrorMessage(err) {
  return AUTH_ERROR_MESSAGES[err.code] || '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '', general: '' }));
  };

  const handleLogin = async () => {
    const e = {};
    if (!form.email.includes('@')) e.email = '올바른 이메일 주소를 입력해주세요.';
    if (!form.password) e.password = '비밀번호를 입력해주세요.';
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate('/mypage');
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: getAuthErrorMessage(err) }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      setErrors((prev) => ({ ...prev, general: '카카오 SDK를 불러오지 못했습니다.' }));
      return;
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }

    // 카카오 JS SDK v2는 팝업 로그인을 지원하지 않아 인가 코드 방식(리다이렉트)으로 진행 —
    // 로그인 완료 후 KakaoCallbackPage(/auth/kakao/callback)에서 이어서 처리한다.
    window.Kakao.Auth.authorize({
      redirectUri: `${window.location.origin}/auth/kakao/callback`,
    });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await setDoc(doc(db, 'users', credential.user.uid), {
        name: credential.user.displayName || '',
        email: credential.user.email || '',
        createdAt: new Date().toISOString(),
      }, { merge: true });
      navigate('/mypage');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setErrors((prev) => ({ ...prev, general: getAuthErrorMessage(err) }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo-row">
          <Link to="/" className="auth-logo">Showfolio ✦</Link>
        </div>

        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">계정에 로그인하여 작품 활동을 이어가세요.</p>

        <div className="auth-form">
          {errors.general && (
            <div className="form-error-box">{errors.general}</div>
          )}

          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label className="form-label">비밀번호</label>
              <button type="button" className="forgot-link">비밀번호 찾기</button>
            </div>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <label className="remember-row">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => set('remember', e.target.checked)}
            />
            <span className="remember-label">로그인 상태 유지</span>
          </label>

          <button
            className={`btn-auth-primary ${loading ? 'loading' : ''}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> 로그인 중...</> : '로그인'}
          </button>

          <div className="divider-row">
            <span className="divider-line" /><span className="divider-text">또는</span><span className="divider-line" />
          </div>

          <div className="social-btns">
            <button type="button" className="social-btn google" onClick={handleGoogleLogin} disabled={loading}>
              <GoogleIcon /> Google로 계속하기
            </button>
            <button type="button" className="social-btn kakao" onClick={handleKakaoLogin} disabled={loading}>
              <KakaoIcon /> 카카오로 계속하기
            </button>
          </div>

          <p className="auth-switch">
            아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E">
      <path d="M12 3C6.477 3 2 6.582 2 11c0 2.857 1.754 5.37 4.393 6.897L5.25 21.5l4.148-2.763C10.142 18.906 11.058 19 12 19c5.523 0 10-3.582 10-8S17.523 3 12 3z"/>
    </svg>
  );
}
