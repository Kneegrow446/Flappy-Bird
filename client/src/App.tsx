import "@fontsource/inter";
import { FlappyBird } from "./components/FlappyBird";
import { SoundManager } from "./components/SoundManager";

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <FlappyBird />
      <SoundManager />
    </div>
  );
}

export default App;
