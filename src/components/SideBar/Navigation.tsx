import { FC } from "react";
import {
  FaLayerGroup,
  FaTextHeight,
  FaVideo,
  FaImage,
  FaMusic,
  FaBorderAll,
} from "react-icons/fa";
import { MdPermMedia } from "react-icons/md";
import { BsPlugin, BsRecordCircle } from "react-icons/bs";
import { TbTransitionBottomFilled } from "react-icons/tb";
import { IoIosMore } from "react-icons/io";

const menuItems = [
  { icon: <MdPermMedia />, label: "Media" },
  { icon: <FaLayerGroup />, label: "Layers" },
  { icon: <FaTextHeight />, label: "Text" },
  { icon: <FaVideo />, label: "Videos" },
  { icon: <FaImage />, label: "Images" },
  { icon: <FaBorderAll />, label: "Elements" },
  { icon: <FaMusic />, label: "Audio" },
  { icon: <BsPlugin />, label: "Plugins" },
  { icon: <TbTransitionBottomFilled />, label: "Transitions" },
  { icon: <BsRecordCircle />, label: "Record" },
  { icon: <IoIosMore />, label: "More" },
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
            console.log("Selected item:", item.label); // Для проверки
            onSelect(item.label);
          }}
          // Здесь проверяем, что клики передаются
        >
          <div className="text-2xl">{item.icon}</div>
          <p className="text-xs mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
};
