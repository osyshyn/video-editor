import { useEffect } from "react";

export function useTrimSyncWithPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  timeHasSetted: number,
  isPlaying: boolean,
  duration: number,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
  setTimeHasSetted: React.Dispatch<React.SetStateAction<number>>
) {
  useEffect(() => {
    if (videoRef.current) {
      const roundedTime = parseFloat(timeHasSetted.toFixed(2));

      if (videoRef.current.currentTime) {
        videoRef.current.currentTime = roundedTime;
        if (isPlaying) {
          videoRef.current.play().then(() => {
            if (duration === videoRef.current?.currentTime) {
              videoRef.current.currentTime = 0;
              setCurrentTime(0);
              setTimeHasSetted(0);
            }
          });
        } else {
          videoRef.current.pause();
        }
      }
    }
  }, [
    timeHasSetted,
    isPlaying,
    videoRef,
    duration,
    setCurrentTime,
    setTimeHasSetted,
  ]);
}
