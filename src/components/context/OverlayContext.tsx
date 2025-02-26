import { generateThumbnail, getVideoDuration } from "@/lib/utils";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export interface OverlayItem {
  id: string;
  type: "image" | "text" | "video";
  file?: File;
  url?: string;
  content?: string;
  videoThumbnailUrl?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  size?: number;
  color?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

interface OverlayContextType {
  overlays: OverlayItem[];
  addImage: (file: File | null, url: string) => void;
  addText: () => void;
  addVideo: (file: Blob | MediaSource) => void;
  updateOverlay: (id: string, newData: Partial<OverlayItem>) => void;
  setOverlays: (newOverlays: OverlayItem[]) => void;
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
  activeImageId: string;
  setActiveImageId: (id: string) => void;
  isVideoFile: boolean;
  setIsVideoFile: (isVideoFile: boolean) => void;
  imageOverlayActive: boolean;
  setImageOverlayActive: Dispatch<SetStateAction<boolean>>;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
  const [imageOverlayActive, setImageOverlayActive] = useState<boolean>(false);
  const [activeImageId, setActiveImageId] = useState<string>("");

  const addImage = (file: File | null, url: string) => {
    const newImage: OverlayItem = {
      id: Date.now().toString(),
      type: "image",
      file: file as File,
      url,
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      startTime: 0,
      endTime: 10,
    };
    setOverlays((prev) => [...prev, newImage]);
  };

  const addVideo = async (file: Blob | MediaSource) => {
    const newVideo: OverlayItem = {
      id: Date.now().toString(),
      type: "video",
      url: URL.createObjectURL(file),
      file: file as File,
      duration: await getVideoDuration(file),
      videoThumbnailUrl: await generateThumbnail(file as File),
      startTime: 0,
    };

    setOverlays((prev) => [...prev, newVideo]);
  };

  const addText = () => {
    const newText: OverlayItem = {
      id: Date.now().toString(),
      type: "text",
      content: "",
      x: 50,
      y: 50,
      size: 24,
      color: "#ffffff",
      startTime: 0,
      endTime: 10,
    };
    setOverlays((prev) => [...prev, newText]);
    setActiveTextId(newText.id);
  };

  const updateOverlay = (id: string, newData: Partial<OverlayItem>) => {
    setOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newData } : item))
    );
  };

  return (
    <OverlayContext.Provider
      value={{
        addVideo,
        overlays,
        addImage,
        addText,
        updateOverlay,
        setOverlays,
        activeTextId,
        setActiveTextId,
        isVideoFile,
        setActiveImageId,
        activeImageId,
        setIsVideoFile,
        imageOverlayActive,
        setImageOverlayActive,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
};
