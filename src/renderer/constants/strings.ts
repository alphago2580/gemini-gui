/**
 * Korean UI string constants for the Gemini GUI application.
 * Centralizes all user-facing strings for maintainability and future i18n support.
 */

// App-level
export const APP_TITLE = 'Gemini GUI';
export const MODEL_PREFIX = '모델:';
export const WELCOME_TITLE = 'Gemini에 오신 것을 환영합니다!';
export const WELCOME_MESSAGE = '아래 입력창에 메시지를 입력하여 대화를 시작하세요.';
export const MESSAGE_PLACEHOLDER = '메시지를 입력하세요... (Enter/Ctrl+Enter: 전송, Shift+Enter: 줄바꿈)';
export const SEND_BUTTON = '전송';
export const SENDING_BUTTON = '전송 중...';
export const STOP_BUTTON = '중지';
export const REGENERATE_BUTTON = '↻ 재생성';
export const REGENERATE_TITLE = '응답 재생성';
export const ARIA_REGENERATE = '응답 재생성';
export const CLOSE_CONFIRM_MESSAGE = '응답이 생성 중입니다. 정말 닫으시겠습니까?';
export const SCROLL_TO_BOTTOM = '새 메시지로 이동';

// Notifications
export const NOTIFICATION_RESPONSE_COMPLETE = '응답이 완료되었습니다.';

// ARIA labels — App
export const ARIA_APP = 'application';
export const ARIA_MESSAGE_LOG = '대화 메시지';
export const ARIA_MESSAGE_INPUT = '메시지 입력';
export const ARIA_SEND = '메시지 전송';
export const ARIA_SENDING = '전송 중';
export const ARIA_STOP_GENERATION = '응답 생성 중지';

// Header actions
export const CLEAR_BUTTON = 'Clear';
export const EXPORT_BUTTON = 'Export';
export const PDF_BUTTON = 'PDF';
export const ARIA_CLEAR = '대화 지우기';
export const TITLE_CLEAR = '대화 지우기 (Ctrl+L)';
export const ARIA_EXPORT = '대화 내보내기';
export const TITLE_EXPORT = 'Markdown으로 내보내기';
export const ARIA_EXPORT_PDF = 'PDF로 내보내기';
export const TITLE_EXPORT_PDF = 'PDF로 내보내기';
export const EXPORT_OPTIONS_LABEL = '내보내기 옵션';
export const EXPORT_MD_OPTION = 'Markdown으로 내보내기';
export const EXPORT_PDF_OPTION = 'PDF로 내보내기';

// Command palette
export const CMD_NEW_CHAT = '새 대화';
export const CMD_CLEAR = '대화 지우기';
export const CMD_SEARCH = '대화 검색';
export const CMD_SETTINGS = '설정 열기';
export const CMD_TOGGLE_SIDEBAR = '사이드바 토글';
export const CMD_EXPORT_MD = 'Markdown으로 내보내기';
export const CMD_EXPORT_PDF = 'PDF로 내보내기';
export const COMMAND_PALETTE_LABEL = '명령 팔레트';
export const COMMAND_SEARCH_PLACEHOLDER = '명령어 검색...';
export const ARIA_COMMAND_SEARCH = '명령어 검색';
export const COMMAND_EMPTY = '일치하는 명령어가 없습니다';

// Sidebar
export const SIDEBAR_LABEL = '사이드바';
export const SIDEBAR_EXPAND = '사이드바 펼치기';
export const SIDEBAR_COLLAPSE = '사이드바 접기';
export const SIDEBAR_EXPAND_TITLE = '사이드바 펼치기 (Ctrl+B)';
export const SIDEBAR_COLLAPSE_TITLE = '사이드바 접기 (Ctrl+B)';
export const NEW_CHAT = '새 대화';
export const ARIA_NEW_CHAT = '새 대화 시작';
export const SEARCH_LABEL = '대화 검색';
export const SEARCH_PLACEHOLDER = '대화 검색...';
export const CONVERSATION_HISTORY = '대화 기록';
export const CONVERSATION_LIST_LABEL = '대화 기록 목록';
export const NO_SEARCH_RESULTS = '검색 결과가 없습니다';
export const NO_CONVERSATIONS = '대화 기록이 없습니다';
export const CONVERSATION_PREFIX = '대화:';
export const DELETE_CONVERSATION_TITLE = '대화 삭제';
export const DELETE_CONVERSATION_PREFIX = '대화 삭제:';
export const SETTINGS_BUTTON = '설정';
export const ARIA_OPEN_SETTINGS = '설정 열기';
export const MESSAGE_COUNT_SUFFIX = '개 메시지';

// Settings
export const SETTINGS_TITLE = '설정';
export const ARIA_SETTINGS = '설정';
export const SETTINGS_SECTION_APPEARANCE = '외관';
export const SETTINGS_SECTION_NOTIFICATIONS = '알림 및 표시';
export const SETTINGS_SECTION_MODEL = '모델 설정';
export const ARIA_CLOSE_SETTINGS = '설정 닫기';
export const THEME_LABEL = '테마';
export const THEME_LIGHT = '라이트';
export const THEME_DARK = '다크';
export const THEME_SYSTEM = '시스템';
export const HIGH_CONTRAST_LABEL = '고대비 모드';
export const HIGH_CONTRAST_HINT = '가독성을 높인 고대비 색상';
export const ARIA_HIGH_CONTRAST = '고대비 모드';
export const NOTIFICATION_SOUND_LABEL = '알림음';
export const NOTIFICATION_SOUND_HINT = '응답 완료 시 알림음 재생';
export const ARIA_NOTIFICATION_SOUND = '알림음';
export const SHOW_TIMESTAMPS_LABEL = '타임스탬프 표시';
export const SHOW_TIMESTAMPS_HINT = '메시지에 시간 정보 표시';
export const ARIA_SHOW_TIMESTAMPS = '타임스탬프 표시';
export const SYSTEM_PROMPT_LABEL = '시스템 프롬프트';
export const SYSTEM_PROMPT_HINT = 'AI의 동작을 지시하는 시스템 메시지';
export const SYSTEM_PROMPT_PLACEHOLDER = '예: 당신은 친절한 한국어 튜터입니다...';
export const ARIA_SYSTEM_PROMPT = '시스템 프롬프트';
export const CLEAR_PROMPT = '초기화';
export const ARIA_CLEAR_PROMPT = '시스템 프롬프트 초기화';
export const MODEL_SELECT_LABEL = '모델 선택';
export const MODEL_SELECT_HINT = '사용할 Gemini 모델을 선택합니다';
export const ARIA_MODEL_SELECT = '모델 선택';
export const TEMPERATURE_HINT = '낮을수록 일관적, 높을수록 창의적';
export const MAX_TOKENS_PREFIX = '최대 토큰:';
export const MAX_TOKENS_HINT = '응답의 최대 길이';
export const FONT_SIZE_PREFIX = '글꼴 크기:';
export const FONT_SIZE_HINT = '메시지 텍스트 크기 (12~20px)';
export const ARIA_FONT_SIZE = '글꼴 크기';
export const INFO_TITLE = '정보';
export const INFO_CLI_VERSION = 'Gemini CLI 버전: 0.17.0';
export const INFO_CONFIG_PATH = '설정 파일 위치: ~/.config/google-gemini-cli/';
export const INFO_GUI_VERSION = 'GUI 버전: 1.0.0';
export const CANCEL_BUTTON = '취소';
export const SAVE_BUTTON = '저장';

// MessageBubble
export const ROLE_USER = '사용자';
export const ROLE_ASSISTANT = 'Gemini';
export const USER_MESSAGE = '사용자 메시지';
export const ASSISTANT_MESSAGE = 'Gemini 메시지';
export const ARIA_EDIT_MESSAGE = '메시지 수정';
export const TITLE_EDIT_MESSAGE = '메시지 수정';
export const ARIA_FORK = '여기서 분기';
export const TITLE_FORK = '여기서 대화 분기';
export const ARIA_DELETE_MESSAGE = '메시지 삭제';
export const TITLE_DELETE_MESSAGE = '메시지 삭제';
export const ARIA_EDIT_INPUT = '메시지 수정 입력';
export const EDIT_SAVE = '저장';
export const ARIA_EDIT_SAVE = '수정 저장';
export const EDIT_CANCEL = '취소';
export const ARIA_EDIT_CANCEL = '수정 취소';

// TypingIndicator
export const ARIA_GENERATING = '응답 생성 중';
export const TYPING_TEXT = '입력 중...';
export const THINKING_TEXT = '생각하는 중...';

// TokenUsage
export const TOKEN_LABEL = '토큰:';
export const ARIA_TOKEN_USAGE = '토큰 사용량';
export const TOKEN_INPUT_TITLE = '입력 토큰';
export const TOKEN_OUTPUT_TITLE = '출력 토큰';
export const TOKEN_TOTAL_TITLE = '총 토큰';
export const TOKEN_USAGE_PROGRESS_LABEL = '토큰 사용률';

// FileAttachment
export const ARIA_FILE_ATTACHMENT = '파일 첨부';
export const ARIA_ATTACHED_FILES = '첨부된 파일 목록';
export const FILE_REMOVE_SUFFIX = '제거';
export const FILE_REMOVE_TITLE = '파일 제거';
export const ARIA_DROP_ZONE = '파일 드래그 앤 드롭 영역';
export const ARIA_FILE_SELECT = '파일 선택';
export const DROP_ZONE_DRAGGING = '파일을 여기에 놓으세요';
export const DROP_ZONE_DEFAULT = '파일 첨부 (클릭 또는 드래그)';

// PromptTemplates
export const ARIA_PROMPT_TEMPLATES = '프롬프트 템플릿';
export const TITLE_PROMPT_TEMPLATES = '프롬프트 템플릿';
export const PROMPT_TEMPLATES_HEADER = '프롬프트 템플릿';
export const ARIA_ADD_TEMPLATE = '새 템플릿 추가';
export const TITLE_ADD_TEMPLATE = '새 템플릿 추가';
export const TEMPLATE_NAME_PLACEHOLDER = '템플릿 이름';
export const ARIA_TEMPLATE_NAME = '템플릿 이름';
export const TEMPLATE_CONTENT_PLACEHOLDER = '템플릿 내용';
export const ARIA_TEMPLATE_CONTENT = '템플릿 내용';
export const TEMPLATE_SAVE = '저장';
export const ARIA_TEMPLATE_SAVE = '템플릿 저장';
export const TEMPLATE_CANCEL = '취소';
export const ARIA_TEMPLATE_CANCEL = '추가 취소';
export const TEMPLATES_EMPTY = '템플릿이 없습니다';
export const DELETE_TITLE = '삭제';
export const DELETE_SUFFIX = '삭제';

// TabBar
export const ARIA_TAB_LIST = '대화 탭';
export const TAB_PREFIX = '탭:';
export const TAB_CLOSE_PREFIX = '탭 닫기:';
export const TAB_CLOSE_TITLE = '탭 닫기';
export const ARIA_NEW_TAB = '새 탭';
export const TITLE_NEW_TAB = '새 탭 (Ctrl+N)';
export const TAB_DRAG_LABEL = '드래그하여 순서 변경';

// MarkdownRenderer
export const COPY_BUTTON_LABEL = '코드 복사';
export const COPY_BUTTON_COPIED = '복사됨';
export const COPY_BUTTON_TEXT = '복사';
export const COPY_BUTTON_CHECK = '✓';
export const COPY_FEEDBACK_TITLE = '복사됨!';
export const MATH_FORMULA_PREFIX = '수식:';

// Toast
export const ARIA_TOAST_CLOSE = '알림 닫기';
export const ARIA_TOAST_CONTAINER = '알림';
export const TOAST_MORE_COUNT = (count: number) => `+${count}개 더`;
export const TOAST_DISMISS_ALL = '모두 닫기';
export const ARIA_TOAST_DISMISS_ALL = '모든 알림 닫기';

// ErrorBoundary
export const ERROR_TITLE = '문제가 발생했습니다';
export const ERROR_RETRY = '다시 시도';

// Default prompt templates
export const DEFAULT_TEMPLATE_TRANSLATE = '번역 (한→영)';
export const DEFAULT_TEMPLATE_TRANSLATE_CONTENT = '다음 한국어 텍스트를 영어로 번역해 주세요:\n\n';
export const DEFAULT_TEMPLATE_REVIEW = '코드 리뷰';
export const DEFAULT_TEMPLATE_REVIEW_CONTENT = '다음 코드를 리뷰하고 개선점을 제안해 주세요:\n\n';
export const DEFAULT_TEMPLATE_SUMMARY = '요약';
export const DEFAULT_TEMPLATE_SUMMARY_CONTENT = '다음 내용을 간결하게 요약해 주세요:\n\n';

// Model display names
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'auto': '자동 (Auto)',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
  'gemini-1.5-pro': 'Gemini 1.5 Pro',
  'gemini-1.5-flash': 'Gemini 1.5 Flash',
};

// useConversations
export const NEW_CONVERSATION_TITLE = '새로운 대화';
export const FORK_SUFFIX = '(분기)';

// useMessageSend
export const ATTACHMENT_PREFIX = '첨부 파일:';
export const FILE_PATH_PREFIX = '파일 경로:';
export const SEND_FAIL_PREFIX = '메시지 전송 실패:';
export const ERROR_PREFIX = '오류 발생:';

// useStreamHandler
export const STREAM_ERROR_PREFIX = '오류:';

// useExport
export const UNTITLED_CONVERSATION = '제목 없는 대화';

// SessionIndicator
export const SESSION_IDLE = '대기 중';
export const SESSION_CONNECTING = '연결 중...';
export const SESSION_CONNECTED = '연결됨';
export const SESSION_ERROR = '연결 오류';
export const SESSION_STATUS_PREFIX = '세션 상태:';

// Bookmarks
export const ARIA_BOOKMARK = '북마크 추가';
export const ARIA_UNBOOKMARK = '북마크 해제';
export const TITLE_BOOKMARK = '북마크 추가';
export const TITLE_UNBOOKMARK = '북마크 해제';
export const STORAGE_KEY_BOOKMARKS = 'gemini-bookmarks';

// Reactions
export const ARIA_ADD_REACTION = '리액션 추가';
export const TITLE_ADD_REACTION = '리액션 추가';
export const ARIA_REMOVE_REACTION = '리액션 제거';
export const STORAGE_KEY_REACTIONS = 'gemini-reactions';
// Context menu
export const CTX_COPY = '복사';
export const CTX_COPY_ICON = '📋';
export const CTX_EDIT = '수정';
export const CTX_EDIT_ICON = '✏️';
export const CTX_PIN = '고정';
export const CTX_PIN_ICON = '📌';
export const CTX_BOOKMARK = '북마크';
export const CTX_BOOKMARK_ICON = '⭐';
export const CTX_REACTION = '반응';
export const CTX_REACTION_ICON = '😀';
export const CTX_FORK = '분기';
export const CTX_FORK_ICON = '🔀';
export const CTX_DELETE = '삭제';
export const CTX_DELETE_ICON = '🗑';
export const CTX_NO_TITLE = '제목 없음';

// Command palette — additional commands
export const CMD_MESSAGE_SEARCH = '전체 메시지 검색';
export const CMD_PERF_MONITOR = '성능 모니터';
export const CMD_TOGGLE_PREVIEW = '입력 미리보기 토글';
export const CMD_BOOKMARKS = '북마크 목록';

// Header action buttons — additional
export const CODE_BUTTON = 'Code';
export const ARIA_CODE_SNIPPETS = '코드 스니펫';
export const TITLE_CODE_SNIPPETS = '코드 스니펫 보기';
export const LINKS_BUTTON = 'Links';
export const ARIA_LINK_COLLECTION = '링크 모음';
export const TITLE_LINK_COLLECTION = '링크 모음 보기';
export const STATS_BUTTON = 'Stats';
export const ARIA_CONVERSATION_STATS = '대화 통계';
export const TITLE_CONVERSATION_STATS = '대화 통계 보기';

// InlineSearch
export const INLINE_SEARCH_LABEL = '대화 내 검색';
export const INLINE_SEARCH_PLACEHOLDER = '대화 내 검색...';
export const INLINE_SEARCH_PREV = '이전 결과';
export const INLINE_SEARCH_PREV_TITLE = '이전 결과 (Shift+Enter)';
export const INLINE_SEARCH_NEXT = '다음 결과';
export const INLINE_SEARCH_NEXT_TITLE = '다음 결과 (Enter)';
export const INLINE_SEARCH_CLOSE_TITLE = '닫기 (Esc)';
export const INLINE_SEARCH_CLOSE_LABEL = '검색 닫기';

// QuickSwitcher
export const QS_LABEL = '빠른 대화 전환';
export const QS_SEARCH_LABEL = '대화 검색';
export const QS_PLACEHOLDER = '대화 전환...';
export const QS_LIST_LABEL = '대화 목록';
export const QS_EMPTY = '일치하는 대화가 없습니다';
export const QS_MESSAGE_SUFFIX = '개 메시지';
export const QS_CURRENT_BADGE = '현재';

// FormattingToolbar
export const FMT_TOOLBAR_LABEL = '텍스트 포맷팅 도구';
export const FMT_BOLD = '굵게';
export const FMT_ITALIC = '기울임';
export const FMT_INLINE_CODE = '인라인 코드';
export const FMT_STRIKETHROUGH = '취소선';
export const FMT_LINK = '링크 삽입';
export const FMT_CODE_BLOCK = '코드 블록';

// ReadingProgressBar
export const READING_PROGRESS_LABEL = '읽기 진행률';

// InputPreview
export const INPUT_PREVIEW_LABEL = '입력 미리보기';
export const INPUT_PREVIEW_TEXT = '미리보기';

// PinnedMessages
export const PINNED_LABEL = '고정된 메시지';
export const PINNED_COUNT_SUFFIX = '개 고정됨';
export const PINNED_NAV_PREFIX = '고정된 메시지로 이동:';
export const PINNED_UNPIN = '고정 해제';

// CodeSnippets
export const SNIPPETS_LABEL = '코드 스니펫';
export const SNIPPETS_CLOSE_LABEL = '코드 스니펫 닫기';
export const SNIPPETS_ALL_FILTER = '전체';
export const SNIPPETS_ALL_FILTER_LABEL = '전체 언어 필터';
export const SNIPPETS_EMPTY_NO_CODE = '이 대화에 코드 블록이 없습니다.';
export const SNIPPETS_EMPTY_NO_MATCH = '필터에 해당하는 코드가 없습니다.';
export const SNIPPETS_NAV_LABEL = '메시지로 이동';
export const SNIPPETS_COPY_LABEL = '코드 복사';

// KeyboardShortcutHelp
export const SHORTCUT_HELP_LABEL = '키보드 단축키';
export const SHORTCUT_HELP_CLOSE = '단축키 도움말 닫기';
export const SHORTCUT_GROUP_GENERAL = '일반';
export const SHORTCUT_GROUP_MESSAGE = '메시지';
export const SHORTCUT_GROUP_SEARCH = '검색';
export const SHORTCUT_GROUP_TABS = '탭';
export const SHORTCUT_NEW_CHAT = '새 대화';
export const SHORTCUT_CLEAR = '대화 내용 지우기';
export const SHORTCUT_SETTINGS = '설정 열기';
export const SHORTCUT_CMD_PALETTE = '명령 팔레트';
export const SHORTCUT_SIDEBAR = '사이드바 토글';
export const SHORTCUT_QUICK_SWITCH = '빠른 대화 전환';
export const SHORTCUT_CLOSE = '현재 패널 닫기';
export const SHORTCUT_SEND = '메시지 전송';
export const SHORTCUT_NEWLINE = '줄바꿈';
export const SHORTCUT_FIND = '대화 내 검색';
export const SHORTCUT_NEXT_TAB = '다음 탭';
export const SHORTCUT_PREV_TAB = '이전 탭';

// LinkCollection
export const LINKS_LABEL = '링크 모음';
export const LINKS_CLOSE_LABEL = '링크 모음 닫기';
export const LINKS_EMPTY = '이 대화에 링크가 없습니다.';
export const LINKS_NAV_LABEL = '메시지로 이동';
export const LINKS_COPY_URL = 'URL 복사';

// ConversationStats
export const STATS_LABEL = '대화 통계';
export const STATS_CLOSE_LABEL = '통계 닫기';
export const STATS_TOTAL_CONV = '전체 대화';
export const STATS_TOTAL_MSG = '전체 메시지';
export const STATS_USER_MSG = '사용자 메시지';
export const STATS_AI_MSG = 'AI 응답';
export const STATS_AVG_MSG = '대화당 평균 메시지';
export const STATS_AVG_LEN = '평균 메시지 길이';
export const STATS_CHAR_SUFFIX = '자';
export const STATS_TOTAL_CHARS = '총 글자 수';
export const STATS_EMPTY_CONV = '빈 대화';
export const STATS_LONGEST = '가장 긴 대화';
export const STATS_SHORTEST = '가장 짧은 대화';
export const STATS_COUNT_SUFFIX = '개';

// BookmarkedMessages
export const BOOKMARKS_LABEL = '북마크된 메시지';
export const BOOKMARKS_TITLE = '북마크';
export const BOOKMARKS_CLOSE_LABEL = '북마크 닫기';
export const BOOKMARKS_FILTER_ALL = '전체';
export const BOOKMARKS_FILTER_ALL_LABEL = '전체 필터';
export const BOOKMARKS_FILTER_USER = '사용자';
export const BOOKMARKS_FILTER_USER_LABEL = '사용자 필터';
export const BOOKMARKS_FILTER_AI = 'AI';
export const BOOKMARKS_FILTER_AI_LABEL = 'AI 필터';
export const BOOKMARKS_EMPTY = '북마크된 메시지가 없습니다. 메시지의 ★ 버튼을 눌러 북마크하세요.';
export const BOOKMARKS_EMPTY_FILTER = '필터에 해당하는 북마크가 없습니다.';
export const BOOKMARKS_REMOVE = '북마크 해제';

// MessageSearch
export const MSG_SEARCH_LABEL = '메시지 검색';
export const MSG_SEARCH_PLACEHOLDER = '전체 대화 내용 검색...';
export const MSG_SEARCH_COUNT_SUFFIX = '개 결과';
export const MSG_SEARCH_EMPTY = '검색 결과가 없습니다';

// PerformancePanel
export const PERF_LABEL = '성능 모니터';
export const PERF_CLOSE_LABEL = '성능 모니터 닫기';
export const PERF_STOP_LABEL = '모니터링 중지';
export const PERF_START_LABEL = '모니터링 시작';
export const PERF_STOP = '중지';
export const PERF_START = '시작';
export const PERF_RESET = '초기화';
export const PERF_RESET_LABEL = '성능 데이터 초기화';
export const PERF_STATUS_ON = '모니터링 중';
export const PERF_STATUS_OFF = '모니터링 중지됨';
export const PERF_RENDER_COUNT = '렌더 횟수';
export const PERF_TOTAL_RENDER = '총 렌더 시간';
export const PERF_AVG_RENDER = '평균 렌더 시간';
export const PERF_SLOWEST = '최고 느린 렌더';
export const PERF_FASTEST = '최고 빠른 렌더';
export const PERF_MEMORY = '메모리 사용량';
export const PERF_APP_STATUS = '앱 상태';
export const PERF_MSG_COUNT_PREFIX = '메시지 수:';
export const PERF_CONV_COUNT_PREFIX = '대화 수:';
export const PERF_RECENT_RENDERS = '최근 렌더';

// EmojiReactionPicker
export const EMOJI_PICKER_LABEL = '이모지 선택';
export const EMOJI_REACTION_PREFIX = '반응';

// MessageContextMenu
export const CTX_MENU_LABEL = '메시지 작업 메뉴';

// WelcomeScreen
export const WELCOME_SUBTITLE = '아래 입력창에 메시지를 입력하거나 제안을 클릭하세요.';
export const WELCOME_SCREEN_LABEL = '환영 화면';
export const WELCOME_SUGGESTIONS_LABEL = '제안 프롬프트';
export const SUGGESTION_BRAINSTORM = '아이디어 브레인스토밍';
export const SUGGESTION_BRAINSTORM_PROMPT = '새로운 사이드 프로젝트 아이디어를 5개 제안해줘';
export const SUGGESTION_WRITING = '글쓰기 도움';
export const SUGGESTION_WRITING_PROMPT = '블로그 게시물의 개요를 작성해줘';
export const SUGGESTION_DEBUG = '코드 디버깅';
export const SUGGESTION_DEBUG_PROMPT = '이 코드의 버그를 찾아줘:\n';
export const SUGGESTION_EXPLAIN = '개념 설명';
export const SUGGESTION_EXPLAIN_PROMPT = '초보자에게 설명하듯이 알려줘: ';
export const SUGGESTION_REVIEW = '코드 리뷰';
export const SUGGESTION_REVIEW_PROMPT = '이 코드를 리뷰하고 개선점을 알려줘:\n';
export const SUGGESTION_TRANSLATE = '번역 도움';
export const SUGGESTION_TRANSLATE_PROMPT = '다음 텍스트를 영어로 번역해줘:\n';

// localStorage keys
export const STORAGE_KEY_CONVERSATIONS = 'gemini-conversations';
export const STORAGE_KEY_CURRENT_CONVERSATION = 'gemini-current-conversation';
export const STORAGE_KEY_SETTINGS = 'gemini-settings';
export const STORAGE_KEY_THEME = 'gemini-theme';
export const STORAGE_KEY_PROMPT_TEMPLATES = 'gemini-prompt-templates';
export const STORAGE_KEY_SIDEBAR_COLLAPSED = 'gemini-sidebar-collapsed';
export const STORAGE_KEY_HIGH_CONTRAST = 'gemini-high-contrast';
export const STORAGE_KEY_OPEN_TABS = 'gemini-open-tabs';
export const STORAGE_KEY_PINNED_MESSAGES = 'gemini-pinned-messages';

// ConfirmDialog
export const CONFIRM_CLEAR_TITLE = '대화 지우기';
export const CONFIRM_CLEAR_MESSAGE = '모든 메시지가 삭제됩니다. 계속하시겠습니까?';
export const CONFIRM_DELETE_TITLE = '대화 삭제';
export const CONFIRM_DELETE_MESSAGE = '대화를 삭제하시겠습니까?';

// NotificationBanner
export const BANNER_CONNECTION_ERROR = '서버 연결에 실패했습니다. 네트워크 상태를 확인해 주세요.';
export const BANNER_RETRY = '다시 시도';

// Settings Accordion sections
export const SETTINGS_SECTION_GENERAL = '일반';
export const SETTINGS_SECTION_ADVANCED = '고급 설정';

// Settings tab navigation
export const SETTINGS_TAB_GENERAL = '일반';
export const SETTINGS_TAB_APPEARANCE = '외관';
export const SETTINGS_TAB_SHORTCUTS = '단축키';
export const SETTINGS_TAB_ADVANCED = '고급';
export const SETTINGS_TABS_ARIA = '설정 카테고리';
export const SETTINGS_SHORTCUTS_READONLY_HINT = '단축키는 시스템에서 자동으로 설정됩니다';

// Conversation DropdownMenu
export const CONV_MENU_LABEL = '대화 옵션';
export const CONV_MENU_OPEN = '대화 열기';
export const CONV_MENU_DELETE = '삭제';
export const CONV_DRAG_LABEL = '드래그하여 순서 변경';

// ProgressBar — token usage
export const TOKEN_PROGRESS_LABEL = '토큰 사용량';

// Drawer
export const DRAWER_BOOKMARKS_TITLE = '북마크';
export const DRAWER_BOOKMARKS_ARIA = '북마크 패널';

// ScrollToTop
export const SCROLL_TOP_ARIA = '맨 위로 스크롤';

// EmptyState
export const EMPTY_STATE_NO_MESSAGES = '메시지가 없습니다';
export const EMPTY_STATE_NO_MESSAGES_DESC = '새 대화를 시작하거나 메시지를 입력하세요';
export const EMPTY_STATE_NEW_CHAT_ACTION = '새 대화 시작';

// CopyButton
export const COPY_CONVERSATION_ARIA = '대화 내용 복사';

// Collapsible
export const COLLAPSIBLE_TOKEN_DETAILS = '토큰 상세 정보';

// ImageViewer
export const IMAGE_VIEWER_ARIA = '이미지 뷰어';

// SpeedDial
export const RESIZABLE_SIDEBAR_ARIA = '사이드바 크기 조절';
export const SPEED_DIAL_ARIA = '빠른 액션';
export const SPEED_DIAL_NEW_CHAT = '새 대화';
export const SPEED_DIAL_SEARCH = '검색';
export const SPEED_DIAL_BOOKMARKS = '북마크';
export const SPEED_DIAL_SETTINGS = '설정';
export const SPEED_DIAL_SHORTCUTS = '단축키';

// AlertBanner
export const ALERT_BANNER_STREAMING = '응답 생성 중입니다. 잠시 기다려 주세요.';
export const ALERT_BANNER_TOKEN_WARNING_TITLE = '토큰 한도 경고';
export const ALERT_BANNER_TOKEN_WARNING = '토큰 사용량이 90%를 초과했습니다.';

// Breadcrumb
export const BREADCRUMB_HOME = 'Gemini';
export const BREADCRUMB_CHAT = '대화';

// Rating (message feedback)
export const RATING_LABEL = '응답 평가';
export const RATING_ARIA = '응답 품질 평가';

// MeterBar (memory usage)
export const METER_MEMORY_LABEL = '메모리';
export const METER_MEMORY_ARIA = '메모리 사용량';

// Popover (session details)
export const POPOVER_SESSION_ARIA = '세션 상세 정보';
export const POPOVER_SESSION_TITLE = '세션 정보';
export const POPOVER_SESSION_STATUS = '상태';
export const POPOVER_SESSION_MESSAGES = '메시지 수';
export const POPOVER_SESSION_MODEL = '모델';

// SegmentedControl (view mode)
export const SEGMENTED_VIEW_ARIA = '보기 모드';
export const SEGMENTED_VIEW_CHAT = '채팅';
export const SEGMENTED_VIEW_COMPACT = '간략';

// Timeline (conversation activity)
export const TIMELINE_ARIA = '대화 타임라인';

// TagInput (message tags)
export const TAG_INPUT_PLACEHOLDER = '태그 추가...';
export const TAG_INPUT_LABEL = '메시지 태그';
export const STORAGE_KEY_MESSAGE_TAGS = 'gemini-message-tags';

// Avatar
export const AVATAR_USER_NAME = '사용자';
export const AVATAR_ASSISTANT_NAME = 'Gemini';

// AvatarGroup (conversation participants)
export const AVATAR_GROUP_ARIA = '대화 참여자';

// Divider
export const DIVIDER_TOKEN_LABEL = '상세 정보';

// CountdownTimer (response timeout)
export const COUNTDOWN_LABEL = '응답 대기';

// Pagination (message history)
export const PAGINATION_ARIA = '메시지 페이지 이동';

// Switch (quick toggle)
export const SWITCH_PREVIEW_LABEL = '미리보기';
export const SWITCH_PREVIEW_ARIA = '입력 미리보기 토글';

// Stepper (onboarding)
export const STEPPER_WELCOME = '환영';
export const STEPPER_SETUP = '준비';
export const STEPPER_START = '대화';

// Tabs (panel tabs)
export const TABS_INFO_ARIA = '정보 탭';
export const TAB_STATS_LABEL = '통계';
export const TAB_TIMELINE_LABEL = '타임라인';

// TreeView (conversation structure)
export const TREE_CONVERSATIONS_LABEL = '대화 구조';

// ColorSwatch (accent colors)
export const COLOR_SWATCH_LABEL = '강조 색상';
export const STORAGE_KEY_ACCENT_COLOR = 'gemini-accent-color';

// NumberInput (page jump)
export const PAGE_JUMP_ARIA = '페이지 이동';

// Conversation Folders
export const FOLDER_SECTION_LABEL = '폴더';
export const FOLDER_ALL_CONVERSATIONS = '전체 대화';
export const FOLDER_UNCATEGORIZED = '미분류';
export const FOLDER_CREATE = '새 폴더';
export const FOLDER_CREATE_PLACEHOLDER = '폴더 이름...';
export const FOLDER_CREATE_ARIA = '새 폴더 만들기';
export const FOLDER_RENAME = '이름 변경';
export const FOLDER_RENAME_ARIA = '폴더 이름 변경';
export const FOLDER_DELETE = '폴더 삭제';
export const FOLDER_DELETE_ARIA = '폴더 삭제';
export const FOLDER_MOVE_TO = '폴더로 이동';
export const FOLDER_MOVE_TO_ARIA = '대화를 폴더로 이동';
export const FOLDER_REMOVE_FROM = '폴더에서 제거';
export const FOLDER_EMPTY = '폴더에 대화가 없습니다';
export const FOLDER_TOGGLE_ARIA = '폴더 열기/닫기';
export const STORAGE_KEY_FOLDERS = 'gemini-conversation-folders';
export const STORAGE_KEY_FOLDER_ASSIGNMENTS = 'gemini-folder-assignments';
export const FOLDER_COLORS = ['#4A90D9', '#E67E22', '#2ECC71', '#9B59B6', '#E74C3C', '#1ABC9C', '#F39C12', '#3498DB'];

// DropdownMenu (more actions)
export const MORE_ACTIONS_LABEL = '추가 작업';
export const MORE_ACTIONS_BUTTON = '⋮';
export const ACTION_PERF_MONITOR = '성능 모니터';
export const ACTION_SHORTCUTS = '단축키 도움말';
export const ACTION_HIGH_CONTRAST = '고대비 모드';

// InputCharacterCounter
export const CHAR_COUNTER_LABEL = '입력 통계';
export const CHAR_COUNTER_CHARS = (n: number) => `${n}자`;
export const CHAR_COUNTER_WORDS = (n: number) => `${n}단어`;
export const CHAR_COUNTER_TOKENS = (n: number) => `~${n}토큰`;
export const CHAR_COUNTER_LIMIT = (current: number, max: number) => `${current}/${max}`;

// StatusBar
export const STATUS_BAR_ARIA = '상태 표시줄';
export const STATUS_BAR_MODEL_LABEL = '모델';
export const STATUS_BAR_TOKENS_LABEL = '토큰';
export const STATUS_BAR_ENCODING_LABEL = 'UTF-8';
export const STATUS_BAR_LINE_COL = (line: number, col: number) => `Ln ${line}, Col ${col}`;

// TextDiff
export const TEXT_DIFF_LABEL = '텍스트 비교';
export const TEXT_DIFF_ADDED_PREFIX = '추가됨';
export const TEXT_DIFF_REMOVED_PREFIX = '삭제됨';
export const TEXT_DIFF_UNCHANGED_PREFIX = '변경 없음';
export const TEXT_DIFF_OLD_LABEL = '이전';
export const TEXT_DIFF_NEW_LABEL = '변경';
export const TEXT_DIFF_STATS = (added: number, removed: number) => `+${added} -${removed}`;

// MentionAutocomplete — commands
export const MENTION_PLACEHOLDER = '메시지를 입력하세요... (@로 명령어 검색)';
export const MENTION_CMD_TRANSLATE = '번역';
export const MENTION_CMD_TRANSLATE_DESC = '텍스트를 번역합니다';
export const MENTION_CMD_SUMMARIZE = '요약';
export const MENTION_CMD_SUMMARIZE_DESC = '내용을 요약합니다';
export const MENTION_CMD_EXPLAIN = '설명';
export const MENTION_CMD_EXPLAIN_DESC = '개념을 쉽게 설명합니다';
export const MENTION_CMD_CODE = '코드';
export const MENTION_CMD_CODE_DESC = '코드를 작성합니다';
export const MENTION_CMD_REVIEW = '리뷰';
export const MENTION_CMD_REVIEW_DESC = '코드를 리뷰합니다';
export const MENTION_CMD_FIX = '수정';
export const MENTION_CMD_FIX_DESC = '오류를 수정합니다';
export const MENTION_CMD_HELP = '도움말';
export const MENTION_CMD_HELP_DESC = '사용 가능한 명령어를 보여줍니다';
