import { Input } from "@/components/ui/input";
import { GameState, Player } from "@/types";

interface FrameInputsProps {
  players: Player[];
  playerIndex: number;
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
}

const isValidRoll = (value: string): boolean => {
  return /^[0-9X/-]$/.test(value) || value === "";
};

const getRollValue = (roll: string): number => {
  if (!roll) return 0;
  if (roll === "X") return 10;
  if (roll === "/") return 10;
  return parseInt(roll);
};

const calculateFrameScore = (player: Player, frameIndex: number): number => {
  const frames = player.frames;
  const currentFrame = frames[frameIndex];

  if (!currentFrame || !currentFrame.rolls.length) return 0;

  let score = 0;
  const rolls = currentFrame.rolls;

  // 10th frame special handling
  if (frameIndex === 9) {
    return rolls.reduce((sum, roll) => {
      if (roll === "/") {
        return sum - getRollValue(rolls[0]) + 10;
      }
      return sum + getRollValue(roll);
    }, 0);
  }

  // Strike
  if (rolls[0] === "X") {
    score = 10;

    // First bonus ball
    const nextFrame = frames[frameIndex + 1];
    if (nextFrame && nextFrame.rolls.length > 0) {
      if (nextFrame.rolls[0] === "X") {
        score += 10;

        // Second bonus ball
        if (frameIndex < 8) {
          const nextNextFrame = frames[frameIndex + 2];
          if (nextNextFrame && nextNextFrame.rolls.length > 0) {
            score += getRollValue(nextNextFrame.rolls[0]);
          }
        } else {
          // For frame 9, look at 10th frame's second roll
          if (nextFrame.rolls.length > 1) {
            score += getRollValue(nextFrame.rolls[1]);
          }
        }
      } else {
        score += getRollValue(nextFrame.rolls[0]);
        if (nextFrame.rolls[1] === "/") {
          score += 10 - getRollValue(nextFrame.rolls[0]);
        } else if (nextFrame.rolls[1]) {
          score += getRollValue(nextFrame.rolls[1]);
        }
      }
    }
  }
  // Spare
  else if (rolls[1] === "/") {
    score = 10;
    const nextFrame = frames[frameIndex + 1];
    if (nextFrame && nextFrame.rolls.length > 0) {
      score += getRollValue(nextFrame.rolls[0]);
    }
  }
  // Open frame
  else {
    score = getRollValue(rolls[0]) + getRollValue(rolls[1]);
  }

  return score;
};

const FrameInputs = ({
  players,
  playerIndex,
  gameState,
  setGameState,
}: FrameInputsProps) => {
  const advanceGame = () => {
    const { currentPlayerIndex, currentFrameIndex, currentRollIndex } =
      gameState;
    const currentFrame = players[currentPlayerIndex].frames[currentFrameIndex];

    // If it's a strike or we've completed both rolls (or three in 10th frame)
    if (currentFrame.isComplete) {
      // Move to next player
      if (currentPlayerIndex < players.length - 1) {
        setGameState({
          currentPlayerIndex: currentPlayerIndex + 1,
          currentFrameIndex: currentFrameIndex,
          currentRollIndex: 0,
        });
      } else {
        // Move to next frame
        setGameState({
          currentPlayerIndex: 0,
          currentFrameIndex: currentFrameIndex + 1,
          currentRollIndex: 0,
        });
      }
    } else {
      // Move to next roll
      setGameState({
        ...gameState,
        currentRollIndex: currentRollIndex + 1,
      });
    }
  };

  const handleRollInput = (
    playerIndex: number,
    frameIndex: number,
    rollIndex: number,
    value: string
  ) => {
    // Only allow input for the current active position
    if (
      playerIndex !== gameState.currentPlayerIndex ||
      frameIndex !== gameState.currentFrameIndex ||
      rollIndex !== gameState.currentRollIndex
    ) {
      return;
    }

    if (!isValidRoll(value)) return;

    const player = players[playerIndex];
    const frame = player.frames[frameIndex];

    // Handle input validation
    if (rollIndex === 0) {
      if (value === "X" && frameIndex !== 9) {
        frame.rolls = ["X"];
        frame.isComplete = true;
      } else if (value === "/" || parseInt(value) > 10) {
        return;
      } else {
        frame.rolls[0] = value;
      }
    } else if (rollIndex === 1) {
      const firstRoll = parseInt(frame.rolls[0]);
      if (value === "/") {
        if (frame.rolls[0] === "X") return;
        frame.rolls[1] = "/";
        frame.isComplete = true;
      } else if (
        value === "X" &&
        frameIndex === 9 &&
        (frame.rolls[0] === "X" || frame.rolls[0] === "/")
      ) {
        frame.rolls[1] = "X";
      } else {
        const secondRoll = parseInt(value);
        if (
          isNaN(secondRoll) ||
          (!isNaN(firstRoll) && firstRoll + secondRoll > 10)
        )
          return;
        frame.rolls[1] = value;
        frame.isComplete = true;
      }
    } else if (rollIndex === 2 && frameIndex === 9) {
      if (
        frame.rolls[0] === "X" ||
        frame.rolls[1] === "X" ||
        frame.rolls[1] === "/"
      ) {
        if (value === "X" || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
          frame.rolls[2] = value;
          frame.isComplete = true;
        }
      }
    }

    // Calculate scores
    let runningScore = 0;
    for (let i = 0; i <= frameIndex; i++) {
      const frameScore = calculateFrameScore(player, i);
      player.frames[i].score = frameScore;
      runningScore += frameScore;
    }
    player.totalScore = runningScore;

    // If valid input was entered, advance the game
    if (value) {
      if ((value === "X" && frameIndex !== 9) || frame.isComplete) {
        advanceGame();
      } else if (value !== "") {
        advanceGame();
      }
    }
  };

  const isActiveInput = (
    playerIndex: number,
    frameIndex: number,
    rollIndex: number
  ) => {
    return (
      playerIndex === gameState.currentPlayerIndex &&
      frameIndex === gameState.currentFrameIndex &&
      rollIndex === gameState.currentRollIndex
    );
  };

  return players[playerIndex].frames.map((frame, frameIndex) => (
    <div
      key={frameIndex}
      className={`flex flex-col items-center border p-2 ${
        frameIndex === gameState.currentFrameIndex &&
        playerIndex === gameState.currentPlayerIndex
          ? "bg-blue-50"
          : ""
      }`}
    >
      <div className="text-sm font-bold">Frame {frameIndex + 1}</div>
      <div className="flex gap-1">
        <Input
          type="text"
          className={`w-full h-8 text-center ${
            isActiveInput(playerIndex, frameIndex, 0) ? "border-blue-500" : ""
          }`}
          value={frame.rolls[0] || ""}
          onChange={(e) =>
            handleRollInput(playerIndex, frameIndex, 0, e.target.value)
          }
          maxLength={1}
          disabled={!isActiveInput(playerIndex, frameIndex, 0)}
        />
        {(frameIndex === 9 || frame.rolls[0] !== "X") && (
          <Input
            type="text"
            className={`w-full h-8 text-center ${
              isActiveInput(playerIndex, frameIndex, 1) ? "border-blue-500" : ""
            }`}
            value={frame.rolls[1] || ""}
            onChange={(e) =>
              handleRollInput(playerIndex, frameIndex, 1, e.target.value)
            }
            maxLength={1}
            disabled={!isActiveInput(playerIndex, frameIndex, 1)}
          />
        )}
        {frameIndex === 9 &&
          (frame.rolls[0] === "X" || frame.rolls[1] === "/") && (
            <Input
              type="text"
              className={`w-full h-8 text-center ${
                isActiveInput(playerIndex, frameIndex, 2)
                  ? "border-blue-500"
                  : ""
              }`}
              value={frame.rolls[2] || ""}
              onChange={(e) =>
                handleRollInput(playerIndex, frameIndex, 2, e.target.value)
              }
              maxLength={1}
              disabled={!isActiveInput(playerIndex, frameIndex, 2)}
            />
          )}
      </div>
      <div className="text-sm mt-1">{frame.score}</div>
    </div>
  ));
};

export default FrameInputs;
