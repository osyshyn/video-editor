import { useState, useRef } from "react";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function VideoEditor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setVideoFile(file);
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
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <Input type="file" accept="video/mp4" onChange={handleFileChange} />
      {videoFile && (
        <video
          ref={videoRef}
          controls
          style={{ width: "640px", height: "360px" }}
        >
          <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
        </video>
      )}
      <Button onClick={processVideo} disabled={!videoFile || loading}>
        {loading ? "Processing..." : "Trim Video"}
      </Button>
      {loading && <Progress value={50} className="w-full" />}
    </div>
  );
}
