import { useEffect, useState } from "react";

interface IVideoTimelineProps {
  handleRangeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoTimeLine({
  videoRef,
  handleRangeChange,
}: IVideoTimelineProps) {
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => {
      setDuration(Math.floor(video.duration));
    };

    let intervalId: NodeJS.Timeout;

    const updateCurrentTime = () => {
      intervalId = setInterval(() => {
        setCurrentTime((prev) => {
          if (video.currentTime !== prev) {
            return Math.round(video.currentTime * 10) / 10;
          }
          return prev;
        });
      }, 0);
    };

    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("timeupdate", updateCurrentTime);
    video.addEventListener("pause", () => clearInterval(intervalId));
    video.addEventListener("ended", () => clearInterval(intervalId));

    return () => {
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("timeupdate", updateCurrentTime);
      video.removeEventListener("pause", () => clearInterval(intervalId));
      video.removeEventListener("ended", () => clearInterval(intervalId));
      clearInterval(intervalId);
    };
  }, [videoRef]);

  return (
    <div className="relative w-full flex justify-center items-center py-6 rounded">
      <input
        type="range"
        min="0"
        max={duration}
        step="0.05"
        value={currentTime}
        onChange={handleRangeChange}
        className="w-full main-timeline"
      />
    </div>
  );
}
