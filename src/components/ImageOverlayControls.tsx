import React from "react";

interface IImageOverlayControlsProps {
  imageFile: File | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageX: number;
  imageY: number;
  setImageX: (x: number) => void;
  setImageY: (y: number) => void;
}

const ImageOverlayControls: React.FC<IImageOverlayControlsProps> = ({
  imageFile,
  handleImageChange,
  imageX,
  imageY,
  setImageX,
  setImageY,
}) => {
  return (
    <div className="mt-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-2"
      />
      {imageFile && <p>Selected Image: {imageFile.name}</p>}
      <div className="flex space-x-4">
        <div>
          <label className="block text-sm">Position X:</label>
          <input
            type="number"
            value={imageX}
            onChange={(e) => setImageX(Number(e.target.value))}
            className="p-2 border rounded w-24"
          />
        </div>
        <div>
          <label className="block text-sm">Position Y:</label>
          <input
            type="number"
            value={imageY}
            onChange={(e) => setImageY(Number(e.target.value))}
            className="p-2 border rounded w-24"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageOverlayControls;
