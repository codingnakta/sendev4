# Showfolio 데이터베이스 설계 (Firebase Firestore)

이 프로젝트의 화면([dummyData.js](../src/data/dummyData.js) 기준)에 맞춰 설계한 Firestore 데이터 모델입니다.

Firestore는 **NoSQL 문서 DB**라서 표(테이블)가 아니라 **컬렉션(collection) > 문서(document) > 필드(field)** 구조로 저장합니다.

---

## 📁 컬렉션 구조 한눈에 보기

```
exhibitions/{exhibitionId}          전시회
works/{workId}                      작품
  └─ likes/{uid}                    이 작품에 좋아요 누른 사람
notices/{noticeId}                  공지사항
users/{uid}                         사용자·작가 프로필
  ├─ likedWorks/{workId}            내가 좋아요한 작품
  ├─ following/{targetUid}          내가 팔로우하는 사람
  ├─ followers/{followerUid}        나를 팔로우하는 사람
  └─ portfolios/{portfolioId}       AI 포트폴리오 초안
```

---

## 1. `exhibitions` — 전시회

| 필드 | 타입 | 설명 |
|------|------|------|
| `title` | string | 전시회 제목 |
| `description` | string | 상세 설명 |
| `shortDesc` | string | 짧은 설명 |
| `period` | string | 전시 기간 (`2024.05.01 - 06.30`) |
| `status` | string | `'진행중'` \| `'종료'` |
| `workCount` | number | 참여 작품 수 |
| `organizer` | string | 주최 |
| `location` | string | 전시 장소 |
| `tags` | string[] | 태그 배열 |
| `color` | string | 대표 그라디언트(이미지 없을 때 대체) |
| `imageUrl` | string | 대표 이미지 URL (Storage) |
| `createdAt` | timestamp | 생성 시각 |

## 2. `works` — 작품

| 필드 | 타입 | 설명 |
|------|------|------|
| `exhibitionId` | string | 소속 전시회 문서 ID (참조) |
| `authorId` | string | 작가 `users` 문서 ID (참조) |
| `authorName` | string | 작가 이름 (비정규화 — 빠른 조회용) |
| `authorAvatarUrl` | string | 작가 아바타 URL (비정규화) |
| `title` | string | 작품명 |
| `category` | string | 분야 (`앱 디자인`, `일러스트`…) |
| `tag` / `tagColor` | string | 태그 라벨 / 색상 |
| `color` | string | 대표 그라디언트 |
| `imageUrl` | string | 작품 이미지 URL |
| `description` | string | 작품 설명 |
| `techStack` | string[] | 사용 기술 |
| `process` | string[] | 작업 과정 |
| `likeCount` | number | 좋아요 수 (집계값) |
| `viewCount` | number | 조회수 (집계값) |
| `featured` | boolean | 추천 작품 여부 |
| `createdAt` | timestamp | 생성 시각 |

> **비정규화(authorName/authorAvatarUrl)**: Firestore는 JOIN이 없어서, 작품 목록을 보여줄 때마다 작가 문서를 따로 읽으면 느립니다. 그래서 자주 같이 보여주는 값은 작품 문서에 복사해 둡니다.

### `works/{workId}/likes/{uid}` (하위 컬렉션)
누가 좋아요를 눌렀는지 기록. 문서 ID = 사용자 uid.

| 필드 | 타입 | 설명 |
|------|------|------|
| `createdAt` | timestamp | 좋아요 누른 시각 |

## 3. `notices` — 공지사항

| 필드 | 타입 | 설명 |
|------|------|------|
| `category` | string | `공지` \| `이벤트` \| `업데이트` |
| `categoryColor` | string | 카테고리 색상 |
| `title` / `summary` / `content` | string | 제목 / 요약 / 본문 |
| `author` | string | 작성 주체 (`Showfolio 운영팀`) |
| `pinned` | boolean | 상단 고정 여부 |
| `viewCount` | number | 조회수 |
| `date` | string | 표시용 날짜 |
| `createdAt` | timestamp | 생성 시각 |

## 4. `users` — 사용자 / 작가 프로필

Firebase Auth의 `uid`를 문서 ID로 사용합니다. (회원가입 시 [SignupPage.jsx](../src/pages/SignupPage.jsx)가 이미 `users/{uid}`에 프로필을 저장 중)

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 이름 |
| `username` | string | 닉네임 (`@hongchangki`) |
| `email` | string | 이메일 |
| `avatarUrl` | string | 프로필 이미지 URL |
| `avatarColor` | string | 아바타 대체 색상 |
| `bio` | string | 소개글 |
| `major` / `university` | string | 전공 / 학교 |
| `interests` | string[] | 관심 분야 |
| `badge` | string | `루키` \| `라이징` \| `아티스트` \| `마스터` |
| `followerCount` / `followingCount` | number | 팔로워 / 팔로잉 수 |
| `agreeMarketing` | boolean | 마케팅 수신 동의 |
| `createdAt` | timestamp | 가입 시각 |

### 하위 컬렉션
- `users/{uid}/likedWorks/{workId}` — 내가 좋아요한 작품 (문서 ID = workId, 필드: `createdAt`)
- `users/{uid}/following/{targetUid}` / `followers/{followerUid}` — 팔로우 관계
- `users/{uid}/portfolios/{portfolioId}` — AI 포트폴리오 초안 (`workId`, `workTitle`, `targetJob`, `strengths[]`, `result`, `createdAt`) — 현재 localStorage에 저장 중인 것을 여기로 옮기면 됨

---

## 🔗 관계 요약

- **전시회 1 : N 작품** — `works.exhibitionId` 로 연결
- **작가 1 : N 작품** — `works.authorId` 로 연결 (아티스트 페이지는 작품을 작가별로 집계)
- **좋아요 N : M** — `works/{id}/likes/{uid}` + `users/{uid}/likedWorks/{workId}` 양쪽에 기록, 개수는 `works.likeCount`
- **팔로우 N : M** — `users/{uid}/following` + `followers`

---

## 🚀 Firebase에 넣는 방법

### 준비: Firestore 활성화
1. [Firebase 콘솔](https://console.firebase.google.com) → 프로젝트(`showfolio-517d5`) → **Firestore Database** → **데이터베이스 만들기**
2. 위치는 `asia-northeast3 (서울)` 권장, 시작은 **테스트 모드**로

### 방법 A. 콘솔에서 직접 입력 (문서가 적을 때)
전시회(3개)·공지(7개)처럼 개수가 적은 건 콘솔에서 직접:
- Firestore → **컬렉션 시작** → 컬렉션 ID(`exhibitions`) 입력 → 문서 추가 → 위 표의 필드를 하나씩 입력

### 방법 B. 시드 스크립트로 한 번에 (권장)
기존 더미데이터 전체를 자동으로 넣습니다. → [seedFirestore.js](../src/data/seedFirestore.js)

1. **규칙 임시 개방**: 콘솔 → Firestore → 규칙 탭 → 아래로 바꾸고 게시
   ```
   allow read, write: if true;
   ```
2. `src/main.jsx`에 임시로 추가:
   ```js
   import { seedFirestore } from './data/seedFirestore'
   window.seedFirestore = seedFirestore
   ```
3. `npm run dev` 실행 → 브라우저 콘솔(F12)에서 **한 번만** 실행:
   ```js
   seedFirestore()
   ```
   → `✅ Firestore 시드 완료 ...` 가 뜨면 성공
4. 방금 추가한 2줄 삭제, 규칙을 [firestore.rules](../firestore.rules) 내용으로 되돌려 게시

> ⚠️ **이미지 주의**: 시드는 개발 서버의 임시 이미지 경로를 저장합니다. 실제 배포에서는 이미지를 **Firebase Storage**에 업로드하고, 그 다운로드 URL을 `imageUrl`에 넣어야 영구적으로 보입니다.

### 마지막: 보안 규칙 적용
개발이 끝나면 반드시 [firestore.rules](../firestore.rules)를 적용하세요. 테스트 모드(`if true`)로 두면 **누구나 DB를 읽고 쓸 수 있습니다.**
