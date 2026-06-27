import { Link } from 'react-router-dom';
import './ExhibitionSection.css';

export default function ExhibitionSection({ exhibitions }) {
  return (
    <section className="exhibition-section">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-label">EXHIBITIONS</p>
            <h2 className="section-title">최신 전시회</h2>
          </div>
          <Link to="/exhibitions" className="section-more">전체 보기 →</Link>
        </div>

        <div className="exhibition-grid">
          {exhibitions.map((ex) => (
            <Link key={ex.id} to={`/exhibitions/${ex.id}`} className="ex-card">
              <div className="ex-card-img" style={{ background: ex.color }}>
                <div className="ex-img-overlay" />
                <span className={`ex-status ${ex.status === '진행중' ? 'active' : 'ended'}`}>
                  {ex.status}
                </span>
              </div>
              <div className="ex-card-body">
                <h3 className="ex-title">{ex.title}</h3>
                <p className="ex-desc">{ex.shortDesc}</p>
                <div className="ex-meta">
                  <span className="ex-period">{ex.period}</span>
                  <span className="ex-count">작품 {ex.workCount}개</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
