import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-inner container">
        <div className="hero-text">
          <p className="hero-label">ONLINE EXHIBITION PLATFORM</p>
          <h1 className="hero-title">
            학생의 시선이<br />
            작품이 되는 공간
          </h1>
          <p className="hero-desc">
            Showfolio는 학생들이 자신의 작품을 전시하고,<br />
            서로의 창작을 존중하며 영감을 주고받는<br />
            온라인 전시 플랫폼입니다.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">
              전시회 둘러보기 <span className="btn-arrow">→</span>
            </button>
            <button className="btn-secondary">작품 등록하기</button>
          </div>
        </div>

        <div className="hero-empty-area" />
      </div>
    </section>
  );
}
