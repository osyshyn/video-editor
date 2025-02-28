import { useOverlay } from "../context/OverlayContext";

interface ITimeLinesProps {
  duration: number;
  handleDragStart: (overlayId: string, type: "startTime" | "endTime") => void;
}

export function TimeLines({ duration, handleDragStart }: ITimeLinesProps) {
  const {
    overlays,
    setActiveTextId,
    setActiveImageId,
    setActiveAudioId,
    setActiveGifId,
  } = useOverlay();

  return (
    <div className="relative w-full flex flex-col max-h-[230px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#024EE6] scrollbar-track-[#141A23] gap-1 mt-[30px] py-4">
      {overlays.map((item) => {
        let audioCount = 0;
        if (item.type === "audio") audioCount += 1;

        return (
          <div
            className={`relative ${
              item.type !== "text" && "h-10"
            } min-h-10 bg-[#141A23] py-2 border-[3px] border-[#024EE6] flex items-center`}
            style={{
              background: `${
                (item.type === "video" && `url(${item.videoThumbnailUrl})`) ||
                ((item.type === "image" || item.type === "gif") &&
                  `url(${item.url})`)
              } repeat center center`,
              backgroundSize: `${
                (item.type === "video" || item.type === "audio") && "auto 100%"
              }`,
              left: `${(item.startTime / duration) * 100}%`,
              width: `${
                item.type === "video"
                  ? (Number(item.duration) / duration) * 100
                  : ((Number(item.endTime) - item.startTime) / duration) * 100
              }%`,
            }}
            onClick={() => {
              if (item.type === "text") setActiveTextId(item.id);
              if (item.type === "image") setActiveImageId(item.id);
              if (item.type === "audio") setActiveAudioId(item.id);
              if (item.type === "gif") setActiveGifId(item.id);
            }}
          >
            {item.type !== "video" && (
              <>
                {item.type !== "audio" && (
                  <div
                    className="absolute left-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                    onMouseDown={() => handleDragStart(item.id, "startTime")}
                  />
                )}
                <div className="flex-1 text-white text-[16px] text-center">
                  {item.type === "text" && item.content}
                  {item.type === "audio" && `Audio ${audioCount}`}
                </div>
                {item.type !== "audio" && (
                  <div
                    className="absolute right-0 w-1 h-full bg-[#024EE6] cursor-ew-resize"
                    onMouseDown={() => handleDragStart(item.id, "endTime")}
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
