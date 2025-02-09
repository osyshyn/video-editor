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
  const isDragging = useRef(false); // To track if we are dragging the timeline
  const startX = useRef(0); // Store initial X position for dragging
  const startWidth = useRef(0); // Store initial width of the timeline

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

  const handleDragStart = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    // Prevent selection of the timeline and ensure only dragging is allowed
    isDragging.current = true;
    startX.current = event.clientX;
    startWidth.current = timelineRef.current.getBoundingClientRect().width;
  };

  const handleDrag = (event: React.MouseEvent) => {
    if (!isDragging.current || !timelineRef.current) return;

    const deltaX = event.clientX - startX.current;
    const newWidth = Math.max(startWidth.current + deltaX, 20); // Prevent it from becoming too small

    timelineRef.current.style.width = `${newWidth}px`;

    // Calculate the new current time based on the width of the timeline
    const newTime =
      (newWidth / timelineRef.current.getBoundingClientRect().width) * duration;
    setCurrentTime(newTime);
    handleRangeChange(newTime);
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full flex justify-center items-center py-6 rounded">
      <div
        ref={timelineRef}
        className="h-2 bg-gray-300 rounded cursor-ew-resize relative"
        onMouseDown={handleDragStart} // Use mousedown for starting drag
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd} // End drag when mouse is released
        onMouseLeave={handleDragEnd} // Ensure drag ends if mouse leaves
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
            userSelect: "none",
          }}
        />
      </div>
    </div>
  );
}
