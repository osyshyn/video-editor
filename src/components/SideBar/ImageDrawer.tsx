import { useOverlay } from "../context/OverlayContext";

export default function ImageDrawer() {
  const {
    overlays,
    addImage,
    imageOverlayActive,
    setImageOverlayActive,
    activeImageId,
    updateOverlay,
  } = useOverlay();

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-gray-800 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-semibold mb-4">Image Upload & Controls</h2>

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
            <label className="text-sm">X Position:</label>
            <input
              type="number"
              value={overlays.find((t) => t.id === activeImageId)?.x || 0}
              onChange={(e) =>
                updateOverlay(activeImageId, {
                  x: Number(e.target.value),
                })
              }
              className="w-24 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Y Position:</label>
            <input
              type="number"
              value={overlays.find((t) => t.id === activeImageId)?.y || 0}
              onChange={(e) =>
                updateOverlay(activeImageId, { y: Number(e.target.value) })
              }
              className="w-24 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
    </div>
  );
}
