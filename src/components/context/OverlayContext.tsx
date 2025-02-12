import { createContext, useContext, useState, ReactNode } from "react";

export interface OverlayItem {
  id: string;
  type: "image" | "text";
  file?: File | null;
  url?: string;
  content?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  size?: number;
  color?: string;
  startTime: number;
  endTime: number;
}

interface OverlayContextType {
  overlays: OverlayItem[];
  addImage: (file: File | null, url: string) => void;
  addText: () => void;
  updateOverlay: (id: string, newData: Partial<OverlayItem>) => void;
  setOverlays: (newOverlays: OverlayItem[]) => void;
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
  isVideoFile: boolean;
  setIsVideoFile: (isVideoFile: boolean) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);

  const addImage = (file: File | null, url: string) => {
    const newImage: OverlayItem = {
      id: Date.now().toString(),
      type: "image",
      file,
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
        overlays,
        addImage,
        addText,
        updateOverlay,
        setOverlays,
        activeTextId,
        setActiveTextId,
        isVideoFile,
        setIsVideoFile,
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
