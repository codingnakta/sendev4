import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// serviceAccountJson: FIREBASE_SERVICE_ACCOUNT_KEY 환경 변수 값 (서비스 계정 JSON 문자열)
export function getAdminAuth(serviceAccountJson) {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getAuth();
}
