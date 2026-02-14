# TODO — Gemini GUI Feature Backlog

Priority: 🔴 High | 🟡 Medium | 🟢 Low

## 🔴 High Priority

### Markdown Rendering
- [x] Render assistant responses as Markdown (bold, italic, lists, headers)
- [x] Code blocks with syntax highlighting (highlight.js or prism)
- [x] Inline code styling
- [x] LaTeX/math rendering support (KaTeX)
- [x] Markdown table rendering
- [x] Code block copy button

### Conversation Management
- [x] Search through conversation history
- [x] Export conversation as Markdown file
- [x] Export conversation as PDF
- [x] Delete individual messages
- [x] Clear conversation
- [x] Delete conversation from sidebar

### Theme System
- [x] Dark/Light theme toggle
- [x] System theme detection (prefers-color-scheme)
- [x] Theme persistence in settings
- [x] CSS variables for all colors

## 🟡 Medium Priority

### Multi-Tab Support
- [x] Tab bar for multiple conversations
- [x] New tab button
- [x] Close tab with confirmation
- [x] Tab switching with keyboard shortcuts (Ctrl+Tab)

### Keyboard Shortcuts
- [x] Ctrl+N: New conversation
- [x] Ctrl+L: Clear conversation
- [x] Ctrl+F: Search in conversation
- [x] Ctrl+,: Open settings
- [x] Escape: Close modals/panels
- [x] Ctrl+Enter: Send message (alternative)
- [x] Ctrl+B: Toggle sidebar
- [x] Ctrl+Shift+P: Command palette

### Input Enhancements
- [x] Auto-resize textarea
- [x] Drag & drop file attachment
- [x] Paste image from clipboard
- [x] Message edit (click to edit sent message)
- [x] Command palette (Ctrl+Shift+P)

### UI Polish
- [x] Loading spinner during response generation
- [x] Typing indicator animation
- [x] Smooth scroll to bottom on new messages
- [x] Toast notifications for errors
- [x] Responsive sidebar (collapsible)

## 🟢 Low Priority

### Advanced Features
- [x] Conversation branching (fork from any message)
- [x] Token usage display
- [x] Model selection dropdown
- [x] System prompt editor
- [x] Prompt templates/presets

### UX Enhancements
- [x] Session status indicator — visual connection state (idle/connecting/connected/error) in header
- [x] Message count badge — show message count per conversation in sidebar
- [x] UserAvatar — role-based avatar component with initials and icon display
- [x] ProgressBar — versatile progress indicator with variants, sizes, animation
- [x] Tooltip — hover/focus tooltip with delay and 4 positions
- [x] Badge — notification count/dot indicator with wrapper and inline modes
- [x] Skeleton — loading placeholder with shimmer animation for text/circular/rectangular
- [x] Accordion — expandable/collapsible content sections with single/multiple mode
- [x] Switch — accessible toggle switch with sizes and labels
- [x] Chip — selectable/removable tag chips with variants and icons
- [x] AvatarGroup — stacked avatar display with overflow count
- [x] Divider — horizontal/vertical separator with label support
- [x] Message bookmarking — star/unstar messages with persistent storage and bookmarks panel
- [x] Notification sound — two-tone chime on response completion with Settings toggle
- [x] Message reactions — emoji reactions via picker with persistent storage and toggle chips
- [x] Show timestamps toggle — Settings toggle to show/hide message timestamps

### Accessibility
- [x] ARIA labels on all interactive elements
- [x] Screen reader announcements for new messages
- [x] Focus management for keyboard navigation
- [x] High contrast mode

### Developer Experience
- [ ] Storybook for component development
- [ ] E2E test coverage for critical flows
- [x] Performance monitoring (React Profiler)
- [x] Error boundary components

### Code Quality
- [x] Extract UI string constants for i18n readiness
- [x] React.memo on all components
- [x] useCallback/useMemo optimization
- [x] Zero TypeScript `any` types
- [x] Zero TypeScript type-checking errors
- [x] Stable message IDs for React keys
- [x] Custom hooks extracted from App.tsx (12 hooks)
- [ ] Storybook for component development
- [ ] E2E tests with Playwright

## 🔵 TokenBurner v5 Backlog (NEW)

### Component Improvements
- [ ] ConfirmDialog — 키보드 단축키 (Enter=확인, Escape=취소) 추가
- [ ] MessageBubble — 코드블록 언어 감지 자동화
- [ ] Sidebar — 드래그로 대화 순서 변경
- [ ] CommandPalette — 퍼지 검색 개선 (한글 초성 검색)
- [ ] TabBar — 탭 드래그로 순서 변경
- [ ] Toast — 스택 형태로 여러 개 동시 표시
- [ ] Settings — 카테고리별 섹션 분리 (일반/외관/단축키/고급)
- [ ] ChatInput — 멘션 기능 (@명령어 자동완성)
- [ ] MessageList — 무한 스크롤 (오래된 메시지 lazy load)
- [ ] Sidebar — 대화 폴더/태그 분류 기능

### New Hooks
- [ ] useLocalStorage — 제네릭 로컬스토리지 훅 (JSON 직렬화, 기본값)
- [ ] useDebounce — 디바운스 훅 (검색 입력 등에 활용)
- [ ] useIntersectionObserver — 무한 스크롤/lazy load용
- [ ] useMediaQuery — CSS 미디어 쿼리 반응형 훅
- [ ] useClipboard — 클립보드 복사/붙여넣기 훅
- [ ] usePrevious — 이전 값 추적 훅
- [ ] useEventListener — 타입 안전한 이벤트 리스너 훅
- [ ] useKeyCombo — 키보드 단축키 조합 훅 (Ctrl+Shift+P 등)
- [ ] useUndoRedo — 실행취소/다시실행 상태 관리 훅
- [ ] useIdle — 유저 비활성 감지 훅

### Test Coverage
- [ ] 통합 테스트: App.tsx 렌더링 + 라우팅
- [ ] 통합 테스트: 메시지 전송 → 응답 수신 플로우
- [ ] 통합 테스트: 테마 전환 → CSS 변수 변경 확인
- [ ] 접근성 테스트: axe-core 기반 자동화
- [ ] 스냅샷 테스트: 주요 컴포넌트 10개
- [ ] 에러 바운더리 테스트: 컴포넌트 크래시 복구

### Utils
- [ ] formatRelativeTime — "방금 전", "5분 전" 등 상대 시간 포맷터
- [ ] debounce/throttle — 유틸리티 함수 (lodash 의존 제거)
- [ ] deepEqual — 깊은 비교 유틸리티
- [ ] classNames — 조건부 CSS 클래스 결합 유틸리티
- [ ] sanitizeHtml — XSS 방지 HTML 산테이터
- [ ] parseMarkdownMeta — 마크다운 프론트매터 파서

### Performance
- [ ] 가상 스크롤 — 긴 메시지 목록에 react-window 적용
- [ ] 이미지 lazy loading — IntersectionObserver 기반
- [ ] Web Worker — 마크다운 파싱 오프로드
- [ ] 번들 크기 분석 — webpack-bundle-analyzer 또는 vite-plugin-inspect

---
*Updated by agent team. Check PROGRESS.md for completion status.*
