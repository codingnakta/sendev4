import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './AuthPage.css';

const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': '이미 사용 중인 이메일 주소입니다.',
  'auth/invalid-email': '올바른 이메일 주소를 입력해주세요.',
  'auth/weak-password': '비밀번호가 너무 약합니다. 8자 이상으로 설정해주세요.',
  'auth/network-request-failed': '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

function getAuthErrorMessage(err) {
  return AUTH_ERROR_MESSAGES[err.code] || '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
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

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
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

  const validateStep1 = () => {
    const e = {};
    if (!form.email.includes('@')) e.email = '올바른 이메일 주소를 입력해주세요.';
    if (form.password.length < 8) e.password = '비밀번호는 8자 이상이어야 합니다.';
    if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!form.agreeTerms || !form.agreePrivacy) e.agree = '필수 약관에 동의해주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.name.trim()) e.name = '이름을 입력해주세요.';
    if (form.username.trim().length < 2) e.username = '닉네임은 2자 이상이어야 합니다.';
    if (!form.major) e.major = '전공을 선택해주세요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      return;
    }
    if (step === 2 && validateStep2()) {
      setSubmitting(true);
      try {
        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(credential.user, { displayName: form.name });
        await setDoc(doc(db, 'users', credential.user.uid), {
          name: form.name,
          username: form.username,
          major: form.major,
          university: form.university,
          interests: form.interests,
          agreeMarketing: form.agreeMarketing,
          createdAt: new Date().toISOString(),
        });
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
              {step === 1 ? '계정 정보를 입력해주세요' : '프로필을 설정해주세요'}
            </p>
          </>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">이메일 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">비밀번호 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.password ? 'error' : ''}`}
                type="password"
                placeholder="8자 이상 입력해주세요"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
              {form.password && (
                <PasswordStrength password={form.password} />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">비밀번호 확인 <span className="required">*</span></label>
              <input
                className={`form-input ${errors.passwordConfirm ? 'error' : ''}`}
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={form.passwordConfirm}
                onChange={(e) => set('passwordConfirm', e.target.value)}
              />
              {errors.passwordConfirm && <p className="form-error">{errors.passwordConfirm}</p>}
              {form.passwordConfirm && form.password === form.passwordConfirm && (
                <p className="form-success">✓ 비밀번호가 일치합니다</p>
              )}
            </div>

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
            </div>

            <button className="btn-auth-primary" onClick={handleNext}>
              다음으로 →
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
              <strong>{form.name || form.email}</strong>님,<br />
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

function PasswordStrength({ password }) {
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const labels = ['', '약함', '보통', '강함', '매우 강함'];
  const colors = ['', '#ff6b6b', '#ffd93d', '#4ecdc4', '#3cc8b4'];

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className="strength-bar"
            style={{ background: score >= s ? colors[score] : '#e8edf5' }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}
