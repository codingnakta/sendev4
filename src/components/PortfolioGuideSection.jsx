import { Link } from 'react-router-dom';
import './PortfolioGuideSection.css';

export default function PortfolioGuideSection({ guide }) {
  return (
    <section className="portfolio-section">
      <div className="container">
        <div className="portfolio-card">
          <div className="portfolio-deco-1" />
          <div className="portfolio-deco-2" />

          <div className="portfolio-content">
            <div className="portfolio-text">
              <span className="portfolio-badge">✨ AI 포트폴리오</span>
              <h2 className="portfolio-title">{guide.title}</h2>
              <p className="portfolio-desc">{guide.description}</p>
              <Link to="/mypage?tab=ai" className="portfolio-btn">
                {guide.cta} <span>→</span>
              </Link>
            </div>

            <div className="portfolio-features">
              {guide.features.map((f, i) => (
                <div key={i} className="feature-item">
                  <div className="feature-icon">{f.icon}</div>
                  <p className="feature-text">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
