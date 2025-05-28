import React, { createContext, ReactNode, useContext, useState } from "react";

interface TimeLineContextType {
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  timeHasSetted: number;
  setTimeHasSetted: React.Dispatch<React.SetStateAction<number>>;
}

const TimeLineContext = createContext<TimeLineContextType | undefined>(
  undefined
);

export const useTimeLineContext = () => {
  const context = useContext(TimeLineContext);
  if (!context) {
    throw new Error(
      "useTimeLineContext must be used within a TimeLineProvider"
    );
  }
  return context;
};

export const TimeLineProvider = ({ children }: { children: ReactNode }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [timeHasSetted, setTimeHasSetted] = useState(0);

  return (
    <TimeLineContext.Provider
      value={{ currentTime, setCurrentTime, timeHasSetted, setTimeHasSetted }}
    >
      {children}
    </TimeLineContext.Provider>
  );
};
