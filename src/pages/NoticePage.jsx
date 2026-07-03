import { useEffect, useState } from 'react';
import { getNotices } from '../data/repository';
import './NoticePage.css';

const CATEGORIES = ['전체', '공지', '이벤트', '업데이트'];

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState('전체');
  const [openId, setOpenId] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    getNotices().then(setNotices);
  }, []);

  const filtered =
    activeTab === '전체' ? notices : notices.filter((n) => n.category === activeTab);

  const pinnedList = filtered.filter((n) => n.pinned);
  const normalList = filtered.filter((n) => !n.pinned);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <main className="notice-page">
      <div className="container">
        {/* Page Header */}
        <div className="notice-page-header">
          <div>
            <p className="section-label-sm">NOTICE BOARD</p>
            <h1 className="notice-page-title">공지사항</h1>
            <p className="notice-page-sub">Showfolio의 새로운 소식과 이벤트를 확인하세요.</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="notice-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`notice-tab ${activeTab === cat ? 'active' : ''}`}
              onClick={() => { setActiveTab(cat); setOpenId(null); }}
            >
              {cat}
              <span className="notice-tab-count">
                {cat === '전체' ? notices.length : notices.filter((n) => n.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Pinned */}
        {pinnedList.length > 0 && (
          <div className="notice-group">
            {pinnedList.map((notice) => (
              <NoticeItem
                key={notice.id}
                notice={notice}
                open={openId === notice.id}
                onToggle={() => toggle(notice.id)}
                pinned
              />
            ))}
          </div>
        )}

        {/* Normal list */}
        <div className="notice-group">
          {normalList.length === 0 && pinnedList.length === 0 ? (
            <div className="notice-empty">해당 카테고리의 공지사항이 없습니다.</div>
          ) : (
            normalList.map((notice) => (
              <NoticeItem
                key={notice.id}
                notice={notice}
                open={openId === notice.id}
                onToggle={() => toggle(notice.id)}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function NoticeItem({ notice, open, onToggle, pinned }) {
  return (
    <div className={`notice-item ${open ? 'open' : ''} ${pinned ? 'pinned' : ''}`}>
      <button className="notice-item-header" onClick={onToggle}>
        <div className="notice-item-left">
          {pinned && <span className="pin-badge">📌 고정</span>}
          <span
            className="notice-cat-badge"
            style={{ background: notice.categoryColor + '22', color: notice.categoryColor }}
          >
            {notice.category}
          </span>
          <span className="notice-item-title">{notice.title}</span>
        </div>
        <div className="notice-item-right">
          <span className="notice-date">{notice.date}</span>
          <span className="notice-views">👁 {notice.views.toLocaleString()}</span>
          <span className={`notice-chevron ${open ? 'up' : ''}`}>›</span>
        </div>
      </button>

      {open && (
        <div className="notice-item-body">
          <p className="notice-summary">{notice.summary}</p>
          <div className="notice-divider" />
          <div className="notice-content">
            {notice.content.split('\n').map((line, i) =>
              line === '' ? <br key={i} /> : <p key={i}>{line}</p>
            )}
          </div>
          <div className="notice-footer">
            <span className="notice-author">작성자: {notice.author}</span>
            <span className="notice-date-full">{notice.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}
