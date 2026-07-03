import { getAdminAuth } from './_firebaseAdmin.js';

// 인가 코드(Authorization Code)를 카카오 액세스 토큰으로 교환한다.
async function exchangeCodeForAccessToken({ code, redirectUri, restApiKey }) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: restApiKey,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: params,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || '카카오 토큰 발급에 실패했습니다.');
  }
  return data.access_token;
}

// 카카오 인가 코드를 검증하고 Firebase Custom Token을 발급한다.
export async function issueKakaoCustomToken({ code, redirectUri, restApiKey, serviceAccountJson }) {
  const accessToken = await exchangeCodeForAccessToken({ code, redirectUri, restApiKey });

  const kakaoRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const kakaoUser = await kakaoRes.json();
  if (!kakaoRes.ok) {
    throw new Error(kakaoUser.msg || '카카오 사용자 정보를 가져오지 못했습니다.');
  }

  const uid = `kakao:${kakaoUser.id}`;
  const account = kakaoUser.kakao_account || {};
  const name = account.profile?.nickname || '';
  const email = account.email || '';

  const auth = getAdminAuth(serviceAccountJson);
  const customToken = await auth.createCustomToken(uid, { provider: 'kakao' });

  return { customToken, profile: { name, email } };
}
