import React, { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

const VideoProcessor = () => {
  const [loaded, setLoaded] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [overlayText, setOverlayText] = useState("Ваш текст");
  const [textX, setTextX] = useState(10);
  const [textY, setTextY] = useState(10);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
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
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setOutputUrl(null);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const transcode = async () => {
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
    }
    setProcessing(false);
  };

  return (
    <div className="p-4">
      {loaded ? (
        <>
          <input type="file" accept="video/*" onChange={handleFileChange} />
          {videoFile && <p>Выбранное видео: {videoFile.name}</p>}
          <input
            type="text"
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
            placeholder="Введите текст для видео"
          />
          <div className="mt-2 flex space-x-4">
            <div>
              <label className="block text-sm">Позиция X:</label>
              <input
                type="number"
                value={textX}
                onChange={(e) => setTextX(Number(e.target.value))}
                className="p-2 border rounded w-24"
              />
            </div>
            <div>
              <label className="block text-sm">Позиция Y:</label>
              <input
                type="number"
                value={textY}
                onChange={(e) => setTextY(Number(e.target.value))}
                className="p-2 border rounded w-24"
              />
            </div>
          </div>
          <video
            ref={videoRef}
            controls
            className="mt-4 w-full max-w-md"
          ></video>
          <button
            onClick={transcode}
            disabled={!videoFile || processing}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            {processing ? "Обрабатывается..." : "Добавить текст и обработать"}
          </button>
          {outputUrl && (
            <a
              href={outputUrl}
              download="output.mp4"
              className="mt-4 block bg-green-500 text-white text-center px-4 py-2 rounded"
            >
              Скачать видео
            </a>
          )}
        </>
      ) : (
        <p>Загрузка FFmpeg...</p>
      )}
    </div>
  );
};

export default VideoProcessor;
