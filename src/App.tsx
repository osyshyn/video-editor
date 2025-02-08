import "./App.css";
import SidebarLayout from "./components/layout/SidebarLayout";
import VideoEditor from "./components/VideoUploader";

function App() {
  return (
    <SidebarLayout
      slots={{
        navigation: (
          <div className="bg-gray-100 text-center h-full">Navigation</div>
        ),
        assetsDrawer: (
          <div className="bg-gray-200 text-center h-full">Assets Drawer</div>
        ),
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
