# Bowling Score Tracker

A React-based bowling score tracking application that allows multiple players to track their bowling scores in real-time. The application follows standard bowling rules and provides an intuitive interface for score input and calculation.

## Features

- Support for up to 5 players
- Real-time score calculation
- Handles strikes (X), spares (/), and open frames
- Special 10th frame rules with bonus rolls
- Turn-based input system
- Responsive design

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

## Installation

1. Clone the repository:

```bash
git clone https://github.com/smilexx2/bowling-score-tracker.git
cd bowling-score-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

## Bowling Rules

1. **Basic Scoring**

   - Each game consists of 10 frames
   - Each frame allows up to two rolls to knock down all pins
   - Each pin knocked down counts as one point

2. **Special Scoring**

   - **Strike (X)**: Knocking down all 10 pins on the first roll
     - Score: 10 points plus the points from your next two rolls
   - **Spare (/)**: Knocking down all remaining pins on the second roll
     - Score: 10 points plus the points from your next roll
   - **Open Frame**: Not knocking down all pins in two rolls
     - Score: Total number of pins knocked down

3. **10th Frame Special Rules**
   - If you roll a strike, you get two more rolls
   - If you roll a spare, you get one more roll
   - Maximum score possible is 300 (12 strikes in a row)

## Usage

1. **Starting a Game**

   - Enter player names (1-5 players)
   - Click "Start Game" to begin

2. **Playing the Game**

   - Enter scores sequentially for each frame
   - Use 'X' for strikes and '/' for spares
   - Numbers 0-9 for regular rolls
   - The active input field is highlighted

3. **Score Display**
   - Running total is shown for each frame
   - Final score is displayed at the end of the game
   - Winner is announced when all players complete their games

### Key Components

- `BowlingScoreTracker`: Main component handling game logic and UI
- `FrameInputs`: Represents a single bowling frame with rolls and score
