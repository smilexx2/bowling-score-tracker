import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Frame, Player, GameState } from "@/types";
import FrameInputs from "@/components/FrameInputs";

const BowlingScoreTracker = () => {
  const [players, setPlayers] = useState<Player[]>([
    { name: "", frames: [], totalScore: 0 },
  ]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    currentPlayerIndex: 0,
    currentFrameIndex: 0,
    currentRollIndex: 0,
  });

  const initializeFrames = (): Frame[] => {
    return Array(10)
      .fill(null)
      .map(() => ({
        rolls: [],
        score: 0,
        isComplete: false,
      }));
  };

  const addPlayer = () => {
    if (players.length < 5) {
      setPlayers([...players, { name: "", frames: [], totalScore: 0 }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);
    }
  };

  const handleNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    if (players.every((player) => player.name.trim())) {
      const initializedPlayers = players.map((player) => ({
        ...player,
        frames: initializeFrames(),
      }));
      setPlayers(initializedPlayers);
      setGameStarted(true);
      setGameState({
        currentPlayerIndex: 0,
        currentFrameIndex: 0,
        currentRollIndex: 0,
      });
    }
  };

  const getCurrentPlayerName = () => {
    return players[gameState.currentPlayerIndex]?.name;
  };

  const isGameComplete = () => {
    return gameState.currentFrameIndex >= 10;
  };

  const getWinner = () => {
    if (!isGameComplete()) return null;
    return players.reduce((prev, current) =>
      prev.totalScore > current.totalScore ? prev : current
    );
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Bowling Score Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {!gameStarted ? (
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Player ${index + 1} name`}
                  value={player.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-48"
                />
                {index === players.length - 1 && players.length < 5 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addPlayer}
                    className="w-8 h-8 p-0"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                )}
                {players.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removePlayer(index)}
                    className="w-8 h-8 p-0"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={startGame}
              disabled={!players.every((player) => player.name.trim())}
            >
              Start Game
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {!isGameComplete() && (
              <div className="text-lg font-semibold text-blue-600">
                Current Turn: {getCurrentPlayerName()} - Frame{" "}
                {gameState.currentFrameIndex + 1}
              </div>
            )}
            {players.map((player, playerIndex) => (
              <div key={playerIndex} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                  <div className="text-lg">Total: {player.totalScore}</div>
                </div>
                <div className="grid grid-cols-[repeat(9,minmax(0,1fr))_1.5fr] gap-1 w-full min-w-[800px] pb-2">
                  <FrameInputs
                    players={players}
                    playerIndex={playerIndex}
                    gameState={gameState}
                    setGameState={setGameState}
                    setPlayers={setPlayers}
                  />
                </div>
              </div>
            ))}
            {isGameComplete() && getWinner() && (
              <div className="text-xl font-bold text-green-600">
                🎉 Winner: {getWinner()?.name} with {getWinner()?.totalScore}{" "}
                points!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BowlingScoreTracker;
