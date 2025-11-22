import { useFlappyBird } from "@/lib/stores/useFlappyBird";
import { useAudio } from "@/lib/stores/useAudio";

export function GameUI() {
  const { phase, score, highScore, restart } = useFlappyBird();
  const { isMuted, toggleMute } = useAudio();

  return (
    <div style={{ 
      position: "absolute", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      pointerEvents: "none",
      fontFamily: "Inter, sans-serif"
    }}>
      {phase === "ready" && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "40px",
          borderRadius: "20px",
          color: "white",
        }}>
          <h1 style={{ 
            fontSize: "48px", 
            margin: "0 0 20px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
          }}>
            Flappy Bird
          </h1>
          <p style={{ 
            fontSize: "24px", 
            margin: "0 0 30px 0",
            color: "#FFD700"
          }}>
            Click or Press Space to Fly
          </p>
          <div style={{ 
            fontSize: "18px", 
            color: "#CCC",
            marginBottom: "20px"
          }}>
            High Score: {highScore}
          </div>
          <div style={{
            fontSize: "14px",
            color: "#AAA",
            marginTop: "20px",
            lineHeight: "1.5"
          }}>
            🌍 Watch the day-night cycle<br />
            🐦 Fly through the pipes<br />
            🎮 Slow & steady wins!
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div style={{
          position: "absolute",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "72px",
          fontWeight: "bold",
          color: "white",
          textShadow: "4px 4px 8px rgba(0,0,0,0.7), -2px -2px 4px rgba(255,255,255,0.3)",
        }}>
          {score}
        </div>
      )}

      {phase === "ended" && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "40px 60px",
          borderRadius: "20px",
          color: "white",
          pointerEvents: "auto",
        }}>
          <h2 style={{ 
            fontSize: "42px", 
            margin: "0 0 20px 0",
            color: "#FF6B6B"
          }}>
            Game Over!
          </h2>
          <div style={{ 
            fontSize: "32px", 
            margin: "20px 0",
            color: "#FFD700"
          }}>
            Score: {score}
          </div>
          <div style={{ 
            fontSize: "24px", 
            margin: "10px 0 30px 0",
            color: "#CCC"
          }}>
            Best: {highScore}
          </div>
          <button
            onClick={restart}
            style={{
              fontSize: "24px",
              padding: "15px 40px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#45a049";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#4CAF50";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Play Again
          </button>
        </div>
      )}

      <button
        onClick={toggleMute}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          fontSize: "24px",
          padding: "10px 15px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "10px",
          cursor: "pointer",
          pointerEvents: "auto",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
