// ─────────────────────────────────────────────────────────────
// 데이터 조회 계층 (Firestore ↔ 화면)
// Firestore 문서를 컴포넌트가 기존에 쓰던 형태로 변환해서 돌려준다.
// 덕분에 화면(JSX)은 거의 그대로 두고 데이터 출처만 Firestore로 바뀐다.
// ─────────────────────────────────────────────────────────────
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { workImages, exhibitionImages, avatarImages } from './imageMap';

// Firestore 작품 문서 → 화면용 형태
function toWork(id, d) {
  return {
    id: Number(id),
    exhibitionId: d.exhibitionId,
    title: d.title,
    author: d.authorName,
    category: d.category,
    tag: d.tag,
    tagColor: d.tagColor,
    likes: d.likeCount ?? 0,
    views: d.viewCount ?? 0,
    color: d.color,
    description: d.description,
    techStack: d.techStack ?? [],
    process: d.process ?? [],
    image: workImages[id] ?? null,
    avatar: avatarImages[d.authorName] ?? null,
    featured: d.featured ?? false,
  };
}

// Firestore 전시회 문서 → 화면용 형태
function toExhibition(id, d) {
  return {
    id: Number(id),
    title: d.title,
    description: d.description,
    shortDesc: d.shortDesc,
    period: d.period,
    status: d.status,
    workCount: d.workCount,
    color: d.color,
    organizer: d.organizer,
    location: d.location,
    tags: d.tags ?? [],
    image: exhibitionImages[id] ?? null,
  };
}

// Firestore 공지 문서 → 화면용 형태
function toNotice(id, d) {
  return {
    id: Number(id),
    category: d.category,
    title: d.title,
    summary: d.summary,
    content: d.content,
    date: d.date,
    views: d.viewCount ?? 0,
    pinned: d.pinned ?? false,
    author: d.author,
    categoryColor: d.categoryColor,
  };
}

// 문서 ID 숫자 기준 오름차순 (Firestore 기본 정렬은 "1","10","2"... 순이라 보정)
const byId = (a, b) => a.id - b.id;

// ── 전시회 ──
export async function getExhibitions() {
  const snap = await getDocs(collection(db, 'exhibitions'));
  return snap.docs.map((d) => toExhibition(d.id, d.data())).sort(byId);
}

export async function getExhibition(id) {
  const s = await getDoc(doc(db, 'exhibitions', String(id)));
  return s.exists() ? toExhibition(s.id, s.data()) : null;
}

// ── 작품 ──
export async function getWorks() {
  const snap = await getDocs(collection(db, 'works'));
  return snap.docs.map((d) => toWork(d.id, d.data())).sort(byId);
}

export async function getWork(id) {
  const s = await getDoc(doc(db, 'works', String(id)));
  return s.exists() ? toWork(s.id, s.data()) : null;
}

// ── 공지사항 ──
export async function getNotices() {
  const snap = await getDocs(collection(db, 'notices'));
  return snap.docs.map((d) => toNotice(d.id, d.data())).sort(byId);
}

// ── 사용자 프로필 (users/{uid}) ──
// 로그인한 본인의 프로필 문서. 없으면 null (→ 온보딩 필요)
export async function getUserProfile(uid) {
  const s = await getDoc(doc(db, 'users', uid));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}

// 프로필 생성/수정 — merge로 기존 필드 보존, createdAt은 최초 1회만
export async function saveUserProfile(uid, data, { isNew = false } = {}) {
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (isNew) payload.createdAt = serverTimestamp();
  await setDoc(doc(db, 'users', uid), payload, { merge: true });
}

// 프로필에 온보딩(필수 정보)이 채워졌는지 판단
export function isProfileComplete(profile) {
  return !!(profile && profile.username && profile.major && profile.onboarded);
}
