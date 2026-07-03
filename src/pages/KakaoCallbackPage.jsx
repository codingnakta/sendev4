import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './AuthPage.css';

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const code = searchParams.get('code');
    const kakaoError = searchParams.get('error');

    if (kakaoError) {
      setError('카카오 로그인이 취소되었습니다.');
      return;
    }
    if (!code) {
      setError('잘못된 접근입니다.');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/kakao-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri: `${window.location.origin}/auth/kakao/callback` }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const credential = await signInWithCustomToken(auth, data.customToken);
        await setDoc(doc(db, 'users', credential.user.uid), {
          name: data.profile.name,
          email: data.profile.email,
          createdAt: new Date().toISOString(),
        }, { merge: true });
        navigate('/mypage', { replace: true });
      } catch {
        setError('카카오 로그인 중 오류가 발생했습니다.');
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo-row">
          <Link to="/" className="auth-logo">Showfolio ✦</Link>
        </div>
        {error ? (
          <>
            <div className="form-error-box">{error}</div>
            <Link to="/login" className="btn-auth-primary" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
              로그인으로 돌아가기
            </Link>
          </>
        ) : (
          <p className="auth-subtitle"><span className="spinner" /> 카카오 로그인 처리 중...</p>
        )}
      </div>
    </div>
  );
}
