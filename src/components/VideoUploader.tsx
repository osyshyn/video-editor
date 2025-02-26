import { useState, useRef, useEffect } from "react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Button } from "@/components/ui/button";
import VideoTimeLine from "./VideoTimeLine/VideoTimeLine";
import VideoTrimer from "./VideoTimeLine/VideoTrimer";
import { useOverlay } from "./context/OverlayContext";
export default function VideoEditor({
  selectedItem,
}: {
  selectedItem: string;
}) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => setDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);

  const [processing, setProcessing] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  const [dragging, setDragging] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const {
    overlays,
    activeTextId,
    setActiveTextId,
    updateOverlay,
    setImageOverlayActive,
    activeImageId,
  } = useOverlay();

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const load = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on("log", ({ message }) => {
        if (messageRef.current) messageRef.current.innerHTML = message;
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      loadFont();
    };
    load();
  }, []);

  useEffect(() => {
    if (videoFile && videoRef.current) {
      const videoUrl = URL.createObjectURL(videoFile);
      videoRef.current.src = videoUrl;
      console.log("Updated video source:", videoUrl);
    }
  }, [videoFile]);

  const loadFont = async () => {
    const ffmpeg = ffmpegRef.current;
    const fontData = await fetchFile(
      "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf"
    );
    await ffmpeg.writeFile("arial.ttf", fontData);
    setFontLoaded(true);
  };

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

  const handleImageDragEnd = (
    e: React.DragEvent<HTMLDivElement>,
    id: string
  ) => {
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      const imageWidth =
        overlays.find((t) => t.id === activeImageId)?.width || 100;
      const imageHeight =
        overlays.find((t) => t.id === activeImageId)?.width || 100;

      // Optional: constrain the image within the bounds of the video container
      const maxX = rect.width - imageWidth;
      const maxY = rect.height - imageHeight;
      updateOverlay(id, {
        x: Math.min(Math.max(newX, 0), maxX),
        y: Math.min(Math.max(newY, 0), maxY),
      });
    }
  };

  const transcode = async () => {
    if (!videoFile || !fontLoaded) return;
    setProcessing(true);
    const ffmpeg = ffmpegRef.current;

    try {
      (ffmpeg as any).FS("unlink", "input.mp4");
    } catch (err) {
      console.log("Error deleting input.mp4", err);
    }
    try {
      (ffmpeg as any).FS("unlink", "output.mp4");
    } catch (err) {
      console.log("Error deleting output.mp4", err);
    }

    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile("input.mp4", videoData);

    const drawTextFilters = overlays.map((item) => {
      const ffmpegColor = item.color?.startsWith("#")
        ? item.color.replace("#", "0x")
        : item.color;
      return `drawtext=fontfile=/arial.ttf:text='${item.content}':x=${item.x}:y=${item.y}:fontsize=${item.size}:fontcolor=${ffmpegColor}`;
    });
    const execArgs =
      drawTextFilters.length > 0
        ? ["-i", "input.mp4", "-vf", drawTextFilters.join(","), "output.mp4"]
        : ["-i", "input.mp4", "output.mp4"];

    await ffmpeg.exec(execArgs);

    const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
    const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(videoBlob);

    if (videoRef.current) {
      videoRef.current.src = videoUrl;
    } else {
      console.log("VideoRef: ", videoRef);
    }
    setProcessing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageURL(URL.createObjectURL(file));
      setImageOverlayActive(false);
    }
  };

  const addImageToVideo = () => {
    if (!videoFile || !imageFile) return;
    setImageOverlayActive(true);
  };

  const processVideo = async () => {
    if (!videoFile) return;
    setLoading(true);

    await ffmpegRef.current.writeFile("input.mp4", await fetchFile(videoFile));
    await ffmpegRef.current.exec([
      "-i",
      "input.mp4",
      "-ss",
      `${startTime}`,
      "-t",
      `${endTime - startTime}`,
      "-c",
      "copy",
      "output.mp4",
    ]);

    const fileData = await ffmpegRef.current.readFile("output.mp4");
    const data = new Uint8Array(fileData as ArrayBuffer);
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
    }
    setVideoFile(
      new File([data.buffer], "trimmed-video.mp4", { type: "video/mp4" })
    );
    setLoading(false);
  };

  const handleRangeChange = (event: number) => {
    if (videoRef.current) {
      console.log(videoRef.current.currentTime);
      videoRef.current.currentTime = event;
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full">
      {videoFile && (
        <div
          ref={videoContainerRef}
          onClick={() => setIsPlaying(!isPlaying)}
          className=" ml-[400px] relative p-5 w-full flex h-[60%] flex-col items-center justify-center overflow-hidden shadow-lg bg-gray-50 dark:bg-gray-700"
        >
          <video ref={videoRef} className="mt-4 w-full h-full"></video>
          {overlays.map((text) => {
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
        </div>
      )}
      <div
        className="relative left-10 z-9999 mt-auto"
        style={{
          width: "calc(100vw - 80px)",
        }}
      >
        {selectedItem === "Trim" ? (
          <VideoTrimer
            handleRangeChange={handleRangeChange}
            videoRef={videoRef}
            setStartTime={setStartTime}
            startTime={startTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />
        ) : (
          <VideoTimeLine
            handleRangeChange={handleRangeChange}
            isPlaying={isPlaying}
          />
        )}
      </div>
      {videoFile && selectedItem === "Trim" && (
        <Button onClick={processVideo} disabled={loading}>
          {loading ? "Processing..." : "Trim Video"}
        </Button>
      )}
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
