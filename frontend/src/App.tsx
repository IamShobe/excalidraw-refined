import { useEffect, useMemo, useState } from "react";
import { ChakraProvider, Flex, Text, useToast } from "@chakra-ui/react";
import { Excalidraw, exportToBlob, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { AppState, BinaryFiles, CollaboratorPointer, ExcalidrawImperativeAPI, UserIdleState } from "@excalidraw/excalidraw/types/types";

import "./App.css";
import { useDisclosure } from "@chakra-ui/hooks";
import BrowseScenesModal from "./BrowseScenesModal.tsx";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { toBase64 } from "./utils/strings.ts";
import {
  useDeleteSceneMutation,
  useSaveSceneFileToServerMutation,
  useSaveSceneToServerMutation,
  useScene,
  useSceneFiles, useUpdateSceneMutation,
} from "./api-hooks.ts";
import { BrowserRouter, createSearchParams, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import SaveAsSceneModal from "./SaveAsSceneModal.tsx";
import { MdOutlineSave, MdOutlineSaveAs } from "react-icons/md";
import { CgBrowse } from "react-icons/cg";
import { BiReset } from "react-icons/bi";
import { useHash } from "react-use";


const queryClient = new QueryClient();

function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  // const [isCollaborating, setIsCollaborating] = useState(false);

  const browseScenesDisclosure = useDisclosure();
  const saveSceneDisclosure = useDisclosure();

  const saveSceneToServerMutation = useSaveSceneToServerMutation();
  const saveSceneFileToServerMutation = useSaveSceneFileToServerMutation();
  const deleteSceneMutation = useDeleteSceneMutation();
  const updateSceneMutation = useUpdateSceneMutation();

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [hash, setHash] = useHash();

  const sceneQuery = useScene(id);
  const fileIds = useMemo(() => sceneQuery.data?.files_ids ?? [], [sceneQuery.data]);
  const sceneFilesQueries = useSceneFiles(fileIds);

  const isDraft = useMemo(() => {
    const search = createSearchParams(location.search);
    return search.get("isDraft") === "true";
  }, [location.search]);

  const removeHashPart = (hashKey: string) => {
    const hashParts = hash.substring(1).split("&").filter((part) => {
      const [key] = part.split("=");
      return key !== hashKey;
    });
    return "#" + hashParts.join("&");
  }

  const [blobs, setBlobs] = useState<Record<string, Blob>>({});

  useEffect(() => {
    // process the hash
    // strip leading #
    const hashParts = hash.substring(1).split("&");
    for (const hashPart of hashParts) {
      const [key, value] = hashPart.split("=");
      if (key === "addLibrary") {
        const library = decodeURIComponent(value);
        console.log("Adding library", library);
        // download the library
        fetch(library)
          .then((response) => response.blob())
          .then((libraryItems) => {
            // TODO: store it in indexedDB..
            setBlobs((blobs) => ({
              ...blobs,
              [library]: libraryItems,
            }));
          });
        // remove the hash part
        setHash(removeHashPart("addLibrary"));
      }
    }
  }, [hash]);

  useEffect(() => {
    // on api load
    if (!excalidrawAPI) {
      return;
    }

    for (const [_, blob] of Object.entries(blobs)) {
      console.log(excalidrawAPI, blob);
      excalidrawAPI.updateLibrary({
        merge: true,
        libraryItems: blob,
        openLibraryMenu: true,
      });
    }

  }, [excalidrawAPI, blobs]);

  const toast = useToast();

  const [serverLoadedElements, setServerLoadedElements] = useState<readonly ExcalidrawElement[]>([]);

  useEffect(() => {
    if (!excalidrawAPI || sceneQuery.isLoading || !sceneQuery.isSuccess) {
      return;
    }

    console.log("Loading scene from server");

    const sceneData = JSON.parse(sceneQuery.data.data);

    setServerLoadedElements(
      sceneData.elements.map((element: ExcalidrawElement) => ({
        ...element,
        version: 0,
      })),
    );

    excalidrawAPI.resetScene();
    excalidrawAPI.addFiles(sceneFilesQueries.data);
    excalidrawAPI.updateScene(sceneData);
  }, [sceneQuery.data, sceneFilesQueries.pending]);

  // const [state, setState] = useState("");
  // const saveToDisk = () => {
  //   const appState = excalidrawAPI.getAppState();
  //   const elements = excalidrawAPI.getSceneElements();
  //   const files = excalidrawAPI.getFiles();
  //   const serialized = JSON.stringify({elements, collaborators: []});
  //   setState(serialized);
  //   console.log(serialized);
  // };
  //
  // const loadFromDisk = () => {
  //   const data = JSON.parse(state);
  //   excalidrawAPI.updateScene(data);
  // };

  // useEffect(() => {
  //   window.getState = () => {
  //     return excalidrawAPI.getAppState();
  //   };
  //   window.api = excalidrawAPI;
  //
  //   window.saveToDisk = saveToDisk;
  //   window.loadFromDisk = loadFromDisk;
  // }, [excalidrawAPI, saveToDisk, loadFromDisk]);

  // window.api = excalidrawAPI;

  const exportToImageBase64 = async ({ elements, appState, files }: {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
    files: BinaryFiles;
  }) => {
    const blob = await exportToBlob({
      elements,
      appState,
      files,
      mimeType: "image/png",
    });

    return await toBase64(blob);
  };

  const updateScene = async () => {
    if (excalidrawAPI === undefined) {
      throw new Error("Excalidraw API is not set");
    }

    if (id === undefined) {
      saveSceneDisclosure.onOpen();
      return; // if we don't have an id, we can't update the scene - so we open the save as modal
    }


    const elements = excalidrawAPI.getSceneElements();
    const files = excalidrawAPI.getFiles();
    const appState = excalidrawAPI.getAppState();


    const updatedScene = await updateSceneMutation.mutateAsync({
      sceneId: id,
      name: sceneQuery.data?.name ?? "",
      description: sceneQuery.data?.description ?? "",
      picture: await exportToImageBase64({ elements, appState, files }),
      data: JSON.stringify({ elements, collaborators: [] }),
    });

    if (updatedScene.error) {
      console.error(updatedScene.error);
      return;
    }

    // if this part fails - we lose the files
    const promises = Object.entries(files).map(([key, value]) => {
      return saveSceneFileToServerMutation.mutateAsync({
        revisionId: updatedScene.data.revision_id,
        params: {
          name: key,
          data: JSON.stringify(value),
        },
      });
    });

    await Promise.all(promises);
    toast({
      title: "Scene updated",
      description: "Scene updated successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    await queryClient.resetQueries({ queryKey: ["scene", id], exact: true }); // force reload
  }

  // TODO: implement collaboration
  // const addCollaborators = async () => {
  //   if (excalidrawAPI === undefined) {
  //     throw new Error("Excalidraw API is not set");
  //   }

  //   const state = excalidrawAPI.getAppState();
  //   const stateCopy: AppState = JSON.parse(JSON.stringify(state));
  //   // make sure collaborators is a map
  //   if (!stateCopy.collaborators) {
  //     stateCopy.collaborators = new Map();
  //   } else if (!(stateCopy.collaborators instanceof Map)) {
  //     stateCopy.collaborators = new Map(Object.entries(stateCopy.collaborators));
  //   }

  //   const collaboratorPointer: CollaboratorPointer = {
  //     x: 0,
  //     y: 0,
  //     tool: "pointer",
  //   };

  //   stateCopy.collaborators.set("some-id", {
  //     // pointer?: CollaboratorPointer;
  //     // button?: "up" | "down";
  //     // selectedElementIds?: AppState["selectedElementIds"];
  //     // username?: string | null;
  //     // userState?: UserIdleState;
  //     // color?: {
  //     //     background: string;
  //     //     stroke: string;
  //     // };
  //     // avatarUrl?: string;
  //     // id?: string;
  //     id: "some-id",
  //     username: "John Doe",
  //     color: {
  //       background: "#ff0",
  //       stroke: "#f00",
  //     },
  //     userState: "active" as UserIdleState,
  //     selectedElementIds: {},
  //     button: "up",
  //     pointer: collaboratorPointer,
  //   });

  //   excalidrawAPI.updateScene({
  //     elements: excalidrawAPI.getSceneElements(),
  //     appState: stateCopy,
  //   });

  //   return collaboratorPointer;
  // }

  // window.addCollaborators = addCollaborators;

  const saveToServer = async (sceneName: string, description: string = "") => {
    if (excalidrawAPI === undefined) {
      throw new Error("Excalidraw API is not set");
    }

    const elements = excalidrawAPI.getSceneElements();
    const files = excalidrawAPI.getFiles();
    const appState = excalidrawAPI.getAppState();

    const savedScene = await saveSceneToServerMutation.mutateAsync({
      name: sceneName,
      description,
      picture: await exportToImageBase64({ elements, appState, files }),
      data: JSON.stringify({ elements, collaborators: [] }),
    });

    if (savedScene.error) {
      console.error(savedScene.error);
      return;
    }

    // if this part fails - we lose the files
    const promises = Object.entries(files).map(([key, value]) => {
      return saveSceneFileToServerMutation.mutateAsync({
        revisionId: savedScene.data.revision_id,
        params: {
          name: key,
          data: JSON.stringify(value),
        },
      });
    });

    await Promise.all(promises);

    loadFromServer(savedScene.data.id);
  };

  const loadFromServer = (sceneId: string) => {
    navigate(`/scenes/${sceneId}`);
  };

  const deleteFromServer = async (sceneId: string) => {
    await deleteSceneMutation.mutateAsync(sceneId);
  }

  window.saveToServer = saveToServer;

  const isChanged = (prevElements: readonly ExcalidrawElement[], currentElements: readonly ExcalidrawElement[]) => {
    if (prevElements.length !== currentElements.length) {
      return true;
    }

    const prevById = new Map(prevElements.map((element) => [element.id, element]));
    for (const currentElement of currentElements) {
      const prevElement = prevById.get(currentElement.id);
      if (!prevElement || (prevElement.updated !== currentElement.updated)) {
        return true;
      }
    }

    return false;
  };

  return (
    <>
      <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={(elements) => {
          const changed = isChanged(serverLoadedElements, elements);
          if (changed && !isDraft) {
            const search = createSearchParams(location.search);
            search.set("isDraft", "true");

            navigate({
              search: search.toString(),
            });
          } else if (!changed && isDraft) {
            const search = createSearchParams(location.search);
            search.delete("isDraft");

            navigate({
              search: search.toString(),
            });
          }

          // navigate({
          //   search: search.toString(),
          // })
        }}
      // renderTopRightUI={() => (
      //   <LiveCollaborationTrigger
      //     isCollaborating={isCollaborating}
      //     onSelect={() => {
      //       window.alert("You clicked on collab button");
      //       setIsCollaborating(!isCollaborating);
      //     }}
      //   />
      // )}
      >
        <MainMenu>
          <MainMenu.Item onSelect={browseScenesDisclosure.onOpen} icon={<CgBrowse />}>
            Browse...
          </MainMenu.Item>
          <MainMenu.Item onSelect={updateScene} icon={<MdOutlineSave />}>
            Save
          </MainMenu.Item>
          <MainMenu.Item onSelect={saveSceneDisclosure.onOpen} icon={<MdOutlineSaveAs />}>
            {/*<Button onClick={onOpen}>Open Modal</Button>*/}
            Save as new scene...
          </MainMenu.Item>
          <MainMenu.Item onSelect={() => {
            excalidrawAPI?.resetScene();
            navigate("/")
          }} icon={<BiReset />}>
            Reset scene
          </MainMenu.Item>
          <MainMenu.Separator />
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.Help />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo />
            <WelcomeScreen.Center.Heading>
              Welcome to Excalidraw refined!
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemLoadScene />
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>
      {
        <>
          {/* TODO: implement more actions... */}
          {/*<Flex position="fixed" bottom="4em" left="1em" zIndex={2} alignItems="center" gap={2}>*/}
          {/*  <IconButton size={"sm"} aria-label="menu" icon={<PlusSquareIcon/>}/>*/}
          {/*</Flex>*/}
          <Flex position="fixed" bottom="4em" left="1em" zIndex={2} pointerEvents="none" alignItems="center" gap={2}>
            <Text>
              {sceneQuery.data?.name}
            </Text>
          </Flex>
        </>
      }
      <BrowseScenesModal isOpen={browseScenesDisclosure.isOpen} onClose={browseScenesDisclosure.onClose}
        deleteScene={deleteFromServer}
        loadScene={loadFromServer} />
      <SaveAsSceneModal isOpen={saveSceneDisclosure.isOpen}
        initialSceneName={sceneQuery.data?.name ?? ""}
        initialSceneDescription={sceneQuery.data?.description ?? ""}
        onClose={saveSceneDisclosure.onClose}
        onSaveAsScene={async (params) => {
          await saveToServer(params.sceneName, params.description);
        }} />
    </>
  );
}

const ProvidedApp = () => (
  <ChakraProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/scenes/:id" element={<App />} />
          <Route path={"*"} element={<App />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </ChakraProvider>
);

export default ProvidedApp;
