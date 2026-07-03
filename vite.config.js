import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { issueKakaoCustomToken } from './api/_kakaoAuth.js'

export default defineConfig(({ mode }) => {
  // .env.local에서 환경변수 로드 (Node.js 서버 컨텍스트 — 브라우저에 노출 안 됨)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      localApiPlugin(env),
    ],
  }
})

// 로컬 개발용 API 미들웨어 플러그인
// Vercel 배포 시에는 api/gemini-portfolio.js 서버리스 함수가 대신 처리함
function localApiPlugin(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/gemini-portfolio', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'POST 요청만 허용됩니다.' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => { body += chunk.toString() })
        req.on('end', async () => {
          try {
            const {
              projectAlias, projectSummary, techStack, mainFeatures,
              roleDescription, difficulty, learning, targetJob, strengths, additionalRequest,
            } = JSON.parse(body)

            const apiKey = env.GEMINI_API_KEY
            if (!apiKey) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' }))
              return
            }

            const techStackStr = Array.isArray(techStack) ? techStack.join(', ') : techStack
            const strengthsStr = Array.isArray(strengths) && strengths.length > 0 ? strengths.join(', ') : '없음'

            const prompt = `당신은 취업 포트폴리오 작성 도우미입니다.
아래 작품 정보와 희망 직무, 강조 역량을 바탕으로 취업용 포트폴리오 초안을 작성해주세요.

[주의사항]
- 입력된 정보에 없는 내용을 임의로 추가하지 마세요.
- 과장된 표현("전문가 수준", "완벽하게 구현" 등)은 피하세요.
- 고등학생 또는 취업 준비생에 어울리는 명확하고 담백한 문장으로 작성하세요.

[작품 정보]
- 작품명(익명): ${projectAlias}
- 프로젝트 요약: ${projectSummary}
- 사용 기술: ${techStackStr}
- 주요 기능: ${mainFeatures}
- 담당 역할: ${roleDescription}
${difficulty ? `- 어려웠던 점: ${difficulty}` : ''}
${learning ? `- 배운 점: ${learning}` : ''}

[희망 직무]
${targetJob}

[강조하고 싶은 역량]
${strengthsStr}

${additionalRequest ? `[추가 요청사항]\n${additionalRequest}` : ''}

다음 항목 순서대로 작성해주세요:
## 1. 포트폴리오 한 줄 소개
## 2. 프로젝트 소개
## 3. 담당 역할
## 4. 사용 기술 및 구현 내용
## 5. 문제 해결 경험
## 6. 프로젝트를 통해 배운 점
## 7. 희망 직무와 연결되는 역량
## 8. 자기소개서에 활용할 수 있는 문장
## 9. 면접 예상 질문 3개

---
※ 이 결과는 AI가 생성한 초안입니다. 반드시 자신의 실제 경험에 맞게 수정한 뒤 활용하세요.`

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
              }
            )

            const data = await response.json()
            if (!response.ok) throw new Error(data.error?.message || `Gemini API 오류 (${response.status})`)

            const result = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (!result) throw new Error('Gemini 응답에서 결과를 파싱하지 못했습니다.')

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, result }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
      })

      server.middlewares.use('/api/kakao-auth', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'POST 요청만 허용됩니다.' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => { body += chunk.toString() })
        req.on('end', async () => {
          try {
            const { code, redirectUri } = JSON.parse(body)
            if (!code || !redirectUri) throw new Error('code와 redirectUri가 필요합니다.')

            const restApiKey = env.KAKAO_REST_API_KEY
            if (!restApiKey) throw new Error('KAKAO_REST_API_KEY 환경 변수가 설정되지 않았습니다.')

            const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_KEY
            if (!serviceAccountJson) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY 환경 변수가 설정되지 않았습니다.')

            const result = await issueKakaoCustomToken({ code, redirectUri, restApiKey, serviceAccountJson })
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, ...result }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
      })
    },
  }
}
