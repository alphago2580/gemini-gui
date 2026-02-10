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

// Settings
export const SETTINGS_TITLE = '설정';
export const ARIA_SETTINGS = '설정';
export const ARIA_CLOSE_SETTINGS = '설정 닫기';
export const THEME_LABEL = '테마';
export const THEME_LIGHT = '라이트';
export const THEME_DARK = '다크';
export const THEME_SYSTEM = '시스템';
export const HIGH_CONTRAST_LABEL = '고대비 모드';
export const HIGH_CONTRAST_HINT = '가독성을 높인 고대비 색상';
export const ARIA_HIGH_CONTRAST = '고대비 모드';
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

// localStorage keys
export const STORAGE_KEY_CONVERSATIONS = 'gemini-conversations';
export const STORAGE_KEY_CURRENT_CONVERSATION = 'gemini-current-conversation';
export const STORAGE_KEY_SETTINGS = 'gemini-settings';
export const STORAGE_KEY_THEME = 'gemini-theme';
export const STORAGE_KEY_PROMPT_TEMPLATES = 'gemini-prompt-templates';
export const STORAGE_KEY_SIDEBAR_COLLAPSED = 'gemini-sidebar-collapsed';
export const STORAGE_KEY_HIGH_CONTRAST = 'gemini-high-contrast';
export const STORAGE_KEY_OPEN_TABS = 'gemini-open-tabs';
