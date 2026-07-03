// ─────────────────────────────────────────────────────────────
// 로컬 이미지(src/assets) → Firebase Storage 업로드 + Firestore imageUrl 갱신
//
// 사용법:  node scripts/migrateImagesToStorage.js
// (FIREBASE_SERVICE_ACCOUNT_KEY, VITE_FIREBASE_STORAGE_BUCKET을 .env.local에서 읽는다)
//
// 완료 후 src/data/storageImageUrls.json에 업로드된 다운로드 URL 맵이 저장된다.
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'src', 'assets');

function loadEnvLocal() {
  const envPath = path.join(rootDir, '.env.local');
  const text = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    env[key] = val;
  }
  return env;
}

const env = loadEnvLocal();
const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
const bucketName = env.VITE_FIREBASE_STORAGE_BUCKET;

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: bucketName,
});

const bucket = getStorage().bucket();
const db = getFirestore();

// 문서 ID/작가명 → 로컬 파일명, 업로드 대상 Storage 경로
const WORKS = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => [String(i + 1), `${i + 1}.png`])
);

const EXHIBITIONS = {
  1: '디자인학과졸업작품전.png',
  2: '봄의시선.png',
  3: 'ai디지털아트페스티벌.png',
};

const AVATARS = {
  오스틴: '오스틴.png',
  송찬의: '송찬의.png',
  문정빈: '문정빈.png',
  홍창기: '홍창기.png',
  박동원: '박동원.png',
  신민재: '신민재.png',
  문보경: '문보경.png',
  문성주: '문성주.png',
  구본혁: '구본혁.png',
  이주헌: '이주헌.png',
  김영우: '김영우.png',
  이정용: '이정용.png',
};

async function uploadOne(localFileName, destPath) {
  const localPath = path.join(assetsDir, localFileName);
  if (!existsSync(localPath)) throw new Error(`파일 없음: ${localPath}`);

  const token = randomUUID();
  await bucket.upload(localPath, {
    destination: destPath,
    metadata: {
      contentType: 'image/png',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  const encodedPath = encodeURIComponent(destPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
}

async function main() {
  const result = { works: {}, exhibitions: {}, avatars: {} };

  for (const [id, fileName] of Object.entries(WORKS)) {
    result.works[id] = await uploadOne(fileName, `works/${id}.png`);
    console.log(`✓ works/${id}.png 업로드 완료`);
  }
  for (const [id, fileName] of Object.entries(EXHIBITIONS)) {
    result.exhibitions[id] = await uploadOne(fileName, `exhibitions/${id}.png`);
    console.log(`✓ exhibitions/${id}.png 업로드 완료`);
  }
  for (const [name, fileName] of Object.entries(AVATARS)) {
    result.avatars[name] = await uploadOne(fileName, `avatars/${encodeURIComponent(name)}.png`);
    console.log(`✓ avatars/${name}.png 업로드 완료`);
  }

  const outPath = path.join(rootDir, 'src', 'data', 'storageImageUrls.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
  console.log(`\n다운로드 URL 맵 저장됨: ${outPath}`);

  // 이미 시드된 Firestore 문서가 있다면 imageUrl/avatarUrl도 함께 갱신
  const batch = db.batch();
  let patched = 0;
  for (const [id, url] of Object.entries(result.works)) {
    const ref = db.doc(`works/${id}`);
    const snap = await ref.get();
    if (snap.exists) {
      batch.update(ref, { imageUrl: url, authorAvatarUrl: result.avatars[snap.data().authorName] ?? FieldValue.delete() });
      patched++;
    }
  }
  for (const [id, url] of Object.entries(result.exhibitions)) {
    const ref = db.doc(`exhibitions/${id}`);
    const snap = await ref.get();
    if (snap.exists) {
      batch.update(ref, { imageUrl: url });
      patched++;
    }
  }
  for (const [name, url] of Object.entries(result.avatars)) {
    const ref = db.doc(`users/artist_${name}`);
    const snap = await ref.get();
    if (snap.exists) {
      batch.update(ref, { avatarUrl: url });
      patched++;
    }
  }
  if (patched > 0) {
    await batch.commit();
    console.log(`✓ 기존 Firestore 문서 ${patched}개 imageUrl/avatarUrl 갱신 완료`);
  } else {
    console.log('기존 Firestore 문서가 없어 갱신할 대상이 없습니다. (아직 시드 전이면 정상)');
  }
}

main().catch((err) => {
  console.error('업로드 실패:', err.message);
  process.exit(1);
});
