<p align="center">
  <img src="https://img.shields.io/badge/Built%20by-AI%20Agent%20Team-blueviolet?style=for-the-badge&logo=robot&logoColor=white" />
  <img src="https://img.shields.io/badge/Agents-4%20Claude%20Opus-orange?style=for-the-badge&logo=anthropic&logoColor=white" />
  <img src="https://img.shields.io/badge/Commits-387-green?style=for-the-badge&logo=git&logoColor=white" />
</p>

# ✨ Gemini GUI

> **Google Gemini CLI를 위한 풀스택 Electron 데스크톱 앱** — 4개의 AI 에이전트가 자율적으로 협업하여 48시간 만에 완성

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" />
  <img src="https://img.shields.io/badge/esbuild-FFCF00?style=flat-square&logo=esbuild&logoColor=black" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## 🤖 AI-Built: The Story

이 프로젝트는 **사람이 직접 코드를 작성하지 않았습니다.** 4개의 Claude Opus 에이전트가 [OpenClaw](https://github.com/openclaw/openclaw) 하네스 위에서 **git worktree 브랜치 기반 협업**으로 자율 개발했습니다.

| | Agent 1 | Agent 2 | Agent 3 | Agent 4 |
|---|---------|---------|---------|---------|
| **역할** | UI 컴포넌트 | Hooks & Utils | 테스트 커버리지 | 앱 통합 |
| **머지 횟수** | 37 | 31 | 22 rounds | 11 |
| **주요 산출물** | 84개 컴포넌트 | 108개 훅, 47개 유틸 | 6,518개 테스트 | App.tsx 통합 |

**387 커밋** · **90,000+ LoC** · **6,518 유닛 테스트** · **42 E2E 테스트** · **빌드 경고 0**

> 자세한 개발 과정은 [에이전트 하네스 레포](https://github.com/alphago2580/gemini-gui)의 커밋 히스토리를 참고하세요.

---

## 🏗️ 아키텍처

```
┌──────────────────────────────────────────────────────┐
│                    Electron App                       │
│                                                       │
│  ┌─────────────────┐   IPC    ┌────────────────────┐ │
│  │  Main Process    │◀═══════▶│  Renderer (React)   │ │
│  │                  │         │                      │ │
│  │  • Window Mgmt   │         │  84 Components       │ │
│  │  • File System    │         │  108 Custom Hooks    │ │
│  │  • CLI Bridge     │         │  47 Utility Modules  │ │
│  │                  │         │                      │ │
│  │  ┌────────────┐  │         │  ┌────────────────┐  │ │
│  │  │ Gemini CLI │  │         │  │  Chat Engine   │  │ │
│  │  │ Subprocess │  │         │  │  • Streaming    │  │ │
│  │  │ (stdin/out) │  │         │  │  • Markdown     │  │ │
│  │  └────────────┘  │         │  │  • File Attach  │  │ │
│  └─────────────────┘         │  └────────────────┘  │ │
│                               └────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## ✨ 주요 기능

### 💬 대화
- **실시간 스트리밍 응답** — Gemini CLI stdout 파이핑으로 타이핑 효과
- **다중 세션 관리** — 사이드바에서 대화 전환, 자동 제목 생성
- **대화 기록 저장** — localStorage 기반 영구 보관
- **마크다운 렌더링** — 코드 하이라이팅, 테이블, 리스트

### 📎 파일 & 입력
- **드래그 앤 드롭 파일 첨부** — 이미지, PDF, 텍스트 등
- **파일 미리보기 & 관리** — 첨부 파일 목록, 개별 삭제
- **서식 도구 모음** — 볼드, 이탤릭, 코드 블록 등

### ⚙️ 설정
- **모델 선택** — Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash
- **Temperature / Max Tokens** — 응답 창의성과 길이 조절
- **로컬 저장** — 모든 설정은 기기에만 저장

### 🎨 UI/UX
- **84개 재사용 가능 컴포넌트** — Dialog, Toast, DataTable, CommandPalette, ColorPicker, Timeline 등
- **다크 테마** 기본
- **키보드 단축키** — `Enter` 전송, `Shift+Enter` 줄바꿈, `Ctrl+K` 커맨드 팔레트
- **반응형 레이아웃** — 사이드바 토글, 자동 스크롤

---

## 📊 프로젝트 규모

| 항목 | 수치 |
|------|------|
| 컴포넌트 | 84개 |
| 커스텀 훅 | 108개 |
| 유틸리티 모듈 | 47개 |
| 유닛 테스트 | 6,518개 |
| E2E 테스트 | 42개 |
| 소스 코드 | ~28,500 LoC |
| 테스트 코드 | ~62,000 LoC |
| 총 커밋 | 387 |

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js** 20+
- **Gemini CLI** (`npm install -g @google/gemini-cli`)
- Gemini CLI 인증 완료 (`gemini` 실행 후 Google 로그인)

### 설치

```bash
git clone https://github.com/alphago2580/gemini-gui.git
cd gemini-gui
npm install
```

### 개발 모드

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 패키징 (설치 파일 생성)

```bash
npm run dist
```

| 플랫폼 | 출력 |
|--------|------|
| Windows | `release/*.exe` (NSIS 인스톨러) |
| macOS | `release/*.dmg` |
| Linux | `release/*.AppImage`, `release/*.deb` |

### 테스트

```bash
# 유닛 테스트
npm test

# E2E 테스트
npm run test:e2e

# 전체
npm run test:all
```

---

## 🗂️ 프로젝트 구조

```
gemini-gui/
├── src/
│   ├── main/                  # Electron 메인 프로세스
│   │   └── index.ts           #   CLI 브릿지, 윈도우 관리
│   ├── preload/               # Preload (보안 브릿지)
│   │   ├── index.ts           #   IPC API 노출
│   │   └── types.d.ts         #   타입 정의
│   └── renderer/              # React 프론트엔드
│       ├── App.tsx            #   루트 컴포넌트
│       ├── components/        #   84개 UI 컴포넌트
│       ├── hooks/             #   108개 커스텀 훅
│       └── utils/             #   47개 유틸리티
├── test/
│   └── e2e/                   # Playwright E2E 테스트 (42개)
├── build.js                   # esbuild 빌드 스크립트
├── playwright.config.ts       # E2E 설정
└── package.json
```

---

## 🛠️ 기술 스택

| 카테고리 | 기술 |
|----------|------|
| **프레임워크** | Electron 34 |
| **UI** | React 19 + TypeScript |
| **번들러** | esbuild (< 1초 빌드) |
| **유닛 테스트** | Vitest + @testing-library/react |
| **E2E 테스트** | Playwright + Electron |
| **패키징** | electron-builder |
| **AI 백엔드** | Google Gemini CLI (subprocess) |

---

## 🤖 에이전트 개발 프로세스

이 앱은 **3세대에 걸친 멀티 에이전트 시스템**으로 발전했습니다:

### v1: 단일 에이전트
초기 프로토타입. 한 에이전트가 전체 앱을 scaffold.

### v2: 독립 클론 방식
4개 에이전트가 각각 별도 git clone에서 작업. 서로의 코드를 볼 수 없어 중복 발생.

### v3: Git Worktree 브랜치 협업 ✅
하나의 `.git`을 공유하는 4개의 worktree에서 에이전트별 feature 브랜치 운영.
에이전트가 서로의 브랜치를 참조하고, master에 직접 merge. **실제 팀 협업과 동일한 워크플로우.**

```
gemini-gui/          (master — 통합 브랜치)
├── wt-1/            (agent-1/feature-* 브랜치)
├── wt-2/            (agent-2/hooks-utils-batch-* 브랜치)
├── wt-3/            (agent-3/test-coverage-* 브랜치)
└── wt-4/            (agent-4/app-integration-* 브랜치)
```

---

## 📝 라이선스

[MIT](LICENSE)

---

<p align="center">
  <sub>Built with 🤖 by AI agents, orchestrated by <a href="https://github.com/openclaw/openclaw">OpenClaw</a></sub>
</p>
