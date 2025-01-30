import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { GameState, Player } from "@/types";

interface FrameInputsProps {
  players: Player[];
  playerIndex: number;
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
  setPlayers: (players: Player[]) => void;
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
  setPlayers,
}: FrameInputsProps) => {
  const activeInputRef = useRef<HTMLInputElement>(null);

  // Focus the active input when it changes
  useEffect(() => {
    if (activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [
    gameState.currentPlayerIndex,
    gameState.currentFrameIndex,
    gameState.currentRollIndex,
  ]);

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
    if (!isActiveInput(playerIndex, frameIndex, rollIndex)) return;

    if (!isValidRoll(value)) return;

    const newPlayers = [...players];
    const player = newPlayers[playerIndex];
    const frame = player.frames[frameIndex];

    // Handle input validation
    if (frameIndex === 9) {
      // 10th frame special handling
      if (rollIndex === 0) {
        if (value === "X") {
          frame.rolls[0] = "X";
        } else if (parseInt(value) <= 10) {
          frame.rolls[0] = value;
        }
      } else if (rollIndex === 1) {
        if (frame.rolls[0] === "X") {
          // After a strike, allow another strike or valid number
          if (value === "X" || parseInt(value) <= 10) {
            frame.rolls[1] = value;
          }
        } else {
          // After a non-strike, check for spare or valid number
          const firstRoll = parseInt(frame.rolls[0]);
          if (value === "/" || firstRoll + parseInt(value) === 10) {
            frame.rolls[1] = "/";
          } else if (!isNaN(firstRoll) && firstRoll + parseInt(value) < 10) {
            frame.rolls[1] = value;
          }
        }
      } else if (rollIndex === 2) {
        // Third roll is allowed if first two rolls include a strike or spare
        if (
          frame.rolls[0] === "X" ||
          frame.rolls[1] === "X" ||
          frame.rolls[1] === "/"
        ) {
          if (value === "X" || parseInt(value) <= 10) {
            frame.rolls[2] = value;
            frame.isComplete = true;
          }
        }
      }
    } else {
      // Normal frames (1-9)
      if (rollIndex === 0) {
        if (value === "X") {
          frame.rolls = ["X"];
          frame.isComplete = true;
        } else if (parseInt(value) <= 10) {
          frame.rolls[0] = value;
        }
      } else if (rollIndex === 1) {
        const firstRoll = parseInt(frame.rolls[0]);
        if (value === "/" || firstRoll + parseInt(value) === 10) {
          frame.rolls[1] = "/";
          frame.isComplete = true;
        } else if (!isNaN(firstRoll) && firstRoll + parseInt(value) < 10) {
          frame.rolls[1] = value;
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

    setPlayers(newPlayers);

    // Advance the game if valid input was entered
    if (value) {
      if (frameIndex === 9) {
        // In 10th frame, only advance if:
        // 1. Got a strike/spare and completed all three rolls
        // 2. Got open frame and completed two rolls
        const needsThirdRoll = frame.rolls[0] === "X" || frame.rolls[1] === "/";
        if (
          (needsThirdRoll && frame.rolls[2]) ||
          (!needsThirdRoll && frame.rolls[1])
        ) {
          frame.isComplete = true;
          advanceGame();
        } else if (frame.rolls[rollIndex]) {
          advanceGame();
        }
      } else if (value === "X" || frame.isComplete) {
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
          ref={
            isActiveInput(playerIndex, frameIndex, 0) ? activeInputRef : null
          }
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
            ref={
              isActiveInput(playerIndex, frameIndex, 1) ? activeInputRef : null
            }
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
              ref={
                isActiveInput(playerIndex, frameIndex, 2)
                  ? activeInputRef
                  : null
              }
            />
          )}
      </div>
      <div className="text-sm mt-1">{frame.score}</div>
    </div>
  ));
};

export default FrameInputs;
