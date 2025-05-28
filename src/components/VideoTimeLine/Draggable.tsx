import { useDrag, useDrop } from "react-dnd";
import { OverlayItem, OverlayItemIndex } from "../context/OverlayContext";
import { throttle } from "lodash";

interface IDraggableOverlayItemProps {
  audioCount?: number;
  item: OverlayItem;
  index: number;
  duration: number;
  moveOverlay: (dragIndex: number, hoverIndex: number) => void;
  handleDragStart: (overlayId: string, type: "startTime" | "endTime") => void;
  setActiveTextId?: (id: string | null) => void;
  setActiveImageId?: (id: string) => void;
  setActiveAudioId?: (id: string | null) => void;
  setActiveGifId?: (id: string) => void;
  setImageOverlayActive?: React.Dispatch<React.SetStateAction<boolean>>;
  setGifOverlayActive?: React.Dispatch<React.SetStateAction<boolean>>;
  setAudioOverlayActive?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedOverlayId: string | null;
  setSelectedOverlayId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ItemType = "OVERLAY_ITEM";

export function DraggableOverlayItem({
  audioCount,
  item,
  index,
  duration,
  moveOverlay,
  handleDragStart,
  setActiveTextId,
  setActiveImageId,
  setActiveAudioId,
  setActiveGifId,
  setImageOverlayActive,
  setGifOverlayActive,
  setAudioOverlayActive,
  setSelectedOverlayId,
}: IDraggableOverlayItemProps) {
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: throttle((draggedItem: OverlayItemIndex) => {
      if (draggedItem.index !== index) {
        moveOverlay(draggedItem.index, index);
        draggedItem.index = index;
      }
    }, 100),
  });
  return (
    <div
      ref={
        item.type === "video" || item.type === "audio"
          ? (node) => ref(drop(node))
          : null
      }
      className={`relative ${
        item.type !== "text" && "h-10"
      } min-h-10 bg-[#141A23] py-2 border-[3px] border-[#024EE6] flex items-center`}
      style={{
        background: `${
          (item.type === "video" && `url(${item.videoThumbnailUrl})`) ||
          ((item.type === "image" || item.type === "gif") && `url(${item.url})`)
        } repeat center center`,
        backgroundSize: `${
          (item.type === "video" || item.type === "audio") && "auto 100%"
        }`,
        left: `${(item.startTime / duration) * 100}%`,
        width: `${
          item.type === "video" || item.type === "audio"
            ? (Number(item.duration) / duration) * 100
            : ((Number(item.endTime) - item.startTime) / duration) * 100
        }%`,
      }}
      onClick={() => {
        setSelectedOverlayId(item.id);
        if (setActiveTextId) {
          if (item.type === "text") setActiveTextId(item.id);
        }
        if (setImageOverlayActive && setActiveImageId) {
          if (item.type === "image") {
            setImageOverlayActive(true);
            setActiveImageId(item.id);
          }
        }
        if (setAudioOverlayActive && setActiveAudioId) {
          if (item.type === "audio") {
            setAudioOverlayActive(true);
            setActiveAudioId(item.id);
          }
        }
        if (setGifOverlayActive && setActiveGifId) {
          if (item.type === "gif") {
            setGifOverlayActive(true);
            setActiveGifId(item.id);
          }
        }
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
          <div
            ref={item.type !== "audio" ? (node) => ref(drop(node)) : null}
            className="flex-1 w-full text-white text-[16px] text-center"
          >
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
}
