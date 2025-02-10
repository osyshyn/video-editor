import { useEffect, useState, useRef } from "react";

interface IVideoTimelineProps {
  handleRangeChange: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoTimeLine({
  videoRef,
  handleRangeChange,
}: IVideoTimelineProps) {
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const timelineRef = useRef<HTMLDivElement | null>(null);

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

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const newTime = Math.min(
      Math.max(((event.clientX - rect.left) / rect.width) * duration, 0),
      duration
    );
    setCurrentTime(newTime);
    handleRangeChange(newTime);
  };

  return (
    <div className="relative w-full flex justify-center items-center py-6 rounded">
      <div
        ref={timelineRef}
        className="w-full h-2 bg-gray-300 rounded cursor-pointer relative"
        onClick={handleMouseMove}
      >
        <div
          className="absolute top-0 left-0 h-2 bg-green-500"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <div
          className="absolute top-0"
          style={{
            left: `${(currentTime / duration) * 100}%`,
            width: "20px",
            height: "8px",
            backgroundColor: "#4caf50",
            borderRadius: "4px",
            transform: "translateX(-50%)",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
