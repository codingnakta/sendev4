import { Link } from 'react-router-dom';
import './SummarySection.css';

export default function SummarySection({ featuredExhibition, popularWorks, statistics }) {
  return (
    <section className="summary-wrap container">
      <div className="summary-card">
        {/* Featured Exhibition */}
        <div className="summary-block featured-block">
          <div className="summary-block-header">
            <span className="block-label">FEATURED EXHIBITION</span>
            <Link to={`/exhibitions/${featuredExhibition.id}`} className="more-link">더보기</Link>
          </div>
          <Link to={`/exhibitions/${featuredExhibition.id}`} className="featured-content">
            <div className="featured-img" style={{ background: featuredExhibition.color }}>
              <div className="featured-img-shapes">
                <div className="shape shape-1" />
                <div className="shape shape-2" />
              </div>
            </div>
            <div className="featured-info">
              <h3 className="featured-title">{featuredExhibition.title}</h3>
              <p className="featured-period">{featuredExhibition.period}</p>
              <span className={`status-badge status-${featuredExhibition.status === '진행중' ? 'active' : 'ended'}`}>
                {featuredExhibition.status}
              </span>
            </div>
          </Link>
        </div>

        <div className="summary-divider" />

        {/* Popular Works */}
        <div className="summary-block popular-block">
          <div className="summary-block-header">
            <span className="block-label">POPULAR WORKS</span>
            <Link to="/works" className="more-link">더보기</Link>
          </div>
          <div className="popular-list">
            {popularWorks.map((work) => (
              <Link key={work.id} to={`/works/${work.id}`} className="popular-item">
                <div className="popular-img" style={{ background: work.color }} />
                <div className="popular-info">
                  <p className="popular-title">{work.title}</p>
                  <p className="popular-author">{work.author}</p>
                  <span className="popular-tag" style={{ background: work.tagColor + '22', color: work.tagColor }}>
                    {work.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="summary-divider" />

        {/* Statistics */}
        <div className="summary-block stats-block">
          <div className="summary-block-header">
            <span className="block-label">SHOWFOLIO IN NUMBERS</span>
          </div>
          <div className="stats-list">
            {statistics.map((stat) => (
              <div key={stat.id} className="stat-item">
                <div className="stat-icon" style={{ color: stat.color, background: stat.color + '18' }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
