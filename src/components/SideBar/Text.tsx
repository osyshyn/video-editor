import React, { FC, useState } from "react";

interface TextDrawerProps {
  onTextChange: (text: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const TextDrawer: FC<TextDrawerProps> = ({
  onTextChange,
  onPositionChange,
}) => {
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
    <div className=" p-6 rounded-lg shadow-lg w-72 space-y-4">
      <h2 className="text-2xl text-white font-semibold">Text Drawer</h2>
      <div>
        <label htmlFor="text" className="text-white text-sm">
          Text:
        </label>
        <input
          type="text"
          id="text"
          value={text}
          onChange={handleTextChange}
          className="mt-2 w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter text"
        />
      </div>
      <div>
        <label htmlFor="positionX" className="text-white text-sm">
          Position X:
        </label>
        <input
          type="number"
          id="positionX"
          value={positionX}
          onChange={handlePositionXChange}
          className="mt-2 w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="positionY" className="text-white text-sm">
          Position Y:
        </label>
        <input
          type="number"
          id="positionY"
          value={positionY}
          onChange={handlePositionYChange}
          className="mt-2 w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default TextDrawer;
