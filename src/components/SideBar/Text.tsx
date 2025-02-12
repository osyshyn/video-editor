import React, { FC, useState } from "react";
import { Button } from "../ui/button";
import { useOverlay } from "../context/OverlayContext";

interface TextDrawerProps {
  onTextChange: (text: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const TextDrawer: FC<TextDrawerProps> = ({
  onTextChange,
  onPositionChange,
}) => {
  const {
    updateOverlay,
    addText,
    activeTextId,
    setActiveTextId,
    overlays,
    isVideoFile,
  } = useOverlay();

  const [text, setText] = useState<string>("");
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
    onTextChange(event.target.value);
  };

  const handlePositionXChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const x = parseInt(event.target.value);
    setPositionX(x);
    onPositionChange({ x, y: positionY });
  };

  const handlePositionYChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const y = parseInt(event.target.value);
    setPositionY(y);
    onPositionChange({ x: positionX, y });
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold text-white">Add Text</h1>
      {isVideoFile ? (
        <div className="p-6 rounded-lg shadow-lg w-80 space-y-6 bg-gray-800 text-white mt-10">
          <Button
            onClick={addText}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded"
          >
            Add Text
          </Button>
          {activeTextId && (
            <div className="space-y-4 flex flex-col items-center">
              {/* Font Size Controls */}
              <div>
                <label className="block text-sm mb-2">Font Size:</label>
                <div className="flex items-center space-x-2">
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
                    className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    -
                  </button>
                  <select
                    value={overlays.find((t) => t.id === activeTextId)?.size}
                    onChange={(e) =>
                      updateOverlay(activeTextId, {
                        size: Number(e.target.value),
                      })
                    }
                    className="px-3 py-1 bg-gray-700 text-white rounded"
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
                    className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Text Color Picker */}
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
          )}
          <input
            type="text"
            value={overlays.find((t) => t.id === activeTextId)?.content || ""}
            onChange={(e) =>
              activeTextId &&
              updateOverlay(activeTextId, { content: e.target.value })
            }
            className="mt-2 p-2 border rounded w-full"
            placeholder="Enter a text"
          />
          <div className="mt-2 flex space-x-4">
            <div>
              <label className="block text-sm">Position X:</label>
              <input
                type="number"
                value={overlays.find((t) => t.id === activeTextId)?.x || 0}
                onChange={(e) =>
                  activeTextId &&
                  updateOverlay(activeTextId, { x: Number(e.target.value) })
                }
                className="p-2 border rounded w-24"
              />
            </div>
            <div>
              <label className="block text-sm">Position Y:</label>
              <input
                type="number"
                value={overlays.find((t) => t.id === activeTextId)?.y || 0}
                onChange={(e) =>
                  activeTextId &&
                  updateOverlay(activeTextId, { y: Number(e.target.value) })
                }
                className="p-2 border rounded w-24"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-white mt-10">Upload media</p>
      )}
    </div>
  );
};

export default TextDrawer;
