import { useOverlay } from "../context/OverlayContext";

interface ITimeLinesProps {
  duration: number;
  handleDragStart: (overlayId: string, type: "startTime" | "endTime") => void;
}

export function TimeLines({ duration, handleDragStart }: ITimeLinesProps) {
  const { overlays, setActiveTextId, setActiveImageId, setActiveAudioId } =
    useOverlay();

  return (
    <div className="relative w-full flex flex-col max-h-[230px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#024EE6] scrollbar-track-[#141A23] gap-1 mt-[30px] py-4">
      {overlays.map((item) => {
        let audioCount = 0;
        if (item.type === "text") {
          return (
            <div
              onClick={() => setActiveTextId(item.id)}
              key={item.id}
              className="relative min-h-10 bg-[#141A23] py-2 border-[3px] border-[#024EE6] flex items-center"
              style={{
                left: `${(item.startTime / duration) * 100}%`,
                width: `${
                  ((Number(item.endTime) - item.startTime) / duration) * 100
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
                width: `${(Number(item.duration) / duration) * 100}%`,
              }}
            ></div>
          );
        }

        if (item.type === "image") {
          return (
            <div
              onClick={() => setActiveImageId(item.id)}
              key={item.id}
              className="relative h-10 min-h-10 border-[3px] border-[#024EE6] flex items-center"
              style={{
                background: `url(${item.url}) repeat center center`,
                backgroundSize: "auto 100%",
                left: `${(item.startTime / duration) * 100}%`,
                width: `${
                  ((Number(item.endTime) - item.startTime) / duration) * 100
                }%`,
              }}
            >
              <div
                className="absolute left-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                onMouseDown={() => handleDragStart(item.id, "startTime")}
              />
              <div className="flex-1 text-white text-[16px] text-center" />
              <div
                className="absolute right-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                onMouseDown={() => handleDragStart(item.id, "endTime")}
              />
            </div>
          );
        }

        if (item.type === "audio") {
          audioCount += 1;

          return (
            <div
              onClick={() => setActiveAudioId(item.id)}
              key={item.id}
              className="relative h-10 min-h-10 border-[3px] border-[#024EE6] flex items-center"
              style={{
                left: `${(item.startTime / duration) * 100}%`,
                width: `${
                  ((Number(item.endTime) - item.startTime) / duration) * 100
                }%`,
              }}
            >
              <div
                className="absolute left-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                onMouseDown={() => handleDragStart(item.id, "startTime")}
              />
              <div className="flex-1 text-white text-[16px] text-center">
                Audio {audioCount}
              </div>
              <div
                className="absolute right-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                onMouseDown={() => handleDragStart(item.id, "endTime")}
              />
            </div>
          );
        }
      })}
    </div>
  );
}
