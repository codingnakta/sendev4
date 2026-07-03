// ─────────────────────────────────────────────────────────────
// Firestore 시드 스크립트
// 기존 더미데이터(dummyData.js)를 Firestore 컬렉션으로 한 번에 넣는다.
//
// 사용법:
//  1) Firebase 콘솔 → Firestore 규칙을 임시로 "테스트 모드"(allow read, write: if true)로 변경
//  2) main.jsx에 아래 두 줄을 임시로 추가:
//       import { seedFirestore } from './data/seedFirestore'
//       window.seedFirestore = seedFirestore
//  3) 앱 실행 후 브라우저 콘솔에서  seedFirestore()  실행 (한 번만!)
//  4) 완료되면 위 두 줄 제거 + 규칙을 firestore.rules 내용으로 되돌리기
//
// ⚠️ imageUrl에는 개발 서버의 임시 이미지 경로가 들어간다. 배포 시에는
//    이미지를 Firebase Storage에 업로드하고 다운로드 URL로 교체해야 한다.
// ─────────────────────────────────────────────────────────────
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { exhibitions, works, notices } from './dummyData';

// 작가 이름 → 안정적인 문서 ID (실제 로그인 사용자가 아닌 시드용 계정)
const artistDocId = (name) => `artist_${name}`;

export async function seedFirestore() {
  const batch = writeBatch(db);

  // 1. 전시회 (exhibitions)
  exhibitions.forEach((ex) => {
    const { id, image, ...rest } = ex;
    batch.set(doc(db, 'exhibitions', String(id)), {
      ...rest,                       // title, description, shortDesc, period, status, workCount, color, organizer, location, tags
      imageUrl: image ?? null,
      createdAt: serverTimestamp(),
    });
  });

  // 2. 작가 프로필 (users) — 작품 데이터에서 중복 없이 추출
  const artistMap = {};
  works.forEach((w) => {
    if (!artistMap[w.author]) {
      artistMap[w.author] = { name: w.author, avatar: w.avatar, category: w.category };
    }
  });
  Object.values(artistMap).forEach((a) => {
    batch.set(doc(db, 'users', artistDocId(a.name)), {
      name: a.name,
      username: `@${a.name}`,
      email: '',
      avatarUrl: a.avatar ?? null,
      avatarColor: '',
      bio: '',
      major: a.category,
      university: '',
      interests: [],
      badge: '루키',
      followerCount: 0,
      followingCount: 0,
      isSeed: true,                  // 시드로 생성된 계정 표시 (실제 가입 사용자와 구분)
      createdAt: serverTimestamp(),
    }, { merge: true });
  });

  // 3. 작품 (works)
  works.forEach((w) => {
    const { id, image, avatar, author, likes, views, ...rest } = w;
    batch.set(doc(db, 'works', String(id)), {
      ...rest,                       // exhibitionId, title, category, tag, tagColor, color, description, techStack, process, featured
      authorId: artistDocId(author), // users 컬렉션 참조
      authorName: author,            // 비정규화(빠른 조회용)
      authorAvatarUrl: avatar ?? null,
      imageUrl: image ?? null,
      likeCount: likes ?? 0,
      viewCount: views ?? 0,
      createdAt: serverTimestamp(),
    });
  });

  // 4. 공지사항 (notices)
  notices.forEach((n) => {
    const { id, views, ...rest } = n;
    batch.set(doc(db, 'notices', String(id)), {
      ...rest,                       // category, title, summary, content, date, pinned, author, categoryColor
      viewCount: views ?? 0,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
  const count = exhibitions.length + Object.keys(artistMap).length + works.length + notices.length;
  console.log(`✅ Firestore 시드 완료 (${count}개 문서): exhibitions, users(작가), works, notices`);
}
