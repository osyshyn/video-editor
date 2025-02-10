import { useState } from "react";
import "./App.css";
import SidebarLayout from "./components/layout/SidebarLayout";
import { Navigation } from "./components/SideBar/Navigation";
import VideoEditor from "./components/VideoUploader";
import { Drawer } from "./components/SideBar/Drawer";
import { Media } from "./components/SideBar/Media";
import { TextDrawer } from "./components/SideBar/Text";

function App() {
  const [selectedItem, setSelectedItem] = useState<string>("Media");

  console.log("selectedItem", selectedItem);

  const renderDrawerContent = () => {
    switch (selectedItem) {
      case "Media":
        return <Media />;
      case "Layers":
        return <Media />;
      case "Text":
        return <TextDrawer />;
      case "Videos":
        return <Media />;
      case "Images":
        return <Media />;
      default:
        return <Media />;
    }
  };

  return (
    <SidebarLayout
      slots={{
        navigation: (
          <div className="bg-gray-100 text-center h-full">
            <Navigation onSelect={setSelectedItem} />
          </div>
        ),
        assetsDrawer: <Drawer>{renderDrawerContent()}</Drawer>,
        rightSidebar: (
          <div className="bg-gray-200 text-center h-full">Right Sidebar</div>
        ),
        topBar: <div className="bg-gray-100 text-center">Top Bar</div>,
        bottomBar: <div className="bg-gray-100 text-center">Bottom Bar</div>,
      }}
    >
      <VideoEditor />
    </SidebarLayout>
  );
}

export default App;
