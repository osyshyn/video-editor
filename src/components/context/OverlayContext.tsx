import {
  generateThumbnail,
  getAudioDuration,
  getVideoDuration,
} from "@/lib/utils";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export interface OverlayItemIndex extends OverlayItem {
  index: number;
}

export interface OverlayItem {
  id: string;
  type: "image" | "text" | "video" | "audio" | "gif";
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
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface OverlayContextType {
  videoOverlays: OverlayItem[];
  overlays: OverlayItem[];
  addImage: (file: File | null, url: string) => void;
  addText: () => void;
  addVideo: (file: Blob | MediaSource) => void;
  addAudio: (file: File, url: string) => void;
  addGif: (file: File | null, url: string) => void;
  updateOverlay: (id: string, newData: Partial<OverlayItem>) => void;
  setOverlays: (newOverlays: OverlayItem[]) => void;
  setVideoOverlays: (newOverlays: OverlayItem[]) => void;
  activeTextId: string | null;
  setActiveTextId: (id: string | null) => void;
  activeImageId: string;
  setActiveImageId: (id: string) => void;
  activeAudioId: string | null;
  setActiveAudioId: (id: string | null) => void;
  activeGifId: string;
  setActiveGifId: (id: string) => void;
  isVideoFile: boolean;
  setIsVideoFile: (isVideoFile: boolean) => void;
  imageOverlayActive: boolean;
  setImageOverlayActive: Dispatch<SetStateAction<boolean>>;
  gifOverlayActive: boolean;
  setGifOverlayActive: Dispatch<SetStateAction<boolean>>;
  audioOverlayActive: boolean;
  setAudioOverlayActive: Dispatch<SetStateAction<boolean>>;
  selectedOverlayId: string | null;
  setSelectedOverlayId: Dispatch<SetStateAction<string | null>>;
  deleteOverlay: () => void;
  copyOverlay: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [videoOverlays, setVideoOverlays] = useState<OverlayItem[]>([]);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
  const [imageOverlayActive, setImageOverlayActive] = useState<boolean>(false);
  const [audioOverlayActive, setAudioOverlayActive] = useState<boolean>(false);
  const [gifOverlayActive, setGifOverlayActive] = useState<boolean>(false);
  const [activeGifId, setActiveGifId] = useState<string>("");
  const [activeImageId, setActiveImageId] = useState<string>("");
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const copyOverlay = () => {
    const copiedOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );
    if (copiedOverlay?.type === "video") {
      setVideoOverlays((prev) => {
        const copiedOverlay = prev?.find(
          (overlay) => overlay.id === selectedOverlayId
        );
        if (!copiedOverlay) return prev;
        const newOverlay = { ...copiedOverlay, id: Date.now().toString() };
        return [...prev, newOverlay];
      });
      return 0;
    }
    setOverlays((prev) => {
      const copiedOverlay = prev.find(
        (overlay) => overlay.id === selectedOverlayId
      );
      if (!copiedOverlay) return prev;
      const newOverlay = { ...copiedOverlay, id: Date.now().toString() };
      return [...prev, newOverlay];
    });
  };

  const deleteOverlay = () => {
    const copiedOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );

    if (copiedOverlay?.type === "video") {
      setVideoOverlays((prev) =>
        prev?.filter((overlay) => overlay.id !== selectedOverlayId)
      );
      return 0;
    }
    setOverlays((prev) =>
      prev.filter((overlay) => overlay.id !== selectedOverlayId)
    );
  };

  const addAudio = async (file: File, url: string) => {
    const newAudio: OverlayItem = {
      id: Date.now().toString(),
      type: "audio",
      file,
      url,
      startTime: 0,
      duration: await getAudioDuration(file),
      endTime: await getAudioDuration(file),
    };
    setOverlays((prev) => [...prev, newAudio]);
    setActiveAudioId(newAudio.id);
  };

  const addGif = (file: File | null, url: string) => {
    const newImage: OverlayItem = {
      id: Date.now().toString(),
      type: "gif",
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

    setVideoOverlays((prev) => [...prev, newVideo]);
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
    const copiedOverlay = overlays.find(
      (overlay) => overlay.id === selectedOverlayId
    );

    if (copiedOverlay?.type === "video") {
      setVideoOverlays((prev) =>
        prev?.map((item) => (item.id === id ? { ...item, ...newData } : item))
      );
      return 0;
    }
    setOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newData } : item))
    );
  };

  return (
    <OverlayContext.Provider
      value={{
        videoOverlays,
        overlays,
        addImage,
        addText,
        addVideo,
        addAudio,
        addGif,
        updateOverlay,
        setVideoOverlays,
        setOverlays,
        activeTextId,
        setActiveTextId,
        isVideoFile,
        setIsVideoFile,
        activeImageId,
        setActiveImageId,
        activeAudioId,
        setActiveAudioId,
        activeGifId,
        setActiveGifId,
        imageOverlayActive,
        setImageOverlayActive,
        gifOverlayActive,
        setGifOverlayActive,
        audioOverlayActive,
        setAudioOverlayActive,
        selectedOverlayId,
        setSelectedOverlayId,
        deleteOverlay,
        copyOverlay,
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
