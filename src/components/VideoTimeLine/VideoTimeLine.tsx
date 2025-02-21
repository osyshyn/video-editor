import { useEffect, useState, useRef } from "react";
import { useOverlay } from "../context/OverlayContext";

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
  const { overlays, updateOverlay } = useOverlay();

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
    <div className="relative w-full flex flex-col gap-2">
      <div
        ref={timelineRef}
        className="relative w-full bg-gray-300 p-2 min-h-40 cursor-pointer border border-gray-400 overflow-hidden"
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
            const timeLabel = (index / 2).toFixed(0);
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
                  <span className="text-md text-gray-900">{timeLabel}</span>
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
          {overlays.map((item) => {
            let imageCount = 1;

            if (item.type === "text") {
              return (
                <div
                  key={item.id}
                  className="w-full p-4 opacity-80 text-2xl bg-red-300 rounded"
                  style={
                    {
                      // left: `${(item.startTime / duration) * 100}%`,
                      // width: `${((item.endTime - item.startTime) / duration) * 100}%`,
                    }
                  }
                >
                  {item.content}
                </div>
              );
            }
            if (item.type === "image") {
              imageCount++;

              return (
                <div
                  key={item.id}
                  className={`w-full h-3 bg-blue-300 rounded`}
                  style={
                    {
                      // left: `${(item.startTime / duration) * 100}%`,
                      // width: `${((item.endTime - item.startTime) / duration) * 100}%`,
                    }
                  }
                >
                  Image {imageCount}
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
