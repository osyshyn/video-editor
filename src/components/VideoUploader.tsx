import { useState, useRef, useEffect } from "react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Button } from "@/components/ui/button";
import VideoTimeLine from "./VideoTimeLine";

export default function VideoEditor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoTime, setVideoTime] = useState(0); // Track current video time
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [overlayText, setOverlayText] = useState("Ваш текст");
  const [textX, setTextX] = useState(10);
  const [textY, setTextY] = useState(10);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (videoFile && videoRef.current) {
      const videoUrl = URL.createObjectURL(videoFile);
      videoRef.current.src = videoUrl;
      console.log("Updated video source:", videoUrl);
    }
  }, [videoFile]);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
    loadFont();
  };

  const loadFont = async () => {
    const ffmpeg = ffmpegRef.current;
    const fontData = await fetchFile(
      "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf"
    );
    await ffmpeg.writeFile("arial.ttf", fontData);
    setFontLoaded(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger;
    const file = e.target.files?.[0];
    console.log("Selected file:", file);
    if (file) {
      setVideoFile(file);
      setOutputUrl(null);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
        console.log("Video source set:", videoRef.current.src);
      }
    }
  };

  const transcode = async () => {
    debugger;
    if (!videoFile || !fontLoaded) return;
    setProcessing(true);
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      "scale=640:-1",
      "resized.mp4",
    ]);

    await ffmpeg.exec([
      "-i",
      "resized.mp4",
      "-vf",
      `drawtext=fontfile=/arial.ttf:text='${overlayText}':x=${textX}:y=${textY}:fontsize=24:fontcolor=white`,
      "output.mp4",
    ]);

    const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
    const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(videoBlob);
    setOutputUrl(videoUrl);

    if (videoRef.current) {
      videoRef.current.src = videoUrl;
    } else {
      console.log("VideoRef: ", videoRef);
    }
    setProcessing(false);
  };

  const processVideo = async () => {
    if (!videoFile) return;
    setLoading(true);
    await load();

    await ffmpegRef.current.writeFile("input.mp4", await fetchFile(videoFile));
    await ffmpegRef.current.exec([
      "-i",
      "input.mp4",
      "-ss",
      "00:00:02",
      "-t",
      "5",
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoTime(videoRef.current.currentTime); // Update video time
    }
  };

  const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (videoRef.current) {
      console.log(Math.floor(videoRef.current.duration));
      videoRef.current.currentTime = value; // Update video time when slider changes
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  return (
    <div className="m-5">
      {!videoFile && (
        <div className="absolute right-[50%] top-[50%] flex items-center justify-center w-[300px] transform translate-x-1/2 translate-y-[-50%]">
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
        <div className="relative p-5 rounded-2xl overflow-hidden shadow-lg bg-gray-50 dark:bg-gray-700 ">
          <video
            ref={videoRef}
            controls
            className="mt-4 w-full max-w-md"
          ></video>
        </div>
      )}

      {videoFile && (
        <Button onClick={processVideo} disabled={loading}>
          {loading ? "Processing..." : "Trim Video"}
        </Button>
      )}

      {videoFile && (
        <div>
          <VideoTimeLine
            handleRangeChange={handleRangeChange}
            videoTime={videoTime}
            videoRef={videoRef}
          />
        </div>
      )}

      {videoFile && (
        <>
          <input
            type="text"
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
            placeholder="Введите текст для видео"
          />
          <div className="mt-2 flex space-x-4">
            <div>
              <label className="block text-sm">Position X:</label>
              <input
                type="number"
                value={textX}
                onChange={(e) => setTextX(Number(e.target.value))}
                className="p-2 border rounded w-24"
              />
            </div>
            <div>
              <label className="block text-sm">Position Y:</label>
              <input
                type="number"
                value={textY}
                onChange={(e) => setTextY(Number(e.target.value))}
                className="p-2 border rounded w-24"
              />
            </div>
          </div>
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
