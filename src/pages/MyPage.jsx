import { useState } from 'react';
import { Link } from 'react-router-dom';
import { works, exhibitions, myPageUser } from '../data/dummyData';
import './MyPage.css';

const TABS = ['내 작품', '좋아요한 작품', '참여 전시회', 'AI 포트폴리오'];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('내 작품');
  const [portfolioGenerated, setPortfolioGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const user = myPageUser;
  const myWorks = works.filter((w) => user.myWorkIds.includes(w.id));
  const likedWorks = works.filter((w) => user.likedWorks.includes(w.id));
  const myExhibitions = exhibitions.filter((_, i) => i < 2);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setPortfolioGenerated(true);
    }, 2200);
  };

  return (
    <main className="mypage">
      {/* Profile Hero */}
      <section className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="container profile-hero-inner">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={{ background: user.avatarColor }}>
              <span className="profile-avatar-initial">{user.name[0]}</span>
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
        {/* 내 작품 */}
        {activeTab === '내 작품' && (
          <div>
            <div className="mypage-section-header">
              <h2 className="mypage-section-title">내 작품 <span className="count-badge">{myWorks.length}</span></h2>
              <button className="btn-register-work">+ 작품 등록</button>
            </div>
            {myWorks.length === 0 ? (
              <EmptyState
                icon="🎨"
                title="아직 등록한 작품이 없어요"
                desc="첫 작품을 등록하고 다른 아티스트들과 공유해보세요!"
                action="작품 등록하기"
              />
            ) : (
              <div className="mypage-works-grid">
                {myWorks.map((work) => (
                  <MyWorkCard key={work.id} work={work} />
                ))}
                <button className="add-work-card">
                  <span className="add-work-icon">+</span>
                  <span className="add-work-text">새 작품 추가</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 좋아요한 작품 */}
        {activeTab === '좋아요한 작품' && (
          <div>
            <div className="mypage-section-header">
              <h2 className="mypage-section-title">좋아요한 작품 <span className="count-badge">{likedWorks.length}</span></h2>
            </div>
            <div className="mypage-works-grid">
              {likedWorks.map((work) => (
                <Link key={work.id} to={`/works/${work.id}`} className="liked-work-card">
                  <div className="liked-work-img" style={{ background: work.color }} />
                  <div className="liked-work-body">
                    <div className="liked-work-top">
                      <p className="liked-work-title">{work.title}</p>
                      <span className="liked-work-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>
                        {work.tag}
                      </span>
                    </div>
                    <p className="liked-work-author">{work.author}</p>
                    <p className="liked-work-meta">♥ {work.likes} · 👁 {work.views}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 참여 전시회 */}
        {activeTab === '참여 전시회' && (
          <div>
            <div className="mypage-section-header">
              <h2 className="mypage-section-title">참여 전시회 <span className="count-badge">{myExhibitions.length}</span></h2>
            </div>
            <div className="exhibition-history-list">
              {myExhibitions.map((ex) => (
                <Link key={ex.id} to={`/exhibitions/${ex.id}`} className="history-card">
                  <div className="history-img" style={{ background: ex.color }} />
                  <div className="history-body">
                    <span className={`history-status ${ex.status === '진행중' ? 'active' : 'ended'}`}>
                      {ex.status}
                    </span>
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

        {/* AI 포트폴리오 */}
        {activeTab === 'AI 포트폴리오' && (
          <div className="ai-portfolio-section">
            {!portfolioGenerated ? (
              <div className="ai-portfolio-prompt">
                <div className="ai-portfolio-icon">✨</div>
                <h2 className="ai-portfolio-title">AI 포트폴리오 생성</h2>
                <p className="ai-portfolio-desc">
                  등록한 작품 정보를 기반으로 AI가 취업 포트폴리오를 자동으로 생성해드립니다.<br />
                  현재 <strong>{myWorks.length}개</strong>의 작품이 분석 대상입니다.
                </p>
                <div className="ai-feature-grid">
                  {['프로젝트 소개 자동 작성', '기술 스택 시각화', '역할 및 기여도 분석', '문제 해결 스토리 도출'].map((f) => (
                    <div key={f} className="ai-feature-item">
                      <span className="ai-feature-check">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  className={`btn-ai-generate ${generating ? 'loading' : ''}`}
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <><span className="spinner" /> AI가 분석 중입니다...</>
                  ) : (
                    'AI 포트폴리오 생성하기 →'
                  )}
                </button>
                <p className="ai-free-note">이번 달 무료 생성 2회 남음</p>
              </div>
            ) : (
              <PortfolioResult user={user} works={myWorks} onReset={() => setPortfolioGenerated(false)} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function MyWorkCard({ work }) {
  return (
    <Link to={`/works/${work.id}`} className="my-work-card">
      <div className="my-work-img" style={{ background: work.color }}>
        <div className="my-work-actions-overlay">
          <button className="my-work-action-btn" onClick={(e) => e.preventDefault()}>수정</button>
          <button className="my-work-action-btn danger" onClick={(e) => e.preventDefault()}>삭제</button>
        </div>
      </div>
      <div className="my-work-body">
        <div className="my-work-top">
          <p className="my-work-title">{work.title}</p>
          <span className="my-work-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>
            {work.tag}
          </span>
        </div>
        <p className="my-work-meta">♥ {work.likes} · 👁 {work.views}</p>
      </div>
    </Link>
  );
}

function PortfolioResult({ user, works, onReset }) {
  return (
    <div className="portfolio-result">
      <div className="portfolio-result-header">
        <div>
          <p className="portfolio-result-label">AI 생성 완료</p>
          <h2 className="portfolio-result-title">{user.name}의 포트폴리오</h2>
        </div>
        <div className="portfolio-result-actions">
          <button className="btn-download">PDF 저장</button>
          <button className="btn-share-portfolio">링크 공유</button>
          <button className="btn-reset" onClick={onReset}>다시 생성</button>
        </div>
      </div>

      <div className="portfolio-result-body">
        <div className="portfolio-section-card">
          <h3 className="portfolio-section-heading">👋 자기소개</h3>
          <p className="portfolio-section-text">
            안녕하세요, {user.university} {user.major}을 전공하고 있는 <strong>{user.name}</strong>입니다.
            시각적 언어로 이야기를 전달하는 것에 열정을 갖고 있으며, 사용자 중심의 디자인 솔루션을 추구합니다.
            Showfolio를 통해 꾸준히 작품 활동을 이어오고 있습니다.
          </p>
        </div>

        {works.map((work) => (
          <div key={work.id} className="portfolio-section-card">
            <div className="portfolio-work-header">
              <div className="portfolio-work-thumb" style={{ background: work.color }} />
              <div>
                <h3 className="portfolio-section-heading">{work.title}</h3>
                <span className="portfolio-work-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>
                  {work.tag}
                </span>
              </div>
            </div>
            <div className="portfolio-work-detail">
              <div className="portfolio-detail-block">
                <p className="portfolio-detail-label">프로젝트 소개</p>
                <p className="portfolio-detail-text">{work.description}</p>
              </div>
              <div className="portfolio-detail-block">
                <p className="portfolio-detail-label">사용 기술</p>
                <div className="portfolio-tech-list">
                  {work.techStack.map((t) => (
                    <span key={t} className="tech-badge-sm">{t}</span>
                  ))}
                </div>
              </div>
              <div className="portfolio-detail-block">
                <p className="portfolio-detail-label">제작 과정</p>
                <div className="portfolio-process-list">
                  {work.process.map((step, i) => (
                    <span key={i} className="portfolio-process-step">
                      {i + 1}. {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
