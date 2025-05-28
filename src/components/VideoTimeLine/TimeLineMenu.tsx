import deleteIcon from "../../assets/trash.svg";
import copyIcon from "../../assets/copy.svg";
import trimIcon from "../../assets/scissors.svg";
import { OverlayItem, useOverlay } from "../context/OverlayContext";
import { useTrimContext } from "../context/TrimContext";
import { fetchFile } from "@ffmpeg/util";
import { useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useLoadFfmpeg } from "@/hooks/useLoadFfmpeg";
import { getVideoDuration } from "@/lib/utils";

interface ITimeLineMenuProps {
  deleteOverlay: () => void;
  copyOverlay: () => void;
  currentTime: number;
  duration: number;
  setSelectedItem: React.Dispatch<React.SetStateAction<string>>;
  overlay: OverlayItem | null;
  selectedItem: string;
  setOverlayNull: () => void;
}

export const TimeLineMenu = ({
  copyOverlay,
  setOverlayNull,
  deleteOverlay,
  currentTime,
  duration,
  setSelectedItem,
  overlay,
}: ITimeLineMenuProps) => {
  const formatTime = (time: number) => {
    const seconds = Math.floor(time);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(
      2,
      "0"
    )}`;
  };

  const ffmpegRef = useRef(new FFmpeg());

  const { updateOverlay } = useOverlay();

  const {
    startTime,
    endTime,
    setDuration,
    setCurrentTime,
    setEndTime,
    setStartTime,
  } = useTrimContext();

  useLoadFfmpeg(ffmpegRef);

  const processVideo = async () => {
    if (!overlay?.file) return;

    if (!ffmpegRef.current.loaded) {
      console.error("FFmpeg is not loaded yet!");
      return;
    }

    await ffmpegRef.current.writeFile("input", await fetchFile(overlay?.file));
    if (overlay.type === "video") {
      await ffmpegRef.current.exec([
        "-ss",
        `${startTime}`,
        "-i",
        "input",
        "-t",
        `${endTime - startTime}`,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-c:a",
        "aac",
        "-strict",
        "experimental",
        "output.mp4",
      ]);
    }

    if (overlay.type === "audio") {
      await ffmpegRef.current.exec([
        "-ss",
        `${startTime}`,
        "-i",
        "input",
        "-t",
        `${endTime - startTime}`,
        "-vn",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "192k",
        "output.mp3",
      ]);
    }

    const outputFile = overlay.type === "audio" ? "output.mp3" : "output.mp4";
    const mimeType = overlay.type === "audio" ? "audio/mp3" : "video/mp4";

    const fileData = await ffmpegRef.current.readFile(outputFile);
    const data = new Uint8Array(fileData as ArrayBuffer);
    const trimmedFile = new File([data.buffer], `trimmed-${outputFile}`, {
      type: mimeType,
    });

    const duration = await getVideoDuration(trimmedFile);

    if (overlay) {
      updateOverlay(overlay.id, {
        file: trimmedFile,
        url: URL.createObjectURL(trimmedFile),
        duration,
      });
    }

    setDuration(0);
    setCurrentTime(0);
    setEndTime(0);
    setStartTime(0);
    setOverlayNull();

    setSelectedItem("Media");
  };

  const handleRender = () => {
    processVideo();
  };

  return (
    <div className="flex justify-center gap-1 items-center text-white text-[16px] px-4">
      <div className="flex flex-row flex-1 justify-start items-center gap-4">
        <img
          onClick={() => {
            setSelectedItem((prev) => {
              if (
                (overlay?.type === "video" || overlay?.type === "audio") &&
                prev !== "Trim"
              ) {
                return "Trim";
              }
              if (prev === "Trim") {
                handleRender();
              }
              return prev;
            });
          }}
          className={`${
            (overlay?.type === "video" || overlay?.type === "audio") &&
            "cursor-pointer"
          }  `}
          src={trimIcon}
          alt="Trim icon"
        />
        <img
          className="cursor-pointer"
          onClick={copyOverlay}
          src={copyIcon}
          alt="Copy icon"
        />
        <img
          onClick={deleteOverlay}
          className="cursor-pointer"
          src={deleteIcon}
          alt="Delete icon"
        />
      </div>
      <div className="flex flex-row flex-1">
        <span>{formatTime(currentTime)}</span>
        <span>/</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
