import { useEffect, useState, useRef } from "react";

interface IVideoTrimerProps {
  handleRangeChange: (startTime: number, endTime: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setStartTime: React.Dispatch<React.SetStateAction<number>>;
  startTime: number;
  endTime: number;
  setEndTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function VideoTrimer({
  videoRef,
  handleRangeChange,
  setStartTime,
  startTime,
  endTime,
  setEndTime,
}: IVideoTrimerProps) {
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const isDraggingStart = useRef(false);
  const isDraggingEnd = useRef(false);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => {
      setDuration(Math.floor(video.duration));
      setEndTime(Math.floor(video.duration));
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
  }, [videoRef, setEndTime]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const newTime = Math.min(
      Math.max(((event.clientX - rect.left) / rect.width) * duration, 0),
      duration
    );
    setCurrentTime(newTime);
    handleRangeChange(startTime, newTime);
  };

  const handleDragStart = (event: React.MouseEvent, isStart: boolean) => {
    if (!timelineRef.current) return;

    dragStartX.current = event.clientX;
    dragStartTime.current = isStart ? startTime : endTime;

    if (isStart) {
      isDraggingStart.current = true;
    } else {
      isDraggingEnd.current = true;
    }
  };

  const handleDragMove = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const deltaX = event.clientX - dragStartX.current;
    const rect = timelineRef.current.getBoundingClientRect();
    const deltaTime = (deltaX / rect.width) * duration;

    if (isDraggingStart.current) {
      const newStartTime = Math.max(
        0,
        Math.min(dragStartTime.current + deltaTime, endTime)
      );
      setStartTime(newStartTime);
      handleRangeChange(newStartTime, endTime);
    }

    if (isDraggingEnd.current) {
      const newEndTime = Math.max(
        startTime,
        Math.min(dragStartTime.current + deltaTime, duration)
      );
      setEndTime(newEndTime);
      handleRangeChange(startTime, newEndTime);
    }
  };

  const handleDragEnd = () => {
    isDraggingStart.current = false;
    isDraggingEnd.current = false;
  };

  return (
    <div className="relative w-full flex justify-center items-center py-6 rounded">
      <div
        ref={timelineRef}
        className="w-full h-4 bg-gray-300 rounded cursor-pointer relative"
        onClick={handleMouseMove}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div
          className="absolute top-0 left-0 h-4 bg-green-500"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <div
          className="absolute top-0 left-0 h-4 bg-blue-500 opacity-50"
          style={{
            width: `${((endTime - startTime) / duration) * 100}%`,
            left: `${(startTime / duration) * 100}%`,
          }}
        />
        <div
          className="absolute top-0"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: "16px",
            height: "16px",
            backgroundColor: "red",
            borderRadius: "50%",
            transform: "translateX(-50%)",
            cursor: "ew-resize",
          }}
          onMouseDown={(e) => handleDragStart(e, true)}
        />
        <div
          className="absolute top-0"
          style={{
            left: `${(endTime / duration) * 100}%`,
            width: "16px",
            height: "16px",
            backgroundColor: "red",
            borderRadius: "50%",
            transform: "translateX(-50%)",
            cursor: "ew-resize",
          }}
          onMouseDown={(e) => handleDragStart(e, false)}
        />
      </div>
    </div>
  );
}
