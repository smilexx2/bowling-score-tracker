export interface Frame {
  rolls: string[];
  score: number;
  isComplete: boolean;
}

export interface Player {
  name: string;
  frames: Frame[];
  totalScore: number;
}

export interface GameState {
  currentPlayerIndex: number;
  currentFrameIndex: number;
  currentRollIndex: number;
}
