import { useState } from 'react';
import { Link } from 'react-router-dom';
import { works } from '../data/dummyData';
import './ArtistsPage.css';

// 작품 데이터에서 아티스트 목록을 추출해 집계
function buildArtists(works) {
  const map = {};
  works.forEach((w) => {
    if (!map[w.author]) {
      map[w.author] = {
        name: w.author,
        avatarColor: w.color,
        category: w.category,
        works: [],
        totalLikes: 0,
        totalViews: 0,
      };
    }
    map[w.author].works.push(w);
    map[w.author].totalLikes += w.likes;
    map[w.author].totalViews += w.views;
  });
  return Object.values(map);
}

const BADGES = ['⭐ 라이징', '✦ 루키', '🌟 아티스트', '⭐ 라이징', '✦ 루키',
                '🌟 아티스트', '⭐ 라이징', '✦ 루키', '🌟 아티스트', '⭐ 라이징',
                '✦ 루키', '🌟 아티스트'];

const CATEGORIES = ['전체', '앱 디자인', '일러스트', '3D', '그래픽', '영상', '디지털아트', '인터랙티브', '제품 디자인'];

const SORT_OPTIONS = [
  { value: 'views', label: '조회수 순' },
  { value: 'likes', label: '좋아요 순' },
  { value: 'works', label: '작품 수 순' },
];

export default function ArtistsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [sort, setSort] = useState('views');

  const allArtists = buildArtists(works);

  const filtered = allArtists
    .filter((a) => {
      const matchSearch = a.name.includes(search) ||
        a.works.some((w) => w.tag.includes(search) || w.title.includes(search));
      const matchCat = category === '전체' || a.works.some((w) => w.category === category);
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sort === 'views') return b.totalViews - a.totalViews;
      if (sort === 'likes') return b.totalLikes - a.totalLikes;
      return b.works.length - a.works.length;
    });

  return (
    <main className="artists-page">
      <div className="container">
        {/* Page Header */}
        <div className="artists-header">
          <div>
            <p className="section-label-xs">ARTISTS</p>
            <h1 className="artists-title">아티스트</h1>
            <p className="artists-sub">Showfolio에서 활동하는 창작자들을 만나보세요.</p>
          </div>
          <div className="artists-total-badge">
            총 <strong>{allArtists.length}</strong>명의 아티스트
          </div>
        </div>

        {/* Search + Filter */}
        <div className="artists-toolbar">
          <div className="artist-search-wrap">
            <span className="search-icon-sm">🔍</span>
            <input
              className="artist-search"
              type="text"
              placeholder="아티스트명 또는 작품 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <select
            className="artist-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Category tabs */}
        <div className="artist-cat-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`artist-cat-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Result count */}
        {(search || category !== '전체') && (
          <p className="artists-result-count">
            {filtered.length}명의 아티스트를 찾았습니다.
          </p>
        )}

        {/* Artist Grid */}
        {filtered.length === 0 ? (
          <div className="artists-empty">
            <p>😕 검색 결과가 없습니다.</p>
            <button className="btn-reset-filter" onClick={() => { setSearch(''); setCategory('전체'); }}>
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="artists-grid">
            {filtered.map((artist, idx) => (
              <ArtistCard key={artist.name} artist={artist} badge={BADGES[idx % BADGES.length]} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ArtistCard({ artist, badge, rank }) {
  const repWork = artist.works[0];

  return (
    <Link to={`/works/${repWork.id}`} className="artist-card">
      {/* Rank */}
      {rank <= 3 && (
        <div className={`rank-badge rank-${rank}`}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
        </div>
      )}

      {/* Avatar */}
      <div className="artist-avatar-area">
        <div className="artist-avatar" style={{ background: artist.avatarColor }}>
          <span className="artist-initial">{artist.name[0]}</span>
        </div>
        <div className="artist-badge-row">
          <span className="artist-badge">{badge}</span>
        </div>
      </div>

      {/* Info */}
      <div className="artist-info">
        <h3 className="artist-name">{artist.name}</h3>
        <div className="artist-tags">
          {[...new Set(artist.works.map((w) => w.tag))].slice(0, 2).map((tag) => {
            const w = artist.works.find((w) => w.tag === tag);
            return (
              <span
                key={tag}
                className="artist-tag"
                style={{ background: (w?.tagColor ?? '#4ecdc4') + '22', color: w?.tagColor ?? '#4ecdc4' }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="artist-stats">
        <div className="artist-stat">
          <span className="artist-stat-val">{artist.works.length}</span>
          <span className="artist-stat-label">작품</span>
        </div>
        <div className="artist-stat-divider" />
        <div className="artist-stat">
          <span className="artist-stat-val">{artist.totalLikes.toLocaleString()}</span>
          <span className="artist-stat-label">좋아요</span>
        </div>
        <div className="artist-stat-divider" />
        <div className="artist-stat">
          <span className="artist-stat-val">{artist.totalViews.toLocaleString()}</span>
          <span className="artist-stat-label">조회수</span>
        </div>
      </div>

      {/* Work previews */}
      <div className="artist-work-previews">
        {artist.works.slice(0, 3).map((w) => (
          <div
            key={w.id}
            className="artist-work-thumb"
            style={{ background: w.color }}
          />
        ))}
      </div>
    </Link>
  );
}
