import "./App.css";
import VideoEditor from "./components/VideoUploader";
import VideoProcessor from "./components/VideProcessor";

function App() {
  return (
    <div className="flex flex-col items-end">
      <VideoEditor />
      {/* <VideoProcessor /> */}
    </div>
  );
}

export default App;
