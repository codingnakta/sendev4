import { Link } from 'react-router-dom';
import './LatestWorksSection.css';

export default function LatestWorksSection({ works }) {
  return (
    <section className="works-section">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-label">ARTWORKS</p>
            <h2 className="section-title">최신 작품</h2>
          </div>
          <Link to="/works" className="section-more">전체 보기 →</Link>
        </div>

        <div className="works-grid">
          {works.map((work) => (
            <Link key={work.id} to={`/works/${work.id}`} className="work-card">
              <div
                className="work-card-img"
                style={work.image
                  ? { backgroundImage: `url(${work.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: work.color }
                }
              >
                <div className="work-card-overlay">
                  <div className="work-hover-info">
                    <p className="work-desc-preview">{work.description}</p>
                    <div className="work-tech-tags">
                      {work.techStack.slice(0, 2).map((t) => (
                        <span key={t} className="tech-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="work-card-body">
                <div className="work-card-top">
                  <h3 className="work-title">{work.title}</h3>
                  <span className="work-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>
                    {work.tag}
                  </span>
                </div>
                <p className="work-author">{work.author}</p>
                <div className="work-stats">
                  <span className="work-stat">♥ {work.likes}</span>
                  <span className="work-stat">👁 {work.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
