import { useEffect } from 'react';
import './LegalModal.css';

export default function LegalModal({ type, onClose }) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const content = type === 'terms' ? TERMS : PRIVACY;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{content.title}</h2>
          <p className="modal-updated">{content.updated}</p>
          <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <div className="modal-body">
          {content.sections.map((sec, i) => (
            <div key={i} className="legal-section">
              {sec.heading && <h3 className="legal-heading">{sec.heading}</h3>}
              {sec.table ? (
                <table className="legal-table">
                  <thead>
                    <tr>{sec.table.headers.map((h) => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {sec.table.rows.map((row, ri) => (
                      <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                sec.paragraphs.map((p, pi) => (
                  Array.isArray(p)
                    ? <ul key={pi} className="legal-list">{p.map((li, li_i) => <li key={li_i}>{li}</li>)}</ul>
                    : <p key={pi} className="legal-para">{p}</p>
                ))
              )}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <div className="modal-responsible">
            <span className="responsible-label">정보관리책임자</span>
            <span className="responsible-value">미림마이스터고등학교 마이스터기획부 교사 윤다연</span>
          </div>
          <button className="btn-modal-close" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}

/* ── 이용약관 ── */
const TERMS = {
  title: '이용약관',
  updated: '최종 수정일: 2026년 6월 27일',
  sections: [
    {
      heading: '제1조 (목적)',
      paragraphs: [
        'Showfolio 이용약관(이하 "약관")은 Showfolio(이하 "서비스")의 이용 조건 및 절차, 서비스 운영자와 이용자의 권리·의무를 규정함을 목적으로 합니다.',
      ],
    },
    {
      heading: '제2조 (정의)',
      table: {
        headers: ['용어', '정의'],
        rows: [
          ['서비스', 'Showfolio 온라인 전시 플랫폼 및 이와 관련된 일체의 기능'],
          ['이용자', '본 서비스에 접속하여 이를 이용하는 모든 사람'],
          ['아티스트', '서비스에 작품을 등록하고 전시하는 이용자'],
          ['작품', '이용자가 서비스에 업로드한 이미지, 영상, 설명 등 창작 콘텐츠 일체'],
          ['전시회', '운영자 또는 아티스트가 작품을 묶어 공개적으로 구성한 온라인 전시 공간'],
        ],
      },
    },
    {
      heading: '제3조 (약관의 효력 및 변경)',
      paragraphs: [
        [
          '본 약관은 서비스 화면에 게시하거나 이용자에게 공지함으로써 효력이 발생합니다.',
          '서비스 운영자는 관련 법령에 위배되지 않는 범위 내에서 본 약관을 변경할 수 있습니다.',
          '약관이 변경될 경우 변경 내용과 시행일을 명시하여 공지합니다.',
        ],
      ],
    },
    {
      heading: '제4조 (서비스의 내용)',
      paragraphs: [
        '본 서비스는 다음 기능을 제공합니다.',
        [
          '작품 등록·관리 (이미지, 설명, 기술 스택 등)',
          '온라인 전시회 개설 및 참여',
          '아티스트 프로필 및 포트폴리오 관리',
          'AI 기반 포트폴리오 자동 생성',
          '작품 검색, 좋아요, 조회 기능',
          '아티스트 간 팔로우 및 소통 기능',
        ],
      ],
    },
    {
      heading: '제5조 (이용자의 의무)',
      paragraphs: [
        '이용자는 본 서비스를 이용함에 있어 다음 사항을 준수해야 합니다.',
        [
          '타인의 저작권·초상권 등 지식재산권을 침해하는 작품을 등록하지 않습니다.',
          '음란, 폭력, 혐오 표현 등 불법·유해 콘텐츠를 등록하지 않습니다.',
          '다른 이용자를 사칭하거나 허위 정보를 기재하지 않습니다.',
          '서비스의 안정적 운영을 방해하는 행위를 하지 않습니다.',
          '관련 법령 및 본 약관을 성실히 준수합니다.',
        ],
      ],
    },
    {
      heading: '제6조 (저작권 및 콘텐츠 책임)',
      paragraphs: [
        '서비스에 등록된 작품의 저작권은 원작자(이용자)에게 귀속됩니다.',
        'Showfolio는 서비스 운영·홍보 목적에 한하여 등록된 작품을 활용할 수 있으며, 이 경우 작가명을 반드시 표기합니다.',
        '이용자가 등록한 콘텐츠로 인해 발생하는 법적 분쟁의 책임은 해당 이용자에게 있습니다.',
      ],
    },
    {
      heading: '제7조 (서비스의 제공 및 변경)',
      paragraphs: [
        [
          '서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·업데이트 등의 사유로 중단될 수 있습니다.',
          '서비스 운영자는 서비스 내용을 변경하거나 종료할 수 있으며, 이 경우 사전에 공지합니다.',
        ],
      ],
    },
    {
      heading: '제8조 (면책사항)',
      paragraphs: [
        [
          '서비스 운영자는 천재지변, 네트워크 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.',
          '이용자 상호 간 또는 이용자와 제3자 사이에서 발생한 분쟁에 대해 운영자는 개입하지 않으며 이에 따른 손해를 배상할 의무가 없습니다.',
        ],
      ],
    },
    {
      heading: '제9조 (준거법 및 관할)',
      paragraphs: [
        '본 약관의 해석 및 분쟁 해결에는 대한민국 법률을 적용하며, 관련 분쟁은 민사소송법상 관할법원을 제1심 관할법원으로 합니다.',
      ],
    },
    {
      heading: '부칙',
      paragraphs: ['본 약관은 2026년 6월 27일부터 시행합니다.'],
    },
  ],
};

/* ── 개인정보처리방침 ── */
const PRIVACY = {
  title: '개인정보처리방침',
  updated: '최종 수정일: 2026년 6월 27일',
  sections: [
    {
      paragraphs: [
        'Showfolio(이하 "서비스")는 이용자의 개인정보를 중요하게 여기며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 서비스가 수집하는 개인정보의 항목, 수집 방법, 이용 목적, 보유 기간 및 이용자의 권리를 안내합니다.',
      ],
    },
    {
      heading: '제1조 (수집하는 개인정보의 항목 및 수집 방법)',
      table: {
        headers: ['구분', '수집 항목', '수집 방법'],
        rows: [
          ['필수', '이메일 주소, 비밀번호(암호화 저장), 닉네임', '회원가입 시 직접 입력'],
          ['선택', '이름, 학교명, 전공, 관심 분야', '회원가입 시 직접 입력'],
          ['자동 수집', 'IP 주소, 방문 일시, 서비스 이용 기록', '서비스 이용 과정에서 자동 수집'],
          ['작품 정보', '작품 이미지, 제목, 설명, 기술 스택', '작품 등록 시 직접 입력'],
        ],
      },
    },
    {
      heading: '제2조 (개인정보의 이용 목적)',
      paragraphs: [
        [
          '회원 식별 및 서비스 이용에 따른 본인 확인',
          '작품 등록·전시·포트폴리오 기능 제공',
          'AI 포트폴리오 생성 서비스 제공',
          '서비스 관련 공지사항 및 이벤트 안내',
          '불법·부정 이용 방지 및 서비스 보안 유지',
          '서비스 개선을 위한 통계·분석 (개인 식별 불가 형태)',
        ],
      ],
    },
    {
      heading: '제3조 (개인정보의 보유 및 이용 기간)',
      table: {
        headers: ['항목', '보유 기간', '근거'],
        rows: [
          ['회원 정보', '회원 탈퇴 시까지', '서비스 이용 계약'],
          ['서비스 이용 기록', '1년', '통신비밀보호법'],
          ['작품 정보', '이용자 삭제 또는 탈퇴 시까지', '서비스 이용 계약'],
          ['불법·분쟁 관련 기록', '분쟁 해결 시까지', '개인정보 보호법'],
        ],
      },
    },
    {
      heading: '제4조 (개인정보의 제3자 제공)',
      paragraphs: [
        'Showfolio는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외입니다.',
        [
          '이용자가 사전에 동의한 경우',
          '법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우',
        ],
      ],
    },
    {
      heading: '제5조 (이용자의 권리)',
      paragraphs: [
        '이용자는 언제든지 다음 권리를 행사할 수 있습니다.',
        [
          '개인정보 열람 요청',
          '개인정보 수정·삭제 요청',
          '개인정보 처리 정지 요청',
          '마케팅 수신 동의 철회',
        ],
        '권리 행사는 마이페이지 또는 정보관리책임자에게 서면·이메일로 요청하시면 지체 없이 처리합니다.',
      ],
    },
    {
      heading: '제6조 (개인정보의 안전성 확보 조치)',
      paragraphs: [
        [
          '비밀번호 암호화(bcrypt) 저장',
          'HTTPS 암호화 통신 적용',
          '개인정보 접근 권한 최소화',
          '정기적인 보안 취약점 점검',
        ],
      ],
    },
    {
      heading: '부칙',
      paragraphs: ['본 방침은 2026년 6월 27일부터 시행합니다.'],
    },
  ],
};
