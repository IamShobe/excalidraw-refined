import {useEffect, useMemo, useState} from "react";
import {ChakraProvider, Flex, Text, useToast} from "@chakra-ui/react";
import {Excalidraw, exportToBlob, MainMenu, WelcomeScreen} from "@excalidraw/excalidraw";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

import {AppState, BinaryFiles, ExcalidrawImperativeAPI} from "@excalidraw/excalidraw/types/types";

import "./App.css";
import {useDisclosure} from "@chakra-ui/hooks";
import BrowseScenesModal from "./BrowseScenesModal.tsx";
import {ExcalidrawElement} from "@excalidraw/excalidraw/types/element/types";
import {toBase64} from "./utils/strings.ts";
import {
  useDeleteSceneMutation,
  useSaveSceneFileToServerMutation,
  useSaveSceneToServerMutation,
  useScene,
  useSceneFiles, useUpdateSceneMutation,
} from "./api-hooks.ts";
import {BrowserRouter, createSearchParams, Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";
import SaveAsSceneModal from "./SaveAsSceneModal.tsx";
import {MdOutlineSave, MdOutlineSaveAs} from "react-icons/md";
import {CgBrowse} from "react-icons/cg";
import { BiReset } from "react-icons/bi";


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
  const {id} = useParams();
  const location = useLocation();

  const sceneQuery = useScene(id);
  const fileIds = useMemo(() => sceneQuery.data?.files_ids ?? [], [sceneQuery.data]);
  const sceneFilesQueries = useSceneFiles(fileIds);

  const isDraft = useMemo(() => {
    const search = createSearchParams(location.search);
    return search.get("isDraft") === "true";
  }, [location.search]);

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

  const exportToImageBase64 = async ({elements, appState, files}: {
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
      picture: await exportToImageBase64({elements, appState, files}),
      data: JSON.stringify({elements, collaborators: []}),
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
    await queryClient.resetQueries({queryKey: ["scene", id], exact: true}); // force reload
  }

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
      picture: await exportToImageBase64({elements, appState, files}),
      data: JSON.stringify({elements, collaborators: []}),
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
          <MainMenu.Item onSelect={browseScenesDisclosure.onOpen} icon={<CgBrowse/>}>
            Browse...
          </MainMenu.Item>
          <MainMenu.Item onSelect={updateScene} icon={<MdOutlineSave/>}>
            Save
          </MainMenu.Item>
          <MainMenu.Item onSelect={saveSceneDisclosure.onOpen} icon={<MdOutlineSaveAs/>}>
            {/*<Button onClick={onOpen}>Open Modal</Button>*/}
            Save as new scene...
          </MainMenu.Item>
          <MainMenu.Item onSelect={() => {
            excalidrawAPI?.resetScene();
            navigate("/")
          }} icon={<BiReset/>}>
            Reset scene
          </MainMenu.Item>
          <MainMenu.Separator/>
          <MainMenu.DefaultItems.LoadScene/>
          <MainMenu.DefaultItems.Export/>
          <MainMenu.DefaultItems.SaveAsImage/>
          <MainMenu.DefaultItems.Help/>
          <MainMenu.DefaultItems.ToggleTheme/>
          <MainMenu.DefaultItems.ChangeCanvasBackground/>
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo/>
            <WelcomeScreen.Center.Heading>
              Welcome to Excalidraw refined!
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemLoadScene/>
              <WelcomeScreen.Center.MenuItemHelp/>
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
                         loadScene={loadFromServer}/>
      <SaveAsSceneModal isOpen={saveSceneDisclosure.isOpen}
                        initialSceneName={sceneQuery.data?.name ?? ""}
                        initialSceneDescription={sceneQuery.data?.description ?? ""}
                        onClose={saveSceneDisclosure.onClose}
                        onSaveAsScene={async (params) => {
                          await saveToServer(params.sceneName, params.description);
                        }}/>
    </>
  );
}

const ProvidedApp = () => (
  <ChakraProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/scenes/:id" element={<App/>}/>
          <Route path={"*"} element={<App/>}/>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </ChakraProvider>
);

export default ProvidedApp;
