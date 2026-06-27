// SECURITY NOTES:
// - 프론트엔드에 API 키를 넣으면 개발자 도구에서 노출됩니다. 절대 넣지 마세요.
// - Gemini API 호출은 이 Vercel Serverless Function에서만 처리합니다.
// - .env / .env.local 파일은 GitHub에 올리지 않습니다.
// - Vercel 배포 시: Project Settings > Environment Variables에 GEMINI_API_KEY를 등록하세요.
// - Gemini로 전송하는 데이터는 이름, 학번, 이메일, 사진 경로를 제외한 최소 정보만 포함합니다.
// - AI 생성 결과는 초안이며, 학생이 실제 경험에 맞게 검토하고 수정해야 합니다.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST 요청만 허용됩니다.' });
  }

  const {
    projectAlias, projectSummary, techStack, mainFeatures,
    roleDescription, difficulty, learning, targetJob, strengths, additionalRequest,
  } = req.body || {};

  const required = { projectAlias, projectSummary, techStack, mainFeatures, roleDescription, targetJob };
  const missing = Object.entries(required).filter(([, v]) => !v || (Array.isArray(v) && v.length === 0));
  if (missing.length > 0) {
    return res.status(400).json({ success: false, error: `필수 항목이 누락되었습니다: ${missing.map(([k]) => k).join(', ')}` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' });
  }

  const techStackStr = Array.isArray(techStack) ? techStack.join(', ') : techStack;
  const strengthsStr = Array.isArray(strengths) && strengths.length > 0 ? strengths.join(', ') : '없음';

  const prompt = `당신은 취업 포트폴리오 작성 도우미입니다.
아래 작품 정보와 희망 직무, 강조 역량을 바탕으로 취업용 포트폴리오 초안을 작성해주세요.

[주의사항]
- 입력된 정보에 없는 내용을 임의로 추가하지 마세요.
- 학생이 실제로 수행한 것처럼 자연스럽게 정리하되 과장된 표현은 피하세요.
- "전문가 수준", "완벽하게 구현", "압도적인 역량" 같은 표현은 쓰지 마세요.
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
※ 이 결과는 AI가 생성한 초안입니다. 반드시 자신의 실제 경험과 역할에 맞게 수정한 뒤 활용하세요.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini API 오류 (${response.status})`);
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) throw new Error('Gemini 응답에서 결과를 파싱하지 못했습니다.');

    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
