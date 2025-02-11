import { useState, useRef, useEffect } from "react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Button } from "@/components/ui/button";
import VideoTimeLine from "./VideoTimeLine/VideoTimeLine";
import VideoTrimer from "./VideoTimeLine/VideoTrimer";
import ImageOverlayControls from "./ImageOverlayControls";
import { Select } from "./ui/select";

interface TextOverlay {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function VideoEditor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string>("");
  const [imageX, setImageX] = useState(10);
  const [imageY, setImageY] = useState(10);
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);
  const [imageOverlayActive, setImageOverlayActive] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Selected file:", file);
    if (file) {
      setVideoFile(file);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
        console.log("Video source set:", videoRef.current.src);
        setEndTime(Number(videoRef.current.duration));
      }
    }
  };

  const handleClickAddText = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      content: "",
      x: 50,
      y: 50,
      size: 24,
      color: "#ffffff",
    };
    setTexts((prev) => [...prev, newText]);
    setActiveTextId(newText.id);
  };

  const updateText = (id: string, newData: Partial<TextOverlay>) => {
    setTexts((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...newData } : text))
    );
  };

  const handleTextDragEnd = (
    e: React.DragEvent<HTMLDivElement>,
    id: string
  ) => {
    if (videoContainerRef.current) {
      const containerRect = videoContainerRef.current.getBoundingClientRect();
      const newX = e.clientX - containerRect.left;
      const newY = e.clientY - containerRect.top;
      updateText(id, { x: newX, y: newY });
    }
  };

  const handleImageDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (videoContainerRef.current) {
      const rect = videoContainerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      setImageX(newX);
      setImageY(newY);
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

    const drawTextFilters = texts.map((item) => {
      const ffmpegColor = item.color.startsWith("#")
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
    <div className="flex ml-[400px] flex-col items-center justify-center h-full w-full">
      {!videoFile && (
        <div className="absolute flex items-center justify-center w-[300px] transform translate-x-1/2 translate-y-[-50%] right-[50%] top-[50%]">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">MP4</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {videoFile && (
        <div
          ref={videoContainerRef}
          className="relative p-5 rounded-2xl overflow-hidden shadow-lg bg-gray-50 dark:bg-gray-700 flex flex-col items-center"
        >
          <video
            ref={videoRef}
            controls
            className="rounded-xl w-[640px] h-[360px]"
          ></video>
          {texts.map((text) => (
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
                borderRadius: "4px",
                cursor: "move",
                outline: activeTextId === text.id ? "1px solid blue" : "none",
              }}
            >
              <input
                type="text"
                value={text.content}
                onChange={(e) =>
                  updateText(text.id, { content: e.target.value })
                }
                onClick={(e) => e.stopPropagation()}
                className="p-1 border-0 bg-transparent"
                style={{ color: text.color, fontSize: text.size }}
                placeholder="Enter text"
              />
            </div>
          ))}
          {imageOverlayActive && imageFile && (
            <div
              draggable
              onDragEnd={handleImageDragEnd}
              style={{
                position: "absolute",
                left: imageX,
                top: imageY,
                width: imageWidth,
                height: imageHeight,
                cursor: "move",
              }}
            >
              <img
                src={URL.createObjectURL(imageFile)}
                alt="overlay"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      )}

      <Select></Select>

      {videoFile && <Button onClick={handleClickAddText}>Add Text</Button>}

      {videoFile && (
        <Button onClick={processVideo} disabled={loading}>
          {loading ? "Processing..." : "Trim Video"}
        </Button>
      )}

      {videoFile && (
        <div className="flex flex-col w-[60%]">
          <VideoTimeLine
            handleRangeChange={handleRangeChange}
            videoRef={videoRef}
          />
          <VideoTrimer
            handleRangeChange={handleRangeChange}
            videoRef={videoRef}
            setStartTime={setStartTime}
            startTime={startTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />
        </div>
      )}

      {videoFile && activeTextId && (
        <div className="mt-2 flex items-center space-x-4">
          <div>
            <label className="block text-sm">Font Size:</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  activeTextId &&
                  updateText(activeTextId, {
                    size: Math.max(
                      1,
                      (texts.find((t) => t.id === activeTextId)?.size || 0) - 1
                    ),
                  })
                }
                className="px-2 py-1 border rounded"
              >
                -
              </button>
              <select
                value={texts.find((t) => t.id === activeTextId)?.size}
                onChange={(e) =>
                  updateText(activeTextId, { size: Number(e.target.value) })
                }
                className="px-2 py-1 border rounded"
              >
                {[
                  12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96,
                  128, 200,
                ].map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  activeTextId &&
                  updateText(activeTextId, {
                    size: Math.min(
                      200,
                      (texts.find((t) => t.id === activeTextId)?.size || 0) + 1
                    ),
                  })
                }
                className="px-2 py-1 border rounded"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm">Text Color:</label>
            <input
              type="color"
              value={texts.find((t) => t.id === activeTextId)?.color}
              onChange={(e) =>
                updateText(activeTextId, { color: e.target.value })
              }
              className="w-10 h-10 p-0 border-0"
            />
          </div>
        </div>
      )}

      {videoFile && (
        <>
          {/* <ImageOverlayControls
            imageFile={imageFile}
            handleImageChange={handleImageChange}
            imageX={imageX}
            imageY={imageY}
            setImageX={setImageX}
            setImageY={setImageY}
          />
          <button
            onClick={addImageToVideo}
            disabled={!videoFile || !imageFile || processing}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Image to Video
          </button> */}
          <button
            onClick={transcode}
            disabled={!videoFile || processing}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            {processing ? "Processing..." : "Transcode Video"}
          </button>
        </>
      )}
    </div>
  );
}
