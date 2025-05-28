import { Scissors } from "lucide-react";
import { FC } from "react";
import { FaTextHeight, FaImage, FaMusic } from "react-icons/fa";
import { MdGif, MdPermMedia } from "react-icons/md";
const menuItems = [
  { icon: <MdPermMedia />, label: "Media" },
  { icon: <FaTextHeight />, label: "Text" },
  { icon: <FaImage />, label: "Images" },
  { icon: <MdGif />, label: "GIF" },
  { icon: <FaMusic />, label: "Audio" },
];

interface NavigationProps {
  onSelect: (label: string) => void;
}

export const Navigation: FC<NavigationProps> = ({ onSelect }) => {
  return (
    <div className="w-20 h-full bg-gray-800 p-4 gap-5 shadow-lg flex flex-col items-center space-y-4 z-50">
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          onClick={() => {
            console.log("Selected item:", item.label);
            onSelect(item.label);
          }}
        >
          <div className="text-2xl">{item.icon}</div>
          <p className="text-xs mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
};
