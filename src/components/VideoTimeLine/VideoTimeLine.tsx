import { useEffect, useState, useRef } from "react";
import { OverlayItem, useOverlay } from "../context/OverlayContext";
import union from "../../assets/Union.svg";
import { useDrop } from "react-dnd";
import { TimeLines } from "./TimeLines";
import { TimeLineMenu } from "./TimeLineMenu";
import { useTimeLineContext } from "../context/TimeLineContext";

interface IVideoTimelineProps {
  handleRangeChange: (startTime: number) => void;
  isPlaying: boolean;
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>;
  selectedItem: string;
  handleSetOverlay: React.Dispatch<React.SetStateAction<OverlayItem | null>>;
}

export default function VideoTimeLine({
  handleSetOverlay,
  handleRangeChange,
  isPlaying,
  setSelectedItem,
  selectedItem,
}: IVideoTimelineProps) {
  const { currentTime, setCurrentTime, setTimeHasSetted } =
    useTimeLineContext();
  const [duration, setDuration] = useState<number>(30);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const {
    updateOverlay,
    deleteOverlay,
    copyOverlay,
    selectedOverlayId,
    overlays,
  } = useOverlay();
  const [overlay, setOverlay] = useState<OverlayItem | null>(null);

  const setOverlayNull = () => {
    handleSetOverlay(null);
    setOverlay(null);
  };

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
    const fullOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );
    if (fullOverlay) setOverlay(fullOverlay);
  }, [overlays, selectedOverlayId]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const updateCurrentTime = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setCurrentTime((prev) => Math.min(prev + delta, duration));

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(updateCurrentTime);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateCurrentTime);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, duration, setCurrentTime]);

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
    setTimeHasSetted(newTime);
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
  }, [updateOverlay, duration]);

  useEffect(() => {
    if (selectedItem === "Trim" && overlay?.duration) {
      setDuration(overlay.duration);
    } else if (selectedItem !== "Trim" && duration !== 30) {
      setDuration(30);
    }
  }, [overlay?.duration, selectedItem, overlay?.type, duration]);

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
          <TimeLineMenu
            setOverlayNull={setOverlayNull}
            selectedItem={selectedItem}
            overlay={overlay}
            setSelectedItem={setSelectedItem}
            copyOverlay={copyOverlay}
            deleteOverlay={deleteOverlay}
            currentTime={currentTime}
            duration={duration}
          />
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
          <TimeLines
            timelineRef={timelineRef}
            overlay={overlay}
            handleDragStart={handleDragStart}
            duration={duration}
            selectedItem={selectedItem}
            handleRangeChange={handleRangeChange}
            setSelectedItem={setSelectedItem}
          />
        </div>
      </div>
    </div>
  );
}
