import { OverlayItem, useOverlay } from "../context/OverlayContext";
import { DraggableOverlayItem } from "./Draggable";
import { TrimElement } from "./TrimElement";

interface ITimeLinesProps {
  selectedItem: string;
  duration: number;
  handleDragStart: (overlayId: string, type: "startTime" | "endTime") => void;
  overlay: OverlayItem | null;
  handleRangeChange: (startTime: number) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>;
  timelineRef: React.RefObject<HTMLDivElement | null>;
}

export function TimeLines({
  duration,
  handleDragStart,
  selectedItem,
  overlay,
  handleRangeChange,
  timelineRef,
}: ITimeLinesProps) {
  const {
    overlays,
    videoOverlays,
    setOverlays,
    setActiveTextId,
    setActiveImageId,
    setActiveAudioId,
    setActiveGifId,
    setImageOverlayActive,
    setGifOverlayActive,
    setAudioOverlayActive,
    selectedOverlayId,
    setSelectedOverlayId,
  } = useOverlay();

  const moveOverlay = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return;

    setOverlays((prev: OverlayItem[]) => {
      const updatedOverlays = [...prev];
      const [movedItem] = updatedOverlays.splice(dragIndex, 1);
      updatedOverlays.splice(hoverIndex, 0, movedItem);

      return updatedOverlays.map((overlay, idx) => ({
        ...overlay,
        index: idx,
      }));
    });
  };

  return (
    <div className="relative w-full flex flex-col max-h-[230px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#024EE6] scrollbar-track-[#141A23] gap-1 mt-[30px] py-4">
      {selectedItem === "Trim" &&
      overlay &&
      (overlay.type === "audio" || overlay.type === "video") ? (
        <TrimElement
          overlay={overlay}
          duration={duration}
          timelineRef={timelineRef}
          handleRangeChange={handleRangeChange}
        />
      ) : (
        <>
          <div className="w-full flex flex-row">
            {videoOverlays.map((item, index) => (
              <DraggableOverlayItem
                key={item.id}
                index={index}
                item={item}
                selectedOverlayId={selectedOverlayId}
                setSelectedOverlayId={setSelectedOverlayId}
                duration={duration}
                moveOverlay={moveOverlay}
                handleDragStart={handleDragStart}
              />
            ))}
          </div>
          {overlays.map((item, index) => (
            <DraggableOverlayItem
              key={item.id}
              index={index}
              item={item}
              audioCount={item.type === "audio" ? index + 1 : 0}
              selectedOverlayId={selectedOverlayId}
              setSelectedOverlayId={setSelectedOverlayId}
              duration={duration}
              moveOverlay={moveOverlay}
              handleDragStart={handleDragStart}
              setActiveTextId={setActiveTextId}
              setActiveImageId={setActiveImageId}
              setActiveAudioId={setActiveAudioId}
              setActiveGifId={setActiveGifId}
              setImageOverlayActive={setImageOverlayActive}
              setGifOverlayActive={setGifOverlayActive}
              setAudioOverlayActive={setAudioOverlayActive}
            />
          ))}
        </>
      )}
    </div>
  );
}
