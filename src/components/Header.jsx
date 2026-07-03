import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const NAV_ITEMS = [
  { label: '전시회', path: '/exhibitions/1' },
  { label: '작품', path: '/works/1' },
  { label: '아티스트', path: '/artists' },
  { label: '공지사항', path: '/notices' },
  { label: '마이페이지', path: '/mypage' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAuthPage = ['/signup', '/login', '/auth/kakao/callback'].includes(location.pathname);

  const handleProfileClick = () => {
    navigate(user ? '/mypage' : '/login');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="header-logo">
          <span className="logo-text">Showfolio</span>
          <span className="logo-star">✦</span>
        </Link>

        {!isAuthPage && (
          <>
            <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active-nav' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <button className="icon-btn" aria-label="검색">
                <SearchIcon />
              </button>
              <button className="icon-btn" aria-label="알림">
                <BellIcon />
              </button>
              <button
                className="profile-btn"
                aria-label="프로필"
                onClick={handleProfileClick}
              >
                {user?.displayName?.[0] || 'S'}
              </button>
              {user && (
                <button className="icon-btn" aria-label="로그아웃" onClick={handleLogout}>
                  <LogoutIcon />
                </button>
              )}
            </div>

            <button
              className="hamburger"
              aria-label="메뉴"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </>
        )}

        {isAuthPage && (
          <div className="header-actions">
            <Link to="/" className="auth-home-link">홈으로</Link>
          </div>
        )}
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
