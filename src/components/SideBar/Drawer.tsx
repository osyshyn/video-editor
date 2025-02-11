import { FC } from "react";

interface DrawerProps {
  children: React.ReactNode;
}

export const Drawer: FC<DrawerProps> = ({ children }) => {
  return <div className="bg-gray-900 text-center h-full ">{children}</div>;
};
