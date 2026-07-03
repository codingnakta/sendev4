// SECURITY NOTES:
// - FIREBASE_SERVICE_ACCOUNT_KEY, KAKAO_REST_API_KEY는 절대 프론트엔드에 노출하지 않습니다. 이 서버리스 함수에서만 사용합니다.
// - .env / .env.local 파일은 GitHub에 올리지 않습니다.
// - Vercel 배포 시: Project Settings > Environment Variables에 FIREBASE_SERVICE_ACCOUNT_KEY, KAKAO_REST_API_KEY를 등록하세요.

import { issueKakaoCustomToken } from './_kakaoAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST 요청만 허용됩니다.' });
  }

  const { code, redirectUri } = req.body || {};
  if (!code || !redirectUri) {
    return res.status(400).json({ success: false, error: 'code와 redirectUri가 필요합니다.' });
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return res.status(500).json({ success: false, error: 'KAKAO_REST_API_KEY 환경 변수가 설정되지 않았습니다.' });
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) {
    return res.status(500).json({ success: false, error: 'FIREBASE_SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.' });
  }

  try {
    const result = await issueKakaoCustomToken({ code, redirectUri, restApiKey, serviceAccountJson });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
