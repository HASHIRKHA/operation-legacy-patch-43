
export enum GameState {
  START = 'START',
  LOADOUT = 'LOADOUT',
  MISSION_LOADING = 'MISSION_LOADING',
  MISSION_ACTIVE = 'MISSION_ACTIVE',
  DEBRIEFING = 'DEBRIEFING',
  ENDING = 'ENDING',
  GAME_OVER = 'GAME_OVER'
}

export enum LoadoutType {
  SILENT_MERGE = 'SILENT_MERGE',
  CICD_GHOST = 'CICD_GHOST',
  BUG_HUNTER = 'BUG_HUNTER'
}

export interface Stats {
  hp: number;
  stealth: number;
  style: number;
  focus: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface Choice {
  text: string;
  consequences: {
    hp?: number;
    stealth?: number;
    style?: number;
    focus?: number;
    item?: InventoryItem;
  };
  nextText: string;
}

export interface Level {
  id: number;
  title: string;
  briefing: string;
  encounterType: 'DECISION' | 'PUZZLE' | 'STREALTH_OR_LOUD' | 'BOSS';
  problem: string;
  choices: Choice[];
  debrief: string;
  codeSnippet?: string;
  answer?: string;
}
