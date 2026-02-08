# Gemini GUI

Gemini CLI를 위한 Electron GUI 래퍼입니다. 비기술자도 쉽게 Gemini AI를 사용할 수 있도록 만들어진 데스크톱 애플리케이션입니다.

## ✨ 주요 기능

### 💬 대화 기능
- **직관적인 채팅 인터페이스**: 깔끔하고 사용하기 쉬운 채팅 UI
- **실시간 스트리밍 응답**: Gemini의 응답을 실시간으로 확인
- **대화 기록 관리**: 모든 대화를 자동 저장하고 언제든 다시 불러오기
- **다중 대화 세션**: 여러 대화를 동시에 관리

### 📎 파일 첨부
- **드래그 앤 드롭**: 파일을 끌어다 놓기만 하면 첨부
- **다양한 파일 형식 지원**: 이미지, PDF, 텍스트 등
- **파일 미리보기**: 첨부된 파일 목록 확인 및 관리

### ⚙️ 설정 및 커스터마이징
- **모델 선택**: Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash 등 선택 가능
- **Temperature 조절**: 응답의 창의성 수준 조정
- **최대 토큰 설정**: 응답 길이 제어
- **로컬 저장소**: 모든 설정과 대화 기록은 로컬에 안전하게 저장

### 🎨 사용자 경험
- **다크 테마**: 눈이 편한 다크 모드 UI
- **사이드바 네비게이션**: 쉬운 대화 전환
- **자동 스크롤**: 새 메시지 자동 표시
- **키보드 단축키**: Enter로 전송, Shift+Enter로 줄바꿈

## 개발 환경 요구사항

- Node.js 20 이상
- npm 또는 yarn

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 모드 실행

```bash
npm run dev
```

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

### 4. Windows 인스톨러 생성

```bash
npm run dist
```

생성된 인스톨러는 `release/` 디렉토리에 저장됩니다.

## 프로젝트 구조

```
gemini-gui/
├── src/
│   ├── main/           # Electron 메인 프로세스
│   │   └── index.ts    # CLI 브릿지 및 윈도우 관리
│   ├── preload/        # Preload 스크립트
│   │   ├── index.ts    # IPC 브릿지
│   │   └── types.d.ts  # TypeScript 타입 정의
│   └── renderer/       # React 렌더러
│       ├── App.tsx     # 메인 애플리케이션
│       ├── App.css     # 스타일
│       └── index.tsx   # 엔트리 포인트
├── public/
│   └── index.html      # HTML 템플릿
├── build.js            # esbuild 빌드 스크립트
└── package.json
```

## 기술 스택

- **Electron**: 데스크톱 앱 프레임워크
- **React**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **esbuild**: 고속 번들러

## ✅ 구현 완료 기능

### Phase 1 (기본 구조)
- ✅ Electron + React 프로젝트 구조
- ✅ CLI Wrapper 방식 구현
- ✅ 기본 채팅 UI
- ✅ IPC 통신 구현
- ✅ 스트리밍 데이터 처리 (실시간 응답)

### Phase 2 (핵심 기능)
- ✅ 사이드바 네비게이션
- ✅ 대화 저장/불러오기 (localStorage)
- ✅ 설정 UI (모델, Temperature, 최대 토큰)
- ✅ 파일 첨부 기능 (드래그 앤 드롭)
- ✅ 다중 대화 세션 관리
- ✅ 자동 대화 제목 생성
- ✅ 임시 파일 관리

## 🔜 추가 개선 가능 항목

- 마크다운 렌더링 (코드 하이라이팅)
- 이미지 프리뷰
- 대화 검색 기능
- 대화 내보내기 (PDF, TXT)
- 음성 입력 지원
- 테마 커스터마이징
- 단축키 커스터마이징

## 라이선스

MIT
