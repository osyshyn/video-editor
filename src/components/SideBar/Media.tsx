import { FC, useState } from "react";

interface Props {}

export const Media: FC<Props> = () => {
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMediaFiles: string[] = [];
      Array.from(files).forEach((file) => {
        const fileURL = URL.createObjectURL(file);
        newMediaFiles.push(fileURL);
      });
      setMediaFiles((prev) => [...prev, ...newMediaFiles]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <label
          htmlFor="media-upload"
          className="cursor-pointer text-white bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg shadow-md transition"
        >
          Upload Media
        </label>
        <input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaFiles.map((file, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-lg bg-white"
          >
            {file.endsWith(".mp4") || file.endsWith(".mov") ? (
              <video className="w-full h-auto rounded-lg" controls>
                <source src={file} type="video/mp4" />
                <source src={file} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                className="w-full h-auto rounded-lg"
                src={file}
                alt={`media-${index}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
