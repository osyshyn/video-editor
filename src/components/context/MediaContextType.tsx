import React, { createContext, useContext, useState, ReactNode } from "react";

interface MediaContextType {
  mediaFiles: string[];
  selectedMedia: string[];
  addMedia: (media: string[]) => void;
  selectMedia: (media: string) => void;
  deselectMedia: (media: string) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

  const addMedia = (media: string[]) => {
    setMediaFiles((prev) => [...prev, ...media]);
  };

  const selectMedia = (media: string) => {
    setSelectedMedia((prev) => [...prev, media]);
  };

  const deselectMedia = (media: string) => {
    setSelectedMedia((prev) => prev.filter((item) => item !== media));
  };

  return (
    <MediaContext.Provider
      value={{
        mediaFiles,
        selectedMedia,
        addMedia,
        selectMedia,
        deselectMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};
