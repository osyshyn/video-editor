import { FaMinus, FaPlus } from "react-icons/fa";
import { useOverlay } from "../context/OverlayContext";

const TextDrawer = () => {
  const { updateOverlay, addText, activeTextId, overlays } = useOverlay();

  return (
    <div className="flex flex-col">
      <div className="p-6 rounded-lg text-base shadow-lg w-80 space-y-6 bg-gray-800 text-white">
        {activeTextId && (
          <>
            <div className="space-y-4 flex flex-col w-full items-center">
              <div className="w-full">
                <label className="text-[12px] text-[#9CA3AF]">Font Size:</label>
                <div className="flex items-center w-full font-semibold">
                  <button
                    onClick={() =>
                      activeTextId &&
                      updateOverlay(activeTextId, {
                        size: Math.max(
                          1,
                          (overlays.find((t) => t.id === activeTextId)?.size ||
                            0) - 1
                        ),
                      })
                    }
                    className="px-3 min-h-[48px] py-1 bg-[#05090F] rounded-tl rounded-bl"
                  >
                    <FaMinus />
                  </button>
                  <select
                    value={overlays.find((t) => t.id === activeTextId)?.size}
                    onChange={(e) =>
                      updateOverlay(activeTextId, {
                        size: Number(e.target.value),
                      })
                    }
                    className="px-3 min-h-[48px] flex-1 text-center py-1 bg-[#05090F] text-white"
                  >
                    {[
                      12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80,
                      96, 128, 200,
                    ].map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      activeTextId &&
                      updateOverlay(activeTextId, {
                        size: Math.min(
                          200,
                          (overlays.find((t) => t.id === activeTextId)?.size ||
                            0) + 1
                        ),
                      })
                    }
                    className="px-3 min-h-[48px] py-1 rounded-tr rounded-br bg-[#05090F]"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Text Color:</label>
                <input
                  type="color"
                  value={overlays.find((t) => t.id === activeTextId)?.color}
                  onChange={(e) =>
                    updateOverlay(activeTextId, { color: e.target.value })
                  }
                  className="w-12 h-12 p-0 border-0 rounded"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-1">
              <label className="text-[12px] text-[#9CA3AF]">Text</label>
              <textarea
                value={
                  overlays.find((t) => t.id === activeTextId)?.content || ""
                }
                onChange={(e) =>
                  activeTextId &&
                  updateOverlay(activeTextId, { content: e.target.value })
                }
                className="p-2 border rounded resize-none w-full bg-[#05090F] border-none focus:outline-none text-base"
                placeholder="Enter a text"
              />
            </div>
          </>
        )}
        <div className="w-full" onClick={addText}>
          <label
            htmlFor="media-upload"
            className="cursor-pointer w-full text-white bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Add Text
          </label>
        </div>
      </div>
    </div>
  );
};

export default TextDrawer;
