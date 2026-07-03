// 이미지 매핑 — 이미지는 Firestore가 아니라 로컬 번들에서 가져온다.
// (아직 Firebase Storage에 업로드하지 않았으므로, id/이름으로 로컬 에셋과 연결)
// 나중에 Storage로 옮기면 이 파일 대신 문서의 imageUrl을 쓰면 된다.
import exImg1 from '../assets/디자인학과졸업작품전.png';
import exImg2 from '../assets/봄의시선.png';
import exImg3 from '../assets/ai디지털아트페스티벌.png';
import img1 from '../assets/1.png';
import img2 from '../assets/2.png';
import img3 from '../assets/3.png';
import img4 from '../assets/4.png';
import img5 from '../assets/5.png';
import img6 from '../assets/6.png';
import img7 from '../assets/7.png';
import img8 from '../assets/8.png';
import img9 from '../assets/9.png';
import img10 from '../assets/10.png';
import img11 from '../assets/11.png';
import img12 from '../assets/12.png';
import avatar오스틴 from '../assets/오스틴.png';
import avatar송찬의 from '../assets/송찬의.png';
import avatar문정빈 from '../assets/문정빈.png';
import avatar홍창기 from '../assets/홍창기.png';
import avatar박동원 from '../assets/박동원.png';
import avatar신민재 from '../assets/신민재.png';
import avatar문보경 from '../assets/문보경.png';
import avatar문성주 from '../assets/문성주.png';
import avatar구본혁 from '../assets/구본혁.png';
import avatar이주헌 from '../assets/이주헌.png';
import avatar김영우 from '../assets/김영우.png';
import avatar이정용 from '../assets/이정용.png';

// 작품 문서 ID → 이미지
export const workImages = {
  '1': img1, '2': img2, '3': img3, '4': img4, '5': img5, '6': img6,
  '7': img7, '8': img8, '9': img9, '10': img10, '11': img11, '12': img12,
};

// 전시회 문서 ID → 이미지
export const exhibitionImages = {
  '1': exImg1, '2': exImg2, '3': exImg3,
};

// 작가 이름 → 아바타 이미지
export const avatarImages = {
  '오스틴': avatar오스틴, '송찬의': avatar송찬의, '문정빈': avatar문정빈,
  '홍창기': avatar홍창기, '박동원': avatar박동원, '신민재': avatar신민재,
  '문보경': avatar문보경, '문성주': avatar문성주, '구본혁': avatar구본혁,
  '이주헌': avatar이주헌, '김영우': avatar김영우, '이정용': avatar이정용,
};
