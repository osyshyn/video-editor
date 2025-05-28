import React, {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";

interface TrimContextType {
  videoRef: RefObject<HTMLVideoElement | null>;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  currentTime: number;
  endTime: number;
  setEndTime: React.Dispatch<React.SetStateAction<number>>;
  startTime: number;
  setStartTime: React.Dispatch<React.SetStateAction<number>>;
}

const TrimContext = createContext<TrimContextType | undefined>(undefined);

export const useTrimContext = () => {
  const context = useContext(TrimContext);
  if (!context) {
    throw new Error("useTrimContext must be used within a TrimProvider");
  }
  return context;
};

export const TrimProvider = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  return (
    <TrimContext.Provider
      value={{
        videoRef,
        setDuration,
        duration,
        setCurrentTime,
        currentTime,
        endTime,
        setEndTime,
        startTime,
        setStartTime,
      }}
    >
      {children}
    </TrimContext.Provider>
  );
};
