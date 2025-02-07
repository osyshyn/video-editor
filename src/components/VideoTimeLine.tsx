import { useEffect, useState } from "react";

export default function VideoTimeLine({
  videoRef,
  videoTime,
  handleRangeChange,
}) {
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => {
      setDuration(Math.floor(video.duration));
    };

    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  return (
    <input
      type="range"
      min="0"
      max={duration}
      value={videoTime}
      onChange={handleRangeChange}
      className="w-full mt-4"
    />
  );
}
