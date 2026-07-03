import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './AuthPage.css';

const AUTH_ERROR_MESSAGES = {
  'auth/account-exists-with-different-credential': '이미 다른 방식으로 가입된 이메일입니다.',
  'auth/popup-blocked': '팝업이 차단되었습니다. 브라우저 팝업 차단을 해제해주세요.',
  'auth/network-request-failed': '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

function getAuthErrorMessage(err) {
  return AUTH_ERROR_MESSAGES[err.code] || '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
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

const MAJORS = [
  '시각디자인', 'UI/UX 디자인', '영상/미디어', '일러스트레이션',
  '제품디자인', '3D/모션', '그래픽디자인', '사진', '파인아트', '기타',
];

const INTERESTS = ['UI/UX', '일러스트', '3D', '그래픽', '영상', '브랜딩', '제품디자인', 'AI아트', '타이포그래피', '사진'];

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    username: '',
    major: '',
    university: '',
    interests: [],
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleInterest = (tag) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag],
    }));
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.name.trim()) e.name = '이름을 입력해주세요.';
    if (form.username.trim().length < 2) e.username = '닉네임은 2자 이상이어야 합니다.';
    if (!form.major) e.major = '전공을 선택해주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGoogleSignup = async () => {
    if (!form.agreeTerms || !form.agreePrivacy) {
      setErrors((prev) => ({ ...prev, agree: '필수 약관에 동의해주세요.' }));
      return;
    }
    setSubmitting(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      setGoogleUser(credential.user);
      set('name', credential.user.displayName || '');
      setStep(2);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setErrors((prev) => ({ ...prev, submit: getAuthErrorMessage(err) }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (step === 2 && validateStep2() && googleUser) {
      setSubmitting(true);
      try {
        await setDoc(doc(db, 'users', googleUser.uid), {
          name: form.name,
          email: googleUser.email || '',
          username: form.username,
          major: form.major,
          university: form.university,
          interests: form.interests,
          agreeMarketing: form.agreeMarketing,
          createdAt: new Date().toISOString(),
        }, { merge: true });
        setStep(3);
      } catch (err) {
        setErrors((prev) => ({ ...prev, submit: getAuthErrorMessage(err) }));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleComplete = () => navigate('/');

  return (
    <div className="auth-page">
      <div className="auth-box signup-box">
        {/* Header */}
        <div className="auth-logo-row">
          <Link to="/" className="auth-logo">Showfolio ✦</Link>
        </div>

        {step < 3 && (
          <>
            <h1 className="auth-title">회원가입</h1>

            {/* Step indicator */}
            <div className="step-indicator">
              {[1, 2].map((s) => (
                <div key={s} className={`step-dot ${step >= s ? 'done' : ''} ${step === s ? 'current' : ''}`}>
                  {step > s ? '✓' : s}
                </div>
              ))}
              <div className="step-line" style={{ width: step === 2 ? '100%' : '0%' }} />
            </div>
            <p className="step-label">
              {step === 1 ? '약관에 동의하고 Google로 가입해주세요' : '프로필을 설정해주세요'}
            </p>
          </>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="auth-form">
            <div className="agree-section">
              <label className="agree-all-row">
                <input
                  type="checkbox"
                  checked={form.agreeTerms && form.agreePrivacy && form.agreeMarketing}
                  onChange={(e) => {
                    set('agreeTerms', e.target.checked);
                    set('agreePrivacy', e.target.checked);
                    set('agreeMarketing', e.target.checked);
                  }}
                />
                <span className="agree-all-label">전체 동의</span>
              </label>
              <div className="agree-divider" />
              {[
                { key: 'agreeTerms', label: '이용약관 동의', required: true, link: '보기' },
                { key: 'agreePrivacy', label: '개인정보 처리방침 동의', required: true, link: '보기' },
                { key: 'agreeMarketing', label: '마케팅 정보 수신 동의', required: false, link: null },
              ].map(({ key, label, required, link }) => (
                <label key={key} className="agree-row">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  <span className="agree-label">
                    <span className={`agree-required ${required ? 'req' : 'opt'}`}>
                      {required ? '(필수)' : '(선택)'}
                    </span>
                    {label}
                  </span>
                  {link && <span className="agree-link">{link}</span>}
                </label>
              ))}
              {errors.agree && <p className="form-error">{errors.agree}</p>}
              {errors.submit && <p className="form-error">{errors.submit}</p>}
            </div>

            <button className="btn-auth-primary social-btn google" onClick={handleGoogleSignup} disabled={submitting}>
              <GoogleIcon /> {submitting ? '처리 중...' : 'Google로 회원가입'}
            </button>

            <p className="auth-switch">
              이미 계정이 있으신가요? <Link to="/login">로그인</Link>
            </p>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">이름 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.name ? 'error' : ''}`}
                type="text"
                placeholder="실명을 입력해주세요"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">닉네임 <span className="required">*</span></label>
              <div className="input-row">
                <input
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  type="text"
                  placeholder="영문, 숫자, 언더스코어 사용 가능"
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                />
                <button className="btn-check">중복확인</button>
              </div>
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">학교</label>
              <input
                className="form-input"
                type="text"
                placeholder="재학 중인 학교명을 입력해주세요"
                value={form.university}
                onChange={(e) => set('university', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">전공 / 분야 <span className="required">*</span></label>
              <select
                className={`form-input ${errors.major ? 'error' : ''}`}
                value={form.major}
                onChange={(e) => set('major', e.target.value)}
              >
                <option value="">전공을 선택해주세요</option>
                {MAJORS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.major && <p className="form-error">{errors.major}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">관심 분야 <span className="form-label-sub">(최대 3개)</span></label>
              <div className="interest-chips">
                {INTERESTS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`interest-chip ${form.interests.includes(tag) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(tag)}
                    disabled={!form.interests.includes(tag) && form.interests.length >= 3}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {errors.submit && <p className="form-error">{errors.submit}</p>}

            <div className="btn-row">
              <button className="btn-auth-secondary" onClick={() => setStep(1)} disabled={submitting}>← 이전</button>
              <button className="btn-auth-primary" onClick={handleNext} disabled={submitting}>
                {submitting ? '가입 처리 중...' : '가입 완료 →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="signup-success">
            <div className="success-icon">🎉</div>
            <h2 className="success-title">가입 완료!</h2>
            <p className="success-desc">
              <strong>{form.name || googleUser?.email}</strong>님,<br />
              Showfolio에 오신 것을 환영합니다!<br />
              지금 바로 첫 작품을 등록해보세요.
            </p>
            <div className="success-perks">
              <div className="perk-item">✨ 프리미엄 1개월 무료 지급 완료</div>
              <div className="perk-item">🎨 작품 등록 무제한 이용 가능</div>
              <div className="perk-item">🤖 AI 포트폴리오 생성 3회 무료</div>
            </div>
            <button className="btn-auth-primary" onClick={handleComplete}>
              Showfolio 시작하기 →
            </button>
            <Link to="/works/1" className="success-secondary-link">작품 둘러보기</Link>
          </div>
        )}
      </div>
    </div>
  );
}
