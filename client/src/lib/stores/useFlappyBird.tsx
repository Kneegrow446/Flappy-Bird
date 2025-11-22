import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";

interface FlappyBirdState {
  phase: GamePhase;
  score: number;
  highScore: number;
  
  start: () => void;
  restart: () => void;
  end: () => void;
  incrementScore: () => void;
  setHighScore: (score: number) => void;
}

const getInitialHighScore = () => {
  if (typeof window !== "undefined") {
    return parseInt(localStorage.getItem("flappybird-highscore") || "0");
  }
  return 0;
};

export const useFlappyBird = create<FlappyBirdState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    score: 0,
    highScore: getInitialHighScore(),
    
    start: () => {
      set((state) => {
        if (state.phase === "ready") {
          return { phase: "playing", score: 0 };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ phase: "ready", score: 0 }));
    },
    
    end: () => {
      set((state) => {
        if (state.phase === "playing") {
          const { score, highScore } = get();
          if (score > highScore) {
            if (typeof window !== "undefined") {
              localStorage.setItem("flappybird-highscore", score.toString());
            }
            return { phase: "ended", highScore: score };
          }
          return { phase: "ended" };
        }
        return {};
      });
    },
    
    incrementScore: () => {
      set((state) => ({ score: state.score + 1 }));
    },
    
    setHighScore: (score: number) => {
      set({ highScore: score });
      if (typeof window !== "undefined") {
        localStorage.setItem("flappybird-highscore", score.toString());
      }
    }
  }))
);
