import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { works, exhibitions, myPageUser } from '../data/dummyData';
import './MyPage.css';

const TABS = ['내 작품', '좋아요한 작품', '참여 전시회', 'AI 포트폴리오'];

const TARGET_JOBS = [
  '프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자',
  '웹 퍼블리셔', '앱 개발자', 'UI/UX 디자이너', '서비스 기획자',
];

const STRENGTHS_LIST = [
  '문제 해결력', '협업 능력', 'UI 구현 능력', '데이터베이스 설계',
  'API 연동', '사용자 경험 개선', '오류 해결 경험', '성실한 개발 과정',
  '코드 구조화', '배포 경험',
];

// API 호출 로직 분리 — 추후 백엔드 변경 시 이 함수만 수정
async function callGeminiAPI(payload) {
  // 프론트엔드에서 /api/gemini-portfolio로만 호출 — API 키는 서버에서 처리
  const res = await fetch('/api/gemini-portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// 저장 로직 분리 — 추후 Supabase 등 연결 시 이 함수만 수정
function savePortfolioDraft(data) {
  localStorage.setItem('ai_portfolio_draft', JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
}

export default function MyPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'ai' ? 'AI 포트폴리오' : '내 작품'
  );

  const user = myPageUser;
  const myWorks = works.filter((w) => user.myWorkIds.includes(w.id));
  const likedWorks = works.filter((w) => user.likedWorks.includes(w.id));
  const myExhibitions = exhibitions.filter((_, i) => i < 2);

  return (
    <main className="mypage">
      {/* Profile Hero */}
      <section className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="container profile-hero-inner">
          <div className="profile-avatar-wrap">
            <div
              className="profile-avatar"
              style={user.avatar
                ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: user.avatarColor }
              }
            >
              {!user.avatar && <span className="profile-avatar-initial">{user.name[0]}</span>}
            </div>
            <span className="profile-badge-chip">⭐ {user.badge}</span>
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{user.name}</h1>
              <span className="profile-username">{user.username}</span>
            </div>
            <p className="profile-bio">{user.bio}</p>
            <div className="profile-meta-row">
              <span className="profile-meta-item">🎓 {user.university} · {user.major}</span>
              <span className="profile-meta-item">📅 {user.joinDate} 가입</span>
            </div>
            <div className="profile-stats-row">
              <div className="profile-stat">
                <span className="profile-stat-val">{myWorks.length}</span>
                <span className="profile-stat-label">작품</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-val">{user.followers}</span>
                <span className="profile-stat-label">팔로워</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-val">{user.following}</span>
                <span className="profile-stat-label">팔로잉</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-val">{user.likedWorks.length}</span>
                <span className="profile-stat-label">좋아요</span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn-edit-profile">프로필 편집</button>
            <button className="btn-share-profile">공유</button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mypage-tabs-wrap">
        <div className="container">
          <div className="mypage-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`mypage-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mypage-content">
        {activeTab === '내 작품' && (
          <div>
            <div className="mypage-section-header">
              <h2 className="mypage-section-title">내 작품 <span className="count-badge">{myWorks.length}</span></h2>
              <button className="btn-register-work">+ 작품 등록</button>
            </div>
            {myWorks.length === 0 ? (
              <EmptyState icon="🎨" title="아직 등록한 작품이 없어요" desc="첫 작품을 등록하고 다른 아티스트들과 공유해보세요!" action="작품 등록하기" />
            ) : (
              <div className="mypage-works-grid">
                {myWorks.map((work) => <MyWorkCard key={work.id} work={work} />)}
                <button className="add-work-card">
                  <span className="add-work-icon">+</span>
                  <span className="add-work-text">새 작품 추가</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === '좋아요한 작품' && (
          <div>
            <div className="mypage-section-header">
              <h2 className="mypage-section-title">좋아요한 작품 <span className="count-badge">{likedWorks.length}</span></h2>
            </div>
            <div className="mypage-works-grid">
              {likedWorks.map((work) => (
                <Link key={work.id} to={`/works/${work.id}`} className="liked-work-card">
                  <div
                    className="liked-work-img"
                    style={work.image
                      ? { backgroundImage: `url(${work.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: work.color }
                    }
                  />
                  <div className="liked-work-body">
                    <div className="liked-work-top">
                      <p className="liked-work-title">{work.title}</p>
                      <span className="liked-work-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>{work.tag}</span>
                    </div>
                    <p className="liked-work-author">{work.author}</p>
                    <p className="liked-work-meta">♥ {work.likes} · 👁 {work.views}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === '참여 전시회' && (
          <div>
            <div className="mypage-section-header">
              <h2 className="mypage-section-title">참여 전시회 <span className="count-badge">{myExhibitions.length}</span></h2>
            </div>
            <div className="exhibition-history-list">
              {myExhibitions.map((ex) => (
                <Link key={ex.id} to={`/exhibitions/${ex.id}`} className="history-card">
                  <div
                    className="history-img"
                    style={ex.image
                      ? { backgroundImage: `url(${ex.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: ex.color }
                    }
                  />
                  <div className="history-body">
                    <span className={`history-status ${ex.status === '진행중' ? 'active' : 'ended'}`}>{ex.status}</span>
                    <h3 className="history-title">{ex.title}</h3>
                    <p className="history-period">{ex.period}</p>
                    <p className="history-desc">{ex.shortDesc}</p>
                  </div>
                  <span className="history-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'AI 포트폴리오' && (
          <AIPortfolioPanel works={works} />
        )}
      </div>
    </main>
  );
}

function AIPortfolioPanel({ works }) {
  const [selectedWork, setSelectedWork] = useState(null);
  const [targetJob, setTargetJob] = useState('');
  const [strengths, setStrengths] = useState([]);
  const [additionalRequest, setAdditionalRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const toggleStrength = (s) => {
    setStrengths((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  // Gemini 전송용 데이터 구성 — 이름, 학번, 이메일, 이미지 경로 제외
  const buildPayload = () => {
    if (!selectedWork) return null;
    const idx = works.findIndex((w) => w.id === selectedWork.id);
    return {
      projectAlias: `작품 ${String.fromCharCode(65 + (idx >= 0 ? idx : 0))}`,
      projectSummary: selectedWork.description,
      techStack: selectedWork.techStack,
      mainFeatures: selectedWork.description,
      roleDescription: selectedWork.process?.join(', ') || '',
      difficulty: '',
      learning: '',
      targetJob,
      strengths,
      additionalRequest,
    };
  };

  const handleGenerate = async () => {
    if (!selectedWork) { setError('포트폴리오에 사용할 작품을 먼저 선택해주세요.'); return; }
    if (!targetJob) { setError('희망 직무를 먼저 선택해주세요.'); return; }
    setError('');
    setResult('');
    setLoading(true);
    try {
      const data = await callGeminiAPI(buildPayload());
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || 'AI 포트폴리오를 생성하지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.');
      }
    } catch {
      setError('AI 포트폴리오를 생성하지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    savePortfolioDraft({ result, workTitle: selectedWork?.title, targetJob, strengths });
    alert('포트폴리오 초안이 로컬에 저장되었습니다.');
  };

  return (
    <div className="ai-portfolio-panel">
      {/* 1. 작품 선택 */}
      <div className="aip-card">
        <h3 className="aip-card-title">1. 작품 선택</h3>
        <div className="aip-works-list">
          {works.map((w) => (
            <div key={w.id} className={`aip-work-item ${selectedWork?.id === w.id ? 'selected' : ''}`}>
              <div
                className="aip-work-thumb"
                style={w.image
                  ? { backgroundImage: `url(${w.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: w.color }
                }
              />
              <div className="aip-work-info">
                <p className="aip-work-title">{w.title}</p>
                <p className="aip-work-category">{w.category}</p>
                <div className="aip-tech-list">
                  {w.techStack.slice(0, 3).map((t) => <span key={t} className="tech-badge-sm">{t}</span>)}
                </div>
              </div>
              <button
                className={`aip-select-btn ${selectedWork?.id === w.id ? 'selected' : ''}`}
                onClick={() => setSelectedWork(selectedWork?.id === w.id ? null : w)}
              >
                {selectedWork?.id === w.id ? '선택됨 ✓' : '포트폴리오에 추가'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 희망 직무 */}
      <div className="aip-card">
        <h3 className="aip-card-title">2. 희망 직무</h3>
        <div className="aip-chips">
          {TARGET_JOBS.map((job) => (
            <button
              key={job}
              className={`aip-chip ${targetJob === job ? 'selected' : ''}`}
              onClick={() => setTargetJob(targetJob === job ? '' : job)}
            >
              {job}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 강조 역량 */}
      <div className="aip-card">
        <h3 className="aip-card-title">3. 강조 역량 <span className="aip-hint">(복수 선택 가능)</span></h3>
        <div className="aip-chips">
          {STRENGTHS_LIST.map((s) => (
            <button
              key={s}
              className={`aip-chip ${strengths.includes(s) ? 'selected' : ''}`}
              onClick={() => toggleStrength(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 추가 요청사항 */}
      <div className="aip-card">
        <h3 className="aip-card-title">4. 추가 요청사항</h3>
        <textarea
          className="aip-textarea"
          value={additionalRequest}
          onChange={(e) => setAdditionalRequest(e.target.value)}
          placeholder="예: 고등학생 취업 포트폴리오에 어울리는 자연스러운 문장으로 작성해주세요."
          rows={3}
        />
      </div>

      {/* 전송 데이터 미리보기 */}
      {selectedWork && (
        <div className="aip-card">
          <button className="aip-preview-toggle" onClick={() => setShowPreview(!showPreview)}>
            전송 데이터 미리보기 {showPreview ? '▲' : '▼'}
          </button>
          {showPreview && (
            <pre className="aip-preview-code">{JSON.stringify(buildPayload(), null, 2)}</pre>
          )}
        </div>
      )}

      {/* 생성 버튼 */}
      <button
        className={`btn-ai-generate${loading ? ' loading' : ''}`}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading
          ? <><span className="spinner" /> AI가 포트폴리오 초안을 생성하는 중입니다...</>
          : 'AI 포트폴리오 생성하기'
        }
      </button>

      {/* 오류 메시지 */}
      {error && <div className="aip-error">{error}</div>}

      {/* 결과 */}
      {result && (
        <div className="aip-card">
          <div className="aip-result-header">
            <h3 className="aip-card-title" style={{ marginBottom: 0 }}>AI 생성 결과</h3>
            <button className="aip-save-btn" onClick={handleSave}>저장하기</button>
          </div>
          <textarea
            className="aip-result-textarea"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            rows={20}
          />
          <p className="aip-disclaimer">AI가 생성한 포트폴리오 문장은 초안입니다. 반드시 자신의 실제 경험과 역할에 맞게 수정한 뒤 활용해야 합니다.</p>
        </div>
      )}

      <p className="aip-disclaimer">AI가 생성한 포트폴리오 문장은 초안입니다. 반드시 자신의 실제 경험과 역할에 맞게 수정한 뒤 활용해야 합니다.</p>
    </div>
  );
}

function MyWorkCard({ work }) {
  return (
    <Link to={`/works/${work.id}`} className="my-work-card">
      <div
        className="my-work-img"
        style={work.image
          ? { backgroundImage: `url(${work.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: work.color }
        }
      >
        <div className="my-work-actions-overlay">
          <button className="my-work-action-btn" onClick={(e) => e.preventDefault()}>수정</button>
          <button className="my-work-action-btn danger" onClick={(e) => e.preventDefault()}>삭제</button>
        </div>
      </div>
      <div className="my-work-body">
        <div className="my-work-top">
          <p className="my-work-title">{work.title}</p>
          <span className="my-work-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>{work.tag}</span>
        </div>
        <p className="my-work-meta">♥ {work.likes} · 👁 {work.views}</p>
      </div>
    </Link>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{desc}</p>
      {action && <button className="btn-empty-action">{action}</button>}
    </div>
  );
}
