import { useOverlay } from "../context/OverlayContext";

export default function AudioDrawer() {
  const {
    overlays,
    addAudio,
    audioOverlayActive,
    setAudioOverlayActive,
    activeAudioId,
  } = useOverlay();

  const activeAudio = overlays.find(
    (overlay) => overlay.id === activeAudioId && overlay.type === "audio"
  );

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-gray-800 rounded-xl shadow-lg text-white">
      <div className="mb-6">
        <label
          htmlFor="audio-upload"
          className="cursor-pointer text-white bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Upload Audio
        </label>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              addAudio(file, url);
              setAudioOverlayActive(true);
            }
          }}
        />
      </div>

      {activeAudio?.url && audioOverlayActive && (
        <audio controls className="w-full">
          <source src={activeAudio.url} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
