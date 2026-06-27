import { useParams, Link, useNavigate } from 'react-router-dom';
import { exhibitions, works } from '../data/dummyData';
import './ExhibitionDetailPage.css';

export default function ExhibitionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exhibition = exhibitions.find((e) => e.id === Number(id));

  if (!exhibition) {
    return (
      <div className="not-found">
        <p>전시회를 찾을 수 없습니다.</p>
        <Link to="/">홈으로 돌아가기</Link>
      </div>
    );
  }

  const exhibitionWorks = works.filter((w) => w.exhibitionId === exhibition.id);
  const isActive = exhibition.status === '진행중';

  return (
    <main className="ex-detail">
      {/* Hero */}
      <section
        className="ex-detail-hero"
        style={exhibition.image
          ? { backgroundImage: `url(${exhibition.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: exhibition.color }
        }
      >
        <div className="ex-detail-hero-overlay" />
        <div className="container ex-detail-hero-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <div className="ex-detail-hero-content">
            <span className={`detail-status ${isActive ? 'active' : 'ended'}`}>
              {exhibition.status}
            </span>
            <h1 className="ex-detail-title">{exhibition.title}</h1>
            <div className="ex-detail-meta-row">
              <span className="ex-detail-meta-item">📅 {exhibition.period}</span>
              <span className="ex-detail-meta-item">🏛 {exhibition.organizer}</span>
              <span className="ex-detail-meta-item">📍 {exhibition.location}</span>
            </div>
            <div className="ex-detail-tags">
              {exhibition.tags.map((tag) => (
                <span key={tag} className="ex-detail-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="ex-detail-info container">
        <div className="ex-info-grid">
          <div className="ex-info-desc">
            <h2 className="ex-section-title">전시 소개</h2>
            <p className="ex-description">{exhibition.description}</p>
          </div>
          <div className="ex-info-stats">
            <div className="ex-stat-card">
              <span className="ex-stat-num">{exhibition.workCount}</span>
              <span className="ex-stat-label">참여 작품</span>
            </div>
            <div className="ex-stat-card">
              <span className="ex-stat-num">{exhibition.workCount}</span>
              <span className="ex-stat-label">참여 아티스트</span>
            </div>
            <div className="ex-stat-card">
              <span className="ex-stat-num">
                {exhibitionWorks.reduce((s, w) => s + w.views, 0).toLocaleString()}
              </span>
              <span className="ex-stat-label">총 조회수</span>
            </div>
            <div className="ex-stat-card">
              <span className="ex-stat-num">
                {exhibitionWorks.reduce((s, w) => s + w.likes, 0).toLocaleString()}
              </span>
              <span className="ex-stat-label">총 좋아요</span>
            </div>
          </div>
        </div>
      </section>

      {/* Works */}
      <section className="ex-detail-works container">
        <h2 className="ex-section-title">참여 작품 ({exhibitionWorks.length})</h2>
        <div className="ex-works-grid">
          {exhibitionWorks.map((work) => (
            <Link key={work.id} to={`/works/${work.id}`} className="ex-work-card">
              <div
                className="ex-work-img"
                style={work.image
                  ? { backgroundImage: `url(${work.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: work.color }
                }
              >
                <div className="ex-work-img-overlay" />
              </div>
              <div className="ex-work-body">
                <div className="ex-work-top">
                  <h3 className="ex-work-title">{work.title}</h3>
                  <span className="ex-work-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>
                    {work.tag}
                  </span>
                </div>
                <p className="ex-work-author">{work.author}</p>
                <p className="ex-work-desc">{work.description}</p>
                <div className="ex-work-meta">
                  <span>♥ {work.likes}</span>
                  <span>👁 {work.views}</span>
                  <span className="ex-work-stack">
                    {work.techStack.slice(0, 2).join(' · ')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Artist roster */}
      <section className="ex-artists container">
        <h2 className="ex-section-title">참여 아티스트</h2>
        <div className="artist-list">
          {exhibitionWorks.map((work) => (
            <Link key={work.id} to={`/works/${work.id}`} className="artist-chip">
              <div
                className="artist-avatar"
                style={work.avatar
                  ? { backgroundImage: `url(${work.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: work.color }
                }
              />
              <div>
                <p className="artist-name">{work.author}</p>
                <p className="artist-work">{work.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Other exhibitions */}
      <section className="ex-other container">
        <h2 className="ex-section-title">다른 전시회</h2>
        <div className="other-grid">
          {exhibitions
            .filter((e) => e.id !== exhibition.id)
            .map((e) => (
              <Link key={e.id} to={`/exhibitions/${e.id}`} className="other-card">
                <div
                  className="other-card-img"
                  style={e.image
                    ? { backgroundImage: `url(${e.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: e.color }
                  }
                />
                <div className="other-card-body">
                  <span className={`other-status ${e.status === '진행중' ? 'active' : 'ended'}`}>
                    {e.status}
                  </span>
                  <h3 className="other-title">{e.title}</h3>
                  <p className="other-period">{e.period}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
