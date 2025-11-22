import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";

export function SoundManager() {
  const { setHitSound, setSuccessSound } = useAudio();

  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.3;
    setHitSound(hitAudio);

    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.2;
    setSuccessSound(successAudio);
  }, [setHitSound, setSuccessSound]);

  return null;
}
