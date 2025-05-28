import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import VideoTimeLine from "./VideoTimeLine/VideoTimeLine";
import { OverlayItem, useOverlay } from "./context/OverlayContext";
import { FaPause, FaPlay } from "react-icons/fa";
import { useTrimContext } from "./context/TrimContext";
import { useTimeLineContext } from "./context/TimeLineContext";
import { useTrimSyncWithPlayer } from "@/hooks/useTrimSyncWithPlayer";
import { useLoadFfmpeg } from "@/hooks/useLoadFfmpeg";
export default function VideoEditor({
  selectedItem,
  setSelectedItem,
}: {
  selectedItem: string;
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [overlay, setOverlay] = useState<OverlayItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { timeHasSetted, setTimeHasSetted, setCurrentTime } =
    useTimeLineContext();

  useEffect(() => {
    const handleMouseUp = () => setDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const ffmpegRef = useRef(new FFmpeg());
  const { videoRef, duration } = useTrimContext();

  const [dragging, setDragging] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const {
    overlays,
    activeTextId,
    setActiveTextId,
    updateOverlay,
    selectedOverlayId,
  } = useOverlay();

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const fullOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );
    if (fullOverlay) setOverlay(fullOverlay);
  }, [overlays, selectedOverlayId]);

  useLoadFfmpeg(ffmpegRef);

  useEffect(() => {
    setTimeout(() => {
      if (videoRef.current && overlay?.file) {
        videoRef.current.src = URL.createObjectURL(overlay.file);
      }
    }, 100);
  }, [overlay?.file, videoRef]);

  const handleTextDragEnd = (
    e: React.DragEvent<HTMLDivElement>,
    id: string
  ) => {
    if (videoContainerRef.current) {
      const containerRect = videoContainerRef.current.getBoundingClientRect();
      const newX = e.clientX - containerRect.left;
      const newY = e.clientY - containerRect.top;
      updateOverlay(id, { x: newX, y: newY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    setDragging(true);

    const rect = imageRef.current.getBoundingClientRect();
    setOffsetX(e.clientX - rect.left);
    setOffsetY(e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent, id: string) => {
      if (!dragging || !videoContainerRef.current) return;

      const rect = videoContainerRef.current.getBoundingClientRect();

      let newX = e.clientX - rect.left - offsetX;
      let newY = e.clientY - rect.top - offsetY;

      newX = Math.max(
        0,
        Math.min(newX, rect.width - imageRef.current!.offsetWidth)
      );
      newY = Math.max(
        0,
        Math.min(newY, rect.height - imageRef.current!.offsetHeight)
      );

      updateOverlay(id, { x: newX, y: newY });
    };

    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offsetX, offsetY, updateOverlay]);

  useTrimSyncWithPlayer(
    videoRef,
    timeHasSetted,
    isPlaying,
    duration,
    setCurrentTime,
    setTimeHasSetted
  );

  const handleRangeChange = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  return (
    <div className="flex flex-col bg-[#05090F] items-center relative h-full w-full">
      <div className="mt-4 mr-4 self-end px-4 py-2 border-2 border-white rounded-2xl text-white cursor-pointer">
        Render Video
      </div>
      <div
        ref={videoContainerRef}
        className=" ml-[400px] relative p-5 w-full flex h-[60%] flex-col items-center justify-center overflow-hidden shadow-lg bg-[#05090F]"
      >
        <video
          ref={overlay?.type === "video" ? videoRef : null}
          className={`mt-4 w-full h-full ${
            overlay?.type === "video" && selectedItem === "Trim"
              ? "block"
              : "hidden"
          }`}
        ></video>
        <audio
          ref={overlay?.type === "audio" ? videoRef : null}
          className={`w-full ${
            overlay?.type === "audio" && selectedItem === "Trim"
              ? "block"
              : "hidden"
          }`}
        ></audio>
        {selectedItem !== "Trim" &&
          overlays.map((text) => {
            if (text.type === "text") {
              return (
                <div
                  key={text.id}
                  draggable
                  onDragEnd={(e) => handleTextDragEnd(e, text.id)}
                  onClick={() => setActiveTextId(text.id)}
                  style={{
                    position: "absolute",
                    left: text.x,
                    top: text.y,
                    padding: "4px",
                    cursor: "move",
                    outline:
                      activeTextId === text.id ? "1px solid blue" : "none",
                  }}
                >
                  <input
                    type="text"
                    value={text.content}
                    onChange={(e) =>
                      updateOverlay(text.id, { content: e.target.value })
                    }
                    className="p-1 border-0 bg-transparent"
                    style={{ color: text.color, fontSize: text.size }}
                    placeholder="Enter text"
                  />
                </div>
              );
            }
            if (text.type === "image") {
              return (
                <div
                  key={text.id}
                  ref={imageRef}
                  onMouseDown={handleMouseDown}
                  style={{
                    position: "absolute",
                    left: text.x,
                    top: text.y,
                    cursor: "grab",
                    width: "200px",
                    height: "200px",
                    userSelect: "none",
                  }}
                >
                  <img
                    src={URL.createObjectURL(
                      (text?.file || text?.url) as Blob | MediaSource
                    )}
                    alt="overlay"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
              );
            }
          })}
        <div
          onClick={() => setIsPlaying(!isPlaying)}
          className=" absolute left-[50%] translate-x-[-50%] bottom-[6%] text-gray-400"
        >
          {isPlaying ? (
            <FaPause className="w-8 h-8" />
          ) : (
            <FaPlay className="w-8 h-8" />
          )}
        </div>
      </div>

      <div
        className="relative left-10 z-9999 mt-auto"
        style={{
          width: "calc(100vw - 80px)",
        }}
      >
        <VideoTimeLine
          isPlaying={isPlaying}
          selectedItem={selectedItem}
          handleRangeChange={handleRangeChange}
          setSelectedItem={setSelectedItem}
          handleSetOverlay={setOverlay}
        />
      </div>
      {/* {videoFile && (
        <>
          <button
            onClick={transcode}
            disabled={!videoFile || processing}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            {processing ? "Processing..." : "Transcode Video"}
          </button>
        </>
      )} */}
    </div>
  );
}
