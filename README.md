**💌 Reletter**

함께 흘러가는 시간, 함께하는 교환일기

> Reletter는 사용자가 비공개 그룹을 만들어 일기를 교환하며 감정을 나눌 수 있는 웹 서비스입니다.  
작성 순서를 따라 일기를 작성하고, 댓글로 교감하며 깊은 유대감을 형성할 수 있어요.

---

## 📌 목차
- [서비스 소개](#서비스-소개)
- [개발자 소개](#개발자-소개)
- [기술 스택](#기술-스택)
- [폴더 구조](#폴더-구조)
- [핵심 기능](#핵심-기능)
- [향후 개선사항](#향후-개선사항)
- [배포주소](#배포주소)

---

## 📝 서비스 소개

- 🔒 **비공개 그룹** 안에서만 일기 공유
- 🔁 **작성 순서 자동 설정** 및 전환
- 💬 **댓글 기능**으로 피드백과 공감
- 📅 **캘린더 UI** 기반으로 일기 열람

---

## 👨‍💻 개발자 소개

| 이름 | 역할 | GitHub |
|------|------|--------|
| 김태희 | 프론트엔드, UI 설계 | [@taekim0809](https://github.com/taekim0809) |
| 박가윤 | 백엔드, DB 설계 | [@nooyag8](https://github.com/nooyag8) |
| 송예원 | 프론트엔드, UI 설계 | [@uomahs](https://github.com/uomahs) |
| 이서정 | 백엔드, DB 설계 | [@ettyio](https://github.com/ettyio) |

---

## 🛠️ 기술 스택

### Frontend
- React
- React Router DOM
- Axios
- Tailwind CSS
- Vite

### Backend
- Node.js (Express)
- MongoDB & Mongoose
- Multer (파일 업로드)
- JWT (인증/보안)

### Infra
- 프론트엔드: **Vercel**
- 백엔드: **Railway**, **Render**, 또는 **로컬 서버**
- DB: **MongoDB Atlas**

---

## 🗂 폴더 구조
```
Challkathon/
├── Reletter/                  # 프론트엔드
│   ├── dist/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/        # UI 컴포넌트
│   │   ├── pages/             # 라우팅 페이지
│   │   ├── assets/
│   │   ├── api/               # Axios 요청 모듈
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── .gitignore
│   ├── eslint.config
│   ├── index
│   ├── package
│   └── package-lock
│
├── BE/                        # 백엔드
│   ├── routes/                # 라우터
│   ├── config/
│   ├── controllers/           # 로직 핸들러
│   ├── js/                    # Mongoose 모델
│   ├── node_modules/
│   ├── uploads/               # 업로드 이미지 저장소
│   ├── .env
│   ├── .gitignore
│   ├── package
│   ├── package-lock
│   └── server.js              # 서버 엔트리
│
└── README.md
```

---

## ⚙️ 핵심 기능

### ✅ 사용자 인증
- 회원가입 / 로그인 / 로그아웃 (JWT 기반)
- 마이페이지에서 정보 수정

### 📔 그룹 기능
- 그룹 생성 / 참여 / 탈퇴
- 작성 순서 자동 지정 및 변경
- 그룹 멤버 리스트 확인

### 📝 일기 작성 및 열람
- 순서에 맞는 사용자만 작성 가능
- 이미지 업로드 지원 (Multer 사용)
- 캘린더 기반 일기 열람

### 💬 댓글 기능
- 일기에 대한 감상 및 피드백 작성 가능
- 댓글 수정/삭제

---

🚀 향후 개선사항

 🔔 알림 기능: 다음 작성자에게 알림 전송, 댓글 알림 등 추가
 
 📱 모바일 반응형 UI 개선
 
 📊 감정 분석 및 일기 요약 기능
 
 🖼️ 마크다운 또는 리치 텍스트 에디터 도입
 
 ⚙️ CI/CD 자동 배포 파이프라인 구축
 
 🔍 검색 기능 (작성자, 키워드, 날짜 기반)
 
 🌈 그룹별 테마 색상 커스터마이징 기능

---

🌐 배포 주소

Frontend: 

Backend: 
