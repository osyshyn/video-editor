import { FC } from "react";
import { useMedia } from "../context/MediaContextType";

export const Media: FC = () => {
  const { mediaFiles, addMedia, selectMedia, deselectMedia, selectedMedia } =
    useMedia();

  console.log("Selected media:", selectedMedia);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMediaFiles: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("video/")) {
          const fileURL = URL.createObjectURL(file);
          newMediaFiles.push(fileURL);
        }
      });
      addMedia(newMediaFiles);
    }
  };

  const toggleSelection = (media: string) => {
    console.log("Toggling selection for:", media);
    if (selectedMedia.includes(media)) {
      deselectMedia(media);
      console.log("Deselecting:", media);
    } else {
      selectMedia(media);
      console.log("Selecting:", media);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaFiles.map((file, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-lg bg-white"
            onClick={() => toggleSelection(file)}
          >
            <div
              className={`absolute top-2 right-2 text-white ${
                selectedMedia.includes(file) ? "bg-blue-500" : "bg-gray-500"
              }`}
            >
              {selectedMedia.includes(file) ? "Selected" : "Select"}
            </div>
            <video className="w-full h-auto rounded-lg" controls>
              <source src={file} type="video/mp4" />
              <source src={file} type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    </div>
  );
};
