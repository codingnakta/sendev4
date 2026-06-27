import { useState } from 'react';
import { Link } from 'react-router-dom';
import LegalModal from './LegalModal';
import './Footer.css';

export default function Footer() {
  const [modal, setModal] = useState(null); // 'terms' | 'privacy' | null

  return (
    <>
      <footer className="footer">
        <div className="footer-inner container">
          {/* 왼쪽 — 링크 + 정보관리책임자 */}
          <div className="footer-left">
            <div className="footer-links">
              <button className="footer-text-btn" onClick={() => setModal('terms')}>
                이용약관
              </button>
              <button className="footer-text-btn highlight" onClick={() => setModal('privacy')}>
                개인정보처리방침
              </button>
              <Link to="/notices" className="footer-link">공지사항</Link>
              <Link to="/" className="footer-link">문의하기</Link>
            </div>
            <p className="footer-responsible">
              <span className="responsible-tag">정보관리책임자</span>
              미림마이스터고등학교 마이스터기획부 교사 윤다연
            </p>
          </div>

          {/* 오른쪽 — 카피라이트 */}
          <p className="footer-copy">© 2026 Showfolio. All rights reserved.</p>
        </div>
      </footer>

      {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
    </>
  );
}
