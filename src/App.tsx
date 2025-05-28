import { useState } from "react";
import "./App.css";
import SidebarLayout from "./components/layout/SidebarLayout";
import { Navigation } from "./components/SideBar/Navigation";
import VideoEditor from "./components/VideoUploader";
import { Drawer } from "./components/SideBar/Drawer";
import { Media } from "./components/SideBar/Media";
import TextDrawer from "./components/SideBar/Text";
import { MediaProvider } from "./components/context/MediaContextType";
import ImageDrawer from "./components/SideBar/ImageDrawer";
import { OverlayProvider } from "./components/context/OverlayContext";
import AudioDrawer from "./components/SideBar/Audio";
import GifDrawer from "./components/SideBar/Gif";

function App() {
  const [selectedItem, setSelectedItem] = useState<string>("Media");

  console.log("selectedItem", selectedItem);

  const renderDrawerContent = () => {
    switch (selectedItem) {
      case "Media":
        return <Media />;
      case "Audio":
        return <AudioDrawer />;
      case "Text":
        return <TextDrawer />;
      case "Videos":
        return <Media />;
      case "Images":
        return <ImageDrawer />;
      case "Trim":
        return <Media />;
      case "GIF":
        return <GifDrawer />;
      default:
        return <Media />;
    }
  };

  return (
    <OverlayProvider>
      <MediaProvider>
        <SidebarLayout
          slots={{
            navigation: (
              <div className="bg-gray-100 text-center h-full">
                <Navigation
                  onSelect={setSelectedItem}
                  setSelectedItem={setSelectedItem}
                />
              </div>
            ),
            assetsDrawer: <Drawer>{renderDrawerContent()}</Drawer>,
            rightSidebar: (
              <div className="bg-gray-200 text-center h-full">
                Right Sidebar
              </div>
            ),
            topBar: <div className="bg-gray-100 text-center">Top Bar</div>,
            bottomBar: (
              <div className="bg-gray-100 text-center">Bottom Bar</div>
            ),
          }}
        >
          <VideoEditor
            setSelectedItem={setSelectedItem}
            selectedItem={selectedItem}
          />
        </SidebarLayout>
      </MediaProvider>
    </OverlayProvider>
  );
}

export default App;
