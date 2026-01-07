// 챕터 타입
export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  bgm?: string;
  scenes: Scene[];
}

// 씬 타입
export interface Scene {
  id: string;
  background: string;
  characters?: CharacterPosition[];
  dialogues: Dialogue[];
  nextScene?: string;
  choices?: Choice[];
}

// 캐릭터 위치 타입
export interface CharacterPosition {
  characterId: string;
  position: 'left' | 'center' | 'right';
  expression: string;
  animation?: 'shake' | 'bounce' | 'fadeIn';
}

// 대화 타입
export interface Dialogue {
  speaker: string | null; // null = 나레이션
  text: string;
  expression?: string;
  effects?: DialogueEffect[];
}

// 대화 효과 타입
export interface DialogueEffect {
  type: 'stress' | 'flag' | 'screen';
  value: number | string | boolean;
  key?: string; // flag 타입일 때 사용
}

// 선택지 타입
export interface Choice {
  id: string;
  text: string;
  nextScene: string;
  effects?: DialogueEffect[];
}

// 캐릭터 정의 타입
export interface CharacterData {
  id: string;
  name: string;
  nameColor: string;
  expressions: Record<string, string>; // CSS 이모지 또는 이미지 경로
}

// 게임 상태 타입
export interface GameState {
  // 게임 시작 여부
  gameStarted: boolean;

  // 진행 상태
  currentChapter: number;
  currentSceneIndex: number;
  currentDialogueIndex: number;

  // 플레이어 상태
  stressLevel: number;

  // 선택 기록
  choices: Record<string, string>;
  flags: Record<string, boolean>;

  // 화면 효과
  screenEffect: 'none' | 'shake' | 'flash' | 'fadeIn' | 'fadeOut';

  // 챕터 전환
  isTransitioning: boolean;
}

// 챕터 제목 데이터
export const CHAPTER_TITLES: { title: string; subtitle: string }[] = [
  { title: '독촉', subtitle: '시작된 악몽' },
  { title: '방문추심', subtitle: '문 앞의 공포' },
  { title: '해결책 탐색', subtitle: '희망의 빛' },
  { title: '변호사 상담', subtitle: '첫 걸음' },
  { title: '계약', subtitle: '새로운 시작' },
  { title: '금지명령', subtitle: '잠시의 평화' },
  { title: '보정명령', subtitle: '시련의 시간' },
  { title: '개시결정', subtitle: '인정받은 권리' },
  { title: '채권자집회', subtitle: '마지막 관문' },
  { title: '면책', subtitle: '새 출발' },
];
