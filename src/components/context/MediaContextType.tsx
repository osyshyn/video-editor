import React, { createContext, useContext, useState, ReactNode } from "react";

interface MediaContextType {
  media: File[];
  setMedia: React.Dispatch<React.SetStateAction<File[]>>;
  mediaURLs: string[];
  setMediaURLs: React.Dispatch<React.SetStateAction<string[]>>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [media, setMedia] = useState<File[]>([]);
  const [mediaURLs, setMediaURLs] = useState<string[]>([]);

  return (
    <MediaContext.Provider
      value={{
        media,
        setMedia,
        mediaURLs,
        setMediaURLs,
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
