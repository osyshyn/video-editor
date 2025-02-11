import React, { createContext, useContext, useState, ReactNode } from "react";

interface ImageOverlayContextType {
  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  imageURL: string;
  setImageURL: React.Dispatch<React.SetStateAction<string>>;
  imageX: number;
  setImageX: React.Dispatch<React.SetStateAction<number>>;
  imageY: number;
  setImageY: React.Dispatch<React.SetStateAction<number>>;
  imageWidth: number;
  setImageWidth: React.Dispatch<React.SetStateAction<number>>;
  imageHeight: number;
  setImageHeight: React.Dispatch<React.SetStateAction<number>>;
  imageOverlayActive: boolean;
  setImageOverlayActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageOverlayContext = createContext<ImageOverlayContextType | undefined>(
  undefined
);

export const useImageOverlay = () => {
  const context = useContext(ImageOverlayContext);
  if (!context) {
    throw new Error(
      "useImageOverlay must be used within an ImageOverlayProvider"
    );
  }
  return context;
};

interface ImageOverlayProviderProps {
  children: ReactNode;
}

export const ImageOverlayProvider: React.FC<ImageOverlayProviderProps> = ({
  children,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string>("");
  const [imageX, setImageX] = useState(10);
  const [imageY, setImageY] = useState(10);
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);
  const [imageOverlayActive, setImageOverlayActive] = useState(false);

  return (
    <ImageOverlayContext.Provider
      value={{
        imageFile,
        setImageFile,
        imageURL,
        setImageURL,
        imageX,
        setImageX,
        imageY,
        setImageY,
        imageWidth,
        setImageWidth,
        imageHeight,
        setImageHeight,
        imageOverlayActive,
        setImageOverlayActive,
      }}
    >
      {children}
    </ImageOverlayContext.Provider>
  );
};
