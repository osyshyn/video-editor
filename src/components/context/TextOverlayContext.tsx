import { createContext, useState, useContext, ReactNode } from "react";

export interface TextOverlay {
  id: string;
  content: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface TextOverlayContextType {
  texts: TextOverlay[];
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
  addText: () => void;
  updateText: (id: string, newData: Partial<TextOverlay>) => void;
  isVideoFile: boolean;
  setIsVideoFile: (isVideoFile: boolean) => void;
}

const TextOverlayContext = createContext<TextOverlayContextType | undefined>(
  undefined
);

export const TextOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);

  const addText = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      content: "",
      x: 50,
      y: 50,
      size: 24,
      color: "#ffffff",
    };
    setTexts((prev) => [...prev, newText]);
    setActiveTextId(newText.id);
  };

  const updateText = (id: string, newData: Partial<TextOverlay>) => {
    setTexts((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...newData } : text))
    );
  };

  return (
    <TextOverlayContext.Provider
      value={{
        texts,
        activeTextId,
        setActiveTextId,
        addText,
        updateText,
        isVideoFile,
        setIsVideoFile,
      }}
    >
      {children}
    </TextOverlayContext.Provider>
  );
};

export const useTextOverlay = () => {
  const context = useContext(TextOverlayContext);
  if (!context)
    throw new Error("useTextOverlay must be used within a TextOverlayProvider");
  return context;
};
