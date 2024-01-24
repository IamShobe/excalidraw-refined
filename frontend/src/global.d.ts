import {ExcalidrawImperativeAPI} from "@excalidraw/excalidraw/types/types";
import type App from "@excalidraw/excalidraw/types/components/App";


declare global {
    interface Window {
      api: ExcalidrawImperativeAPI;
      getState: () => InstanceType<typeof App>["state"];
      saveToDisk: () => void;
      loadFromDisk: () => void;
      saveToServer: (sceneName: string) => void;
    }
}
