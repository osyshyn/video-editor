import { FC, useEffect, useState } from "react";

import { useDrag } from "react-dnd";

const DraggableVideo: FC<{ file: File; url: string }> = ({ file, url }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "VIDEO",
    item: { file, url },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={`cursor-grab ${isDragging ? "opacity-50" : ""}`}>
      <video className="w-full h-auto rounded-lg">
        <source src={url} type={file.type} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export const Media: FC = () => {
  const [media, setMedia] = useState<File[]>([]);
  const [mediaURLs, setMediaURLs] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      mediaURLs.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaURLs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).filter((file) =>
        file.type.startsWith("video/")
      );

      setMedia((prev) => [...prev, ...newFiles]);

      const newURLs = newFiles.map((file) => URL.createObjectURL(file));
      setMediaURLs((prev) => [...prev, ...newURLs]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <label
          htmlFor="media-upload"
          className="cursor-pointer text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg shadow-md transition"
        >
          Upload Video
        </label>
        <input
          id="media-upload"
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="flex flex-col gap-6">
        {media.map((file, index) => {
          const url = URL.createObjectURL(file);
          return <DraggableVideo key={index} file={file} url={url} />;
        })}
      </div>
    </div>
  );
};
