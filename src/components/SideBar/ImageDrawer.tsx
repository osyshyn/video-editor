import { useEffect, useState } from "react";
import { useOverlay } from "../context/OverlayContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ImageDrawer() {
  const {
    overlays,
    addImage,
    imageOverlayActive,
    setImageOverlayActive,
    activeImageId,
    updateOverlay,
  } = useOverlay();

  const [folders, setFolders] = useState<
    { id: string; name: string; images?: { id: string; name: string }[] }[]
  >([]);
  const [openedFolderId, setOpenedFolderId] = useState<string | null>(null);

  const folderId = "10DaZkcJ_VJzt91H1hn8t61yRZ-c7tTnw";
  const apiKey = "AIzaSyARNfRynX04u-3pt1A_cI0Jbnr9cPsxlak";

  const fetchFolder = async (folderId: string) => {
    const fetchFiles = async (folderId: string) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}`
        );
        const data = await response.json();
        setFolders(
          data.files.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
            images: [],
          }))
        );
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    await fetchFiles(folderId);
  };

  const fetchImagesFromFolder = async (folderId: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}`
      );

      const data = await response.json();
      console.log(data);
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderId
            ? {
                ...folder,
                images: data.files.map((file: any) => file),
              }
            : folder
        )
      );
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchFolder(folderId);
  }, []);

  const handleAccordionToggle = (folderId: string) => {
    if (openedFolderId === folderId) {
      setOpenedFolderId(null);
    } else {
      setOpenedFolderId(folderId);
      fetchImagesFromFolder(folderId);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 rounded-xl text-white">
      <div className="mb-6">
        <label
          htmlFor="media-upload"
          className="cursor-pointer text-white bg-blue-600 hover:bg-blue-700 py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Upload Image
        </label>
        <input
          id="media-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              addImage(file, URL.createObjectURL(file));
              setImageOverlayActive(true);
            }
          }}
        />
      </div>

      {imageOverlayActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm">Width:</label>
            <input
              type="number"
              value={overlays.find((t) => t.id === activeImageId)?.width || 100}
              onChange={(e) =>
                updateOverlay(activeImageId, { width: Number(e.target.value) })
              }
              className="w-24 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Height:</label>
            <input
              type="number"
              value={
                overlays.find((t) => t.id === activeImageId)?.height || 100
              }
              onChange={(e) =>
                updateOverlay(activeImageId, { height: Number(e.target.value) })
              }
              className="w-24 p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {folders.length > 0 && (
        <Accordion type="single" collapsible>
          {folders.map((folder) => (
            <AccordionItem key={folder.id} value={folder.id}>
              <AccordionTrigger
                onClick={() => handleAccordionToggle(folder.id)}
              >
                {folder.name}
              </AccordionTrigger>
              <AccordionContent>
                {openedFolderId === folder.id && folder.images?.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {folder.images?.map((image, index) => (
                      <img
                        key={index}
                        src={`https://lh3.googleusercontent.com/d/${image.id}`}
                        alt={`Image ${index + 1}`}
                        className="w-full h-auto rounded-md"
                      />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
