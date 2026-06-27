import { useParams, Link, useNavigate } from 'react-router-dom';
import { works, exhibitions } from '../data/dummyData';
import './WorkDetailPage.css';

export default function WorkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const work = works.find((w) => w.id === Number(id));

  if (!work) {
    return (
      <div className="not-found">
        <p>작품을 찾을 수 없습니다.</p>
        <Link to="/">홈으로 돌아가기</Link>
      </div>
    );
  }

  const exhibition = exhibitions.find((e) => e.id === work.exhibitionId);
  const relatedWorks = works
    .filter((w) => w.id !== work.id && w.exhibitionId === work.exhibitionId)
    .slice(0, 3);

  return (
    <main className="work-detail">
      {/* Breadcrumb */}
      <div className="work-breadcrumb container">
        <button className="back-btn-work" onClick={() => navigate(-1)}>← 뒤로가기</button>
        {exhibition && (
          <span className="breadcrumb-path">
            <Link to={`/exhibitions/${exhibition.id}`}>{exhibition.title}</Link>
            <span> / </span>
            <span>{work.title}</span>
          </span>
        )}
      </div>

      {/* Main layout */}
      <div className="work-detail-inner container">
        {/* Left: image */}
        <div className="work-detail-left">
          <div className="work-detail-img" style={{ background: work.color }}>
            <div className="work-detail-img-glow" />
          </div>

          {/* Process steps */}
          <div className="work-process-card">
            <h3 className="work-sub-title">제작 과정</h3>
            <ol className="process-list">
              {work.process.map((step, i) => (
                <li key={i} className="process-item">
                  <span className="process-num">{i + 1}</span>
                  <span className="process-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: info */}
        <div className="work-detail-right">
          {/* Tag + title */}
          <span className="work-detail-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>
            {work.tag}
          </span>
          <h1 className="work-detail-title">{work.title}</h1>

          {/* Author */}
          <div className="work-author-row">
            <div className="work-author-avatar" style={{ background: work.color }} />
            <div>
              <p className="work-author-name">{work.author}</p>
              <p className="work-author-sub">{work.category}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="work-stats-row">
            <div className="work-stat-pill">
              <span className="stat-icon-label">♥</span>
              <span className="stat-val">{work.likes.toLocaleString()}</span>
              <span className="stat-name">좋아요</span>
            </div>
            <div className="work-stat-pill">
              <span className="stat-icon-label">👁</span>
              <span className="stat-val">{work.views.toLocaleString()}</span>
              <span className="stat-name">조회수</span>
            </div>
          </div>

          {/* Description */}
          <div className="work-desc-section">
            <h3 className="work-sub-title">작품 소개</h3>
            <p className="work-desc-text">{work.description}</p>
          </div>

          {/* Tech stack */}
          <div className="work-tech-section">
            <h3 className="work-sub-title">사용 도구 및 기술</h3>
            <div className="tech-stack-list">
              {work.techStack.map((tech) => (
                <span key={tech} className="tech-badge">{tech}</span>
              ))}
            </div>
          </div>

          {/* Exhibition link */}
          {exhibition && (
            <div className="work-exhibition-link">
              <h3 className="work-sub-title">소속 전시회</h3>
              <Link to={`/exhibitions/${exhibition.id}`} className="exhibition-pill">
                <div className="exh-pill-dot" style={{ background: exhibition.color }} />
                <div>
                  <p className="exh-pill-title">{exhibition.title}</p>
                  <p className="exh-pill-period">{exhibition.period}</p>
                </div>
                <span className="exh-pill-arrow">→</span>
              </Link>
            </div>
          )}

          {/* Action buttons */}
          <div className="work-actions">
            <button className="btn-like">♥ 좋아요</button>
            <button className="btn-share">공유하기</button>
          </div>
        </div>
      </div>

      {/* Related works */}
      {relatedWorks.length > 0 && (
        <section className="related-works container">
          <h2 className="related-title">같은 전시회 다른 작품</h2>
          <div className="related-grid">
            {relatedWorks.map((rw) => (
              <Link key={rw.id} to={`/works/${rw.id}`} className="related-card">
                <div className="related-img" style={{ background: rw.color }} />
                <div className="related-body">
                  <div className="related-top">
                    <p className="related-work-title">{rw.title}</p>
                    <span className="related-tag" style={{ background: rw.tagColor + '22', color: rw.tagColor }}>
                      {rw.tag}
                    </span>
                  </div>
                  <p className="related-author">{rw.author}</p>
                  <div className="related-meta">
                    <span>♥ {rw.likes}</span>
                    <span>👁 {rw.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
