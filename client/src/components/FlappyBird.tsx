import { useEffect, useRef, useMemo } from "react";
import { useFlappyBird } from "@/lib/stores/useFlappyBird";
import { useAudio } from "@/lib/stores/useAudio";
import { GameUI } from "./GameUI";

interface Bird {
  x: number;
  y: number;
  velocity: number;
  width: number;
  height: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  gap: number;
  width: number;
  passed: boolean;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

export function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { phase, start, end, incrementScore, restart } = useFlappyBird();
  const { playHit, playSuccess } = useAudio();
  
  const initialClouds = useMemo(() => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * 800,
        y: 50 + Math.random() * 100,
        width: 60 + Math.random() * 40,
        speed: 0.15 + Math.random() * 0.2,
      });
    }
    return clouds;
  }, []);
  
  const gameStateRef = useRef({
    bird: { x: 100, y: 250, velocity: 0, width: 34, height: 24 } as Bird,
    pipes: [] as Pipe[],
    clouds: initialClouds,
    ground: { x: 0 },
    timeOfDay: 0,
    lastPipeTime: 0,
    lastTime: 0,
    startTime: 0,
  });

  const animationFrameRef = useRef<number>();

  const GRAVITY = 0.08;
  const JUMP_STRENGTH = -2.2;
  const PIPE_SPEED = 0.8;
  const PIPE_INTERVAL = 3000;
  const PIPE_GAP = 160;
  const GROUND_SPEED = 1.0;
  const DAY_NIGHT_CYCLE_DURATION = 90000;

  const initGame = (canvasWidth: number, canvasHeight: number) => {
    console.log("Initializing game");
    gameStateRef.current = {
      bird: { x: 100, y: canvasHeight / 2, velocity: 0, width: 34, height: 24 },
      pipes: [],
      clouds: initialClouds.map(cloud => ({ ...cloud })),
      ground: { x: 0 },
      timeOfDay: 0,
      lastPipeTime: 0,
      lastTime: performance.now(),
      startTime: performance.now(),
    };
  };

  const getSkyGradient = (ctx: CanvasRenderingContext2D, timeOfDay: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    const t = (Math.sin(timeOfDay) + 1) / 2;
    
    const dayTop = [135, 206, 235];
    const dayBottom = [176, 224, 230];
    const nightTop = [10, 15, 30];
    const nightBottom = [25, 25, 50];
    
    const topColor = dayTop.map((day, i) => Math.round(day * (1 - t) + nightTop[i] * t));
    const bottomColor = dayBottom.map((day, i) => Math.round(day * (1 - t) + nightBottom[i] * t));
    
    gradient.addColorStop(0, `rgb(${topColor[0]}, ${topColor[1]}, ${topColor[2]})`);
    gradient.addColorStop(1, `rgb(${bottomColor[0]}, ${bottomColor[1]}, ${bottomColor[2]})`);
    
    return gradient;
  };

  const drawBird = (ctx: CanvasRenderingContext2D, bird: Bird) => {
    ctx.save();
    
    const angle = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(angle);
    
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 10, 0);
    ctx.lineTo(bird.width / 2 + 5, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(bird.width / 2 - 10, bird.height / 2 - 2, 8, 2);
    ctx.fillRect(bird.width / 2 - 5, bird.height / 2 - 2, 8, 2);
    
    ctx.restore();
  };

  const drawPipes = (ctx: CanvasRenderingContext2D, pipes: Pipe[], canvasHeight: number) => {
    pipes.forEach((pipe) => {
      ctx.fillStyle = "#228B22";
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      
      ctx.fillStyle = "#2E8B57";
      ctx.fillRect(pipe.x + 5, 0, pipe.width - 10, pipe.topHeight);
      
      ctx.fillStyle = "#228B22";
      ctx.fillRect(pipe.x, pipe.topHeight + pipe.gap, pipe.width, canvasHeight - pipe.topHeight - pipe.gap);
      
      ctx.fillStyle = "#2E8B57";
      ctx.fillRect(pipe.x + 5, pipe.topHeight + pipe.gap, pipe.width - 10, canvasHeight - pipe.topHeight - pipe.gap);
      
      ctx.fillStyle = "#1a5f1a";
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipe.width + 10, 20);
      ctx.fillRect(pipe.x - 5, pipe.topHeight + pipe.gap, pipe.width + 10, 20);
    });
  };

  const drawClouds = (ctx: CanvasRenderingContext2D, clouds: Cloud[], timeOfDay: number) => {
    const t = (Math.sin(timeOfDay) + 1) / 2;
    const dayColor = [255, 255, 255];
    const nightColor = [100, 100, 120];
    const cloudColor = dayColor.map((day, i) => Math.round(day * (1 - t) + nightColor[i] * t));
    
    clouds.forEach((cloud) => {
      ctx.fillStyle = `rgba(${cloudColor[0]}, ${cloudColor[1]}, ${cloudColor[2]}, 0.8)`;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.width / 3, cloud.y - 10, cloud.width / 4, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawGround = (ctx: CanvasRenderingContext2D, groundX: number, canvasWidth: number, canvasHeight: number) => {
    const groundHeight = 80;
    const groundY = canvasHeight - groundHeight;
    
    ctx.fillStyle = "#8B7355";
    ctx.fillRect(0, groundY, canvasWidth, groundHeight);
    
    ctx.fillStyle = "#6B5345";
    for (let i = 0; i < canvasWidth / 20 + 2; i++) {
      const x = (i * 20 + groundX) % canvasWidth;
      ctx.fillRect(x, groundY + 10, 15, 5);
    }
    
    ctx.fillStyle = "#228B22";
    for (let i = 0; i < canvasWidth / 30 + 2; i++) {
      const x = (i * 30 + groundX * 0.5) % canvasWidth;
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 5, groundY + 10);
      ctx.lineTo(x + 5, groundY + 10);
      ctx.closePath();
      ctx.fill();
    }
  };

  const checkCollision = (bird: Bird, pipes: Pipe[], canvasHeight: number): boolean => {
    const groundY = canvasHeight - 80;
    if (bird.y + bird.height > groundY || bird.y < 0) {
      return true;
    }
    
    for (const pipe of pipes) {
      if (
        bird.x + bird.width > pipe.x &&
        bird.x < pipe.x + pipe.width
      ) {
        if (
          bird.y < pipe.topHeight ||
          bird.y + bird.height > pipe.topHeight + pipe.gap
        ) {
          return true;
        }
      }
    }
    
    return false;
  };

  const gameLoop = (currentTime: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    const state = gameStateRef.current;
    const deltaTime = currentTime - state.lastTime;
    state.lastTime = currentTime;
    
    ctx.fillStyle = getSkyGradient(ctx, state.timeOfDay, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const elapsedTime = currentTime - state.startTime;
    state.timeOfDay = (elapsedTime / DAY_NIGHT_CYCLE_DURATION) * Math.PI * 2;
    
    drawClouds(ctx, state.clouds, state.timeOfDay);
    
    state.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = canvas.width + 50;
      }
    });
    
    if (phase === "playing") {
      state.bird.velocity += GRAVITY;
      state.bird.y += state.bird.velocity;
      
      if (currentTime - state.lastPipeTime > PIPE_INTERVAL) {
        const minHeight = 50;
        const maxHeight = canvas.height - 80 - PIPE_GAP - 50;
        const randomValue = Math.random();
        const topHeight = minHeight + randomValue * (maxHeight - minHeight);
        
        state.pipes.push({
          x: canvas.width,
          topHeight,
          gap: PIPE_GAP,
          width: 60,
          passed: false,
        });
        
        state.lastPipeTime = currentTime;
      }
      
      state.pipes = state.pipes.filter((pipe) => {
        pipe.x -= PIPE_SPEED;
        
        if (!pipe.passed && pipe.x + pipe.width < state.bird.x) {
          pipe.passed = true;
          incrementScore();
          playSuccess();
        }
        
        return pipe.x + pipe.width > -50;
      });
      
      if (checkCollision(state.bird, state.pipes, canvas.height)) {
        console.log("Collision detected!");
        end();
        playHit();
      }
      
      state.ground.x -= GROUND_SPEED;
      if (state.ground.x <= -20) {
        state.ground.x = 0;
      }
    }
    
    drawPipes(ctx, state.pipes, canvas.height);
    drawBird(ctx, state.bird);
    drawGround(ctx, state.ground.x, canvas.width, canvas.height);
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const handleJump = () => {
    console.log("Jump triggered, phase:", phase);
    if (phase === "ready") {
      start();
      gameStateRef.current.bird.velocity = JUMP_STRENGTH;
      gameStateRef.current.lastTime = performance.now();
      gameStateRef.current.startTime = performance.now();
      gameStateRef.current.lastPipeTime = performance.now();
      console.log("Game started");
    } else if (phase === "playing") {
      gameStateRef.current.bird.velocity = JUMP_STRENGTH;
      console.log("Bird jumped");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (phase === "ready") {
        initGame(canvas.width, canvas.height);
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        handleJump();
      }
    };
    
    const handleClick = () => {
      handleJump();
    };
    
    window.addEventListener("keydown", handleKeyPress);
    canvas.addEventListener("click", handleClick);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyPress);
      canvas.removeEventListener("click", handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "ready") {
      const canvas = canvasRef.current;
      if (canvas) {
        console.log("Resetting game state for restart");
        initGame(canvas.width, canvas.height);
      }
    }
  }, [phase]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          cursor: "pointer",
        }}
      />
      <GameUI />
    </>
  );
}
