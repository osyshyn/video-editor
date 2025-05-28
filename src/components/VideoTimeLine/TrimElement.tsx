import { useEffect, useRef } from "react";
import { useTrimContext } from "../context/TrimContext";
import { OverlayItem } from "../context/OverlayContext";

interface ITrimElementProps {
  duration: number;
  overlay: OverlayItem | null;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  handleRangeChange: (startTime: number) => void;
}

export const TrimElement = ({
  overlay,
  duration,
  handleRangeChange,
  timelineRef,
}: ITrimElementProps) => {
  const {
    setDuration,
    setEndTime,
    videoRef,
    startTime,
    endTime,
    setStartTime,
    setCurrentTime,
  } = useTrimContext();

  const isDraggingStart = useRef(false);
  const isDraggingEnd = useRef(false);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    setDuration(duration);
    setEndTime(duration);

    if (!video) return;

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

    video.addEventListener("timeupdate", updateCurrentTime);
    video.addEventListener("pause", () => clearInterval(intervalId));
    video.addEventListener("ended", () => clearInterval(intervalId));

    return () => {
      video.removeEventListener("timeupdate", updateCurrentTime);
      video.removeEventListener("pause", () => clearInterval(intervalId));
      video.removeEventListener("ended", () => clearInterval(intervalId));
      clearInterval(intervalId);
    };
  }, [videoRef, setEndTime, setDuration, setCurrentTime, duration]);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const newTime = Math.min(
      Math.max(((event.clientX - rect.left) / rect.width) * duration, 0),
      duration
    );
    setCurrentTime(newTime);
    handleRangeChange(startTime);
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
      handleRangeChange(newStartTime);
    }

    if (isDraggingEnd.current) {
      const newEndTime = Math.max(
        startTime,
        Math.min(dragStartTime.current + deltaTime, duration)
      );
      setEndTime(newEndTime);
      handleRangeChange(startTime);
    }
  };

  const handleDragEnd = () => {
    isDraggingStart.current = false;
    isDraggingEnd.current = false;
  };

  if (overlay?.type === "audio" || overlay?.type === "video") {
    return (
      <div
        className="w-full h-20 p-2 bg-gray-300 border-[#024EE6] border-[3px] rounded cursor-pointer relative"
        onClick={handleMouseMove}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div
          className="absolute top-0 left-0 h-20 bg-blue-500 opacity-50"
          style={{
            width: `${((endTime - startTime) / duration) * 100}%`,
            left: `${(startTime / duration) * 100}%`,
          }}
        />
        <div
          className="absolute top-0"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: "6px",
            height: "100%",
            backgroundColor: "#024EE6",
            transform: "translateX(-50%)",
            cursor: "ew-resize",
          }}
          onMouseDown={(e) => handleDragStart(e, true)}
        />
        <div
          className="absolute top-0"
          style={{
            left: `${(endTime / duration) * 100}%`,
            width: "6px",
            height: "100%",
            backgroundColor: "#024EE6",
            transform: "translateX(-50%)",
            cursor: "ew-resize",
          }}
          onMouseDown={(e) => handleDragStart(e, false)}
        />
      </div>
    );
  }

  return null;
};
