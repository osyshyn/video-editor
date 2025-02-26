import { useState } from "react";
import "./App.css";
import SidebarLayout from "./components/layout/SidebarLayout";
import { Navigation } from "./components/SideBar/Navigation";
import VideoEditor from "./components/VideoUploader";
import { Drawer } from "./components/SideBar/Drawer";
import { Media } from "./components/SideBar/Media";
import TextDrawer from "./components/SideBar/Text";
import { MediaProvider } from "./components/context/MediaContextType";
import { ImageOverlayProvider } from "./components/context/ImageContext";
import ImageDrawer from "./components/SideBar/ImageDrawer";
import { OverlayProvider } from "./components/context/OverlayContext";

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
        return <ImageDrawer />;
      case "GIF":
        return <ImageDrawer />;
      default:
        return <Media />;
    }
  };

  return (
    <OverlayProvider>
      <MediaProvider>
        <ImageOverlayProvider>
          <SidebarLayout
            slots={{
              navigation: (
                <div className="bg-gray-100 text-center h-full">
                  <Navigation onSelect={setSelectedItem} />
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
            <VideoEditor selectedItem={selectedItem} />
          </SidebarLayout>
        </ImageOverlayProvider>
      </MediaProvider>
    </OverlayProvider>
  );
}

export default App;
