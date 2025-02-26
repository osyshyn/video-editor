import { useEffect, useState, useRef } from "react";
import { useOverlay } from "../context/OverlayContext";
import union from "../../assets/Union.svg";
import { useDrop } from "react-dnd";

interface IVideoTimelineProps {
  handleRangeChange: (time: number) => void;
  isPlaying: boolean;
}

export default function VideoTimeLine({
  handleRangeChange,
  isPlaying,
}: IVideoTimelineProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 30;
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const { overlays, updateOverlay, setActiveTextId } = useOverlay();

  const isDragging = useRef(false);
  const dragType = useRef<"startTime" | "endTime" | null>(null);
  const activeOverlayId = useRef<string | null>(null);
  const { addVideo } = useOverlay();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "VIDEO",
    drop: async (item: { file: File; url: string }, monitor) => {
      if (!timelineRef.current) return;

      const offset = monitor.getSourceClientOffset();

      if (!offset) return;

      addVideo(item.file);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentTime((prev) => Math.min(prev + 0.01, duration));
      }, 10);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  const formatTime = (time: number) => {
    const seconds = Math.floor(time);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleDragStart = (
    overlayId: string,
    type: "startTime" | "endTime"
  ) => {
    isDragging.current = true;
    dragType.current = type;
    activeOverlayId.current = overlayId;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const newTime = Math.min(
      Math.max(((event.clientX - rect.left) / rect.width) * duration, 0),
      duration
    );
    setCurrentTime(newTime);
    handleRangeChange(newTime);
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    dragType.current = null;
    activeOverlayId.current = null;
  };

  useEffect(() => {
    const handleDragMove = (e: React.MouseEvent) => {
      if (!isDragging.current || !activeOverlayId.current || !dragType.current)
        return;

      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;

      let newTime = ((e.clientX - rect.left) / rect.width) * duration;
      newTime = Math.round(Math.min(Math.max(newTime, 0), duration) * 10) / 10;

      updateOverlay(activeOverlayId.current, { [dragType.current]: newTime });
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
    };
  }, [updateOverlay]);

  return (
    <div className="relative w-full flex flex-col gap-2 select-none">
      <div
        ref={drop}
        className={`bg-[#080E17] px-[25px] py-[16px] min-h-[326px] h-full border-t-[1px] border-t-[#20293C] ${
          isOver ? "bg-gray-700" : ""
        }`}
      >
        <div
          className="relative w-full min-h-[254px]"
          ref={timelineRef}
          onClick={handleMouseMove}
        >
          <div className="flex justify-center gap-1 items-center text-white text-[16px] px-4">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative flex items-end w-full h-6">
            <div className="absolute h-[1px] w-[100vw] bg-[#9CA3AF]"></div>
            {Array.from({ length: duration * 2 + 1 }).map((_, index) => {
              const timeLabel = (index / 2).toFixed(0);
              return (
                <div
                  key={index}
                  className="flex flex-row"
                  style={{
                    position: "absolute",
                    left: `${(index / (duration * 2)) * 100}%`,
                  }}
                >
                  <div
                    className="bg-gray-600 absolute"
                    style={{
                      width: "1px",
                      height: index % 2 === 0 ? "10px" : "6px",
                    }}
                  />
                  {index % 2 === 0 && (
                    <span className="text-[10px] left-1 absolute text-[#9CA3AF]">
                      {timeLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="absolute top-0 bottom-0 z-999 w-[10px] mt-[66px]"
            style={{
              left: `${(currentTime / duration) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <img src={union} alt="timeline line" />
          </div>

          <div className="relative w-full flex flex-col h-10 gap-1 mt-[30px] py-4">
            {overlays.map((item) => {
              if (item.type === "text") {
                return (
                  <div
                    onClick={() => setActiveTextId(item.id)}
                    key={item.id}
                    className="relative min-h-10 bg-[#141A23] py-2 border-[3px] border-[#024EE6] flex items-center"
                    style={{
                      left: `${(item.startTime / duration) * 100}%`,
                      width: `${
                        ((item.endTime - item.startTime) / duration) * 100
                      }%`,
                    }}
                  >
                    <div
                      className="absolute left-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                      onMouseDown={() => handleDragStart(item.id, "startTime")}
                    />
                    <div className="flex-1 text-white text-[16px] text-center">
                      {item.content}
                    </div>
                    <div
                      className="absolute right-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                      onMouseDown={() => handleDragStart(item.id, "endTime")}
                    />
                  </div>
                );
              }

              if (item.type === "video") {
                return (
                  <div
                    key={item.id}
                    className="relative h-10 min-h-10 border-[3px] border-[#024EE6] flex items-center"
                    style={{
                      background: `url(${item.videoThumbnailUrl}) repeat center center`,
                      backgroundSize: "auto 100%",
                      left: `${(item.startTime / duration) * 100}%`,
                      width: `${(item.duration / duration) * 100}%`,
                    }}
                  ></div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
