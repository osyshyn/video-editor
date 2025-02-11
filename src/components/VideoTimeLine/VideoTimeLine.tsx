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
      }, 100);
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
    <div className="relative w-full flex flex-col gap-2 py-6 rounded">
      <div
        ref={timelineRef}
        className="relative w-full bg-gray-300 rounded cursor-pointer border border-gray-400 overflow-hidden"
        onClick={handleMouseMove}
      >
        <div
          className="absolute top-0 left-0 bg-green-500"
          style={{
            width: `${(currentTime / duration) * 100}%`,
            height: "100%",
          }}
        />
        <div className="relative flex items-end w-full h-6">
          {Array.from({ length: duration * 2 + 1 }).map((_, index) => {
            const timeLabel = (index / 2).toFixed(1);
            return (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{
                  position: "absolute",
                  left: `${(index / (duration * 2)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className="bg-gray-600"
                  style={{
                    width: "1px",
                    height: index % 2 === 0 ? "10px" : "6px",
                  }}
                />
                {index % 2 === 0 && (
                  <span className="text-xs text-gray-900">{timeLabel}</span>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="absolute top-0 bottom-0 w-1 bg-green-700"
          style={{
            left: `${(currentTime / duration) * 100}%`,
            transform: "translateX(-50%)",
          }}
        />

        <div className="relative w-full flex flex-col gap-1 py-4">
          {/* {timelines.map((timeline, index) => (
            <div key={index} className="w-full h-3 bg-blue-300 rounded"></div>
          ))} */}
          <span className="text-gray-500 text-sm px-2">map</span>
        </div>
      </div>
    </div>
  );
}
