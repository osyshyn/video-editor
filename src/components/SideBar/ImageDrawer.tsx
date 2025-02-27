// import { useEffect, useState } from "react";
import { useOverlay } from "../context/OverlayContext";

export default function ImageDrawer() {
  // const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    overlays,
    addImage,
    imageOverlayActive,
    setImageOverlayActive,
    activeImageId,
    updateOverlay,
  } = useOverlay();

  // const folderId = "1D2_4orfkESXTzRoIsMVecXH9b8MR6VGo";

  // const fetchImagesFromFolder = async (folderId: string) => {
  //   const imageLinks: string[] = [];

  //   const fetchFiles = async (folderId: string) => {
  //     try {
  //       const response = await fetch(
  //         `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}`
  //       );
  //       const data = await response.json();

  //       for (const file of data.files) {
  //         if (file.mimeType.startsWith("image/")) {
  //           imageLinks.push(
  //             `https://drive.google.com/uc?export=view&id=${file.id}`
  //           );
  //         } else if (file.mimeType === "application/vnd.google-apps.folder") {
  //           await fetchFiles(file.id);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching files:", error);
  //     }
  //   };

  //   await fetchFiles(folderId);

  //   return imageLinks;
  // };

  // useEffect(() => {
  //   const fetchImages = async () => {
  //     const images = await fetchImagesFromFolder(folderId);
  //     setImageUrls((prev) => [...prev, ...images]);
  //   };

  //   fetchImages();
  // }, [folderId, apiKey]);

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-gray-800 rounded-xl shadow-lg text-white">
      <div className="mb-6">
        <label
          htmlFor="media-upload"
          className="cursor-pointer text-white bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Upload Image
        </label>
        <input
          id="media-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              addImage(file, URL.createObjectURL(file));
              setImageOverlayActive(true);
            }
          }}
        />
      </div>

      {imageOverlayActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm">Width:</label>
            <input
              type="number"
              value={overlays.find((t) => t.id === activeImageId)?.width || 100}
              onChange={(e) =>
                updateOverlay(activeImageId, { width: Number(e.target.value) })
              }
              className="w-24 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Height:</label>
            <input
              type="number"
              value={
                overlays.find((t) => t.id === activeImageId)?.height || 100
              }
              onChange={(e) =>
                updateOverlay(activeImageId, { height: Number(e.target.value) })
              }
              className="w-24 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* <div className="space-y-4">
        {imageUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Image ${index + 1}`}
            className="w-full h-auto rounded-md"
          />
        ))}
      </div> */}
    </div>
  );
}
