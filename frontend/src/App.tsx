import { Center, ChakraProvider, CircularProgress, Flex, Text, useToast } from "@chakra-ui/react";
import { Excalidraw, exportToBlob, MainMenu, restore, WelcomeScreen } from "@excalidraw/excalidraw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState } from "react";

import type { AppState, BinaryFileData, BinaryFiles, Collaborator, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

import { useDisclosure } from "@chakra-ui/hooks";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import axios from "axios";
import { BiReset } from "react-icons/bi";
import { CgBrowse } from "react-icons/cg";
import { MdOutlineSave, MdOutlineSaveAs } from "react-icons/md";
import { Await, createBrowserRouter, createRoutesFromElements, createSearchParams, defer, IndexRouteObject, LoaderFunctionArgs, Outlet, redirect, Route, RouterProvider, useAsyncValue, useLoaderData, useLocation, useNavigate, useNavigation, useParams, useRouteLoaderData, useSearchParams } from "react-router-dom";
import { useHash } from "react-use";
import { apiManager, ErrorCode, useDeleteSceneMutation, useSaveSceneFileToServerMutation, useSaveSceneToServerMutation, useScene, useSceneFiles, useUpdateSceneMutation } from "./api-hooks.ts";
import { AXIOS_INSTANCE } from "./api/axios.ts";
import "./App.css";
import BrowseScenesModal from "./BrowseScenesModal.tsx";
import { getUsersCurrentUserApiV1UsersMeGetQueryOptions, usersCurrentUserApiV1UsersMeGet, useUsersCurrentUserApiV1UsersMeGet } from "./gen/api/users/users.ts";
import Login from "./Login.tsx";
import SaveAsSceneModal from "./SaveAsSceneModal.tsx";
import { toBase64 } from "./utils/strings.ts";
import { ON_UNAUTHORIZED_REDIRECT_TO, restoreSourceLocation, storeSourceLocation } from "./utils/routeUtils.ts";
import { getGetSceneApiV1ScenesSceneIdGetQueryOptions, getGetSceneFileApiV1SceneFilesFileIdGetQueryOptions, getSceneApiV1ScenesSceneIdGet, getSceneFileApiV1SceneFilesFileIdGet } from "./gen/api/default/default.ts";
import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types";
import { BaseSceneWithRevision } from "./gen/model/baseSceneWithRevision.ts";
import { SceneFile } from "./gen/model/sceneFile.ts";
import { db } from "./db/db.ts";
import * as R from "remeda";
import { useHotkeys } from 'react-hotkeys-hook';

const updateSceneLibraryWithBlobs = (api: ExcalidrawImperativeAPI, blobs: Record<string, Blob>) => {
  for (const [_, blob] of Object.entries(blobs)) {
    console.log(api, blob);
    api.updateLibrary({
      merge: true,
      libraryItems: blob,
      openLibraryMenu: true,
    });
  }
}

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

type EncodedSceneServerData = {
  elements: readonly ExcalidrawElement[],
}

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

const useLibraryBlobs = (excalidrawAPI?: ExcalidrawImperativeAPI) => {
  const location = useLocation();

  const [libraryBlobs, setLibraryBlobs] = useState<Record<string, Blob>>({});
  const [addedLibraryUrls, setAddedLibraryUrls] = useState<string[]>([]);
  const libraryUrlToAdd = useMemo(() => {
    const hashParts = location.hash.substring(1).split("&");
    for (const hashPart of hashParts) {
      const [key, value] = hashPart.split("=");
      if (key === "addLibrary") {
        return decodeURIComponent(value);
      }
    }
    return null;
  }, [location.hash]);

  const missingBlobUrls = useMemo(() => {
    const result: Record<string, Blob> = {};
    for (const libraryUrl of Object.keys(libraryBlobs)) {
      if (!addedLibraryUrls.includes(libraryUrl)) {
        result[libraryUrl] = libraryBlobs[libraryUrl];
      }
    }

    return result;
  }, [libraryBlobs, addedLibraryUrls]);

  useEffect(() => {
    if (libraryUrlToAdd === null) {
      return;
    }

    fetch(libraryUrlToAdd)
      .then((response) => response.blob())
      .then((libraryItems) => {
        setLibraryBlobs((blobs) => ({
          ...blobs,
          [libraryUrlToAdd]: libraryItems,
        }));
      });
  }, [libraryUrlToAdd]);

  useEffect(() => {
    if (Object.keys(missingBlobUrls).length === 0 || excalidrawAPI === undefined) {
      return;
    }

    updateSceneLibraryWithBlobs(excalidrawAPI, missingBlobUrls);
    setAddedLibraryUrls((libraryUrls) => [...libraryUrls, ...Object.keys(missingBlobUrls)]);
  }, [missingBlobUrls, excalidrawAPI]);
}

const queryClient = new QueryClient();

const Example = () => {
  console.log("rendered example");
  const sceneData = useAsyncValue() as SceneData;
  const [state, setState] = useState("");

  return <div>
    <h1>{sceneData.scene?.name}</h1>
    <p>{sceneData.scene?.description}</p>
  </div>
}

export type SceneDataOptions = {
  name?: string,
  description?: string,
}

const buildSceneData = async (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
  options: SceneDataOptions = {},
) => {
  return {
    scene: {
      name: options.name ?? "",
      description: options.description ?? "",
      picture: await exportToImageBase64({ elements, appState, files }),
      data: JSON.stringify({
        elements,
      }),
    },
    files: Object.entries(files).map(([key, value]) => {
      return {
        name: key,
        data: JSON.stringify(value),
      };
    }),
  } satisfies SceneData;
}

// debounce saving
const storeDraftDebouncer = R.debounce(async (
  id: string,
  elements: readonly ExcalidrawElement[],
  state: AppState,
  files: BinaryFiles,
  options: SceneDataOptions = {},
) => {
  console.log("saving draft")
  const newSceneData = await buildSceneData(elements, state, files, options);
  await saveSceneDataToLocalDB(id, newSceneData);
}, { waitMs: 1000, timing: "trailing" });

const ExcalidrawApp = () => {
  const sceneData = useAsyncValue() as SceneData;
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  // const [isCollaborating, setIsCollaborating] = useState(false);

  const browseScenesDisclosure = useDisclosure();
  const saveSceneDisclosure = useDisclosure();

  const saveSceneToServerMutation = useSaveSceneToServerMutation();
  const saveSceneFileToServerMutation = useSaveSceneFileToServerMutation();
  const updateSceneMutation = useUpdateSceneMutation();
  const deleteSceneMutation = useDeleteSceneMutation();

  const navigate = useNavigate();
  const { id: idParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  // const sceneQuery = useScene(id);
  // const fileIds = useMemo(() => sceneQuery.data?.files_ids ?? [], [sceneQuery.data]);
  // const sceneFilesQueries = useSceneFiles(fileIds);

  // const isDraft = useMemo(() => {
  //   const search = createSearchParams(location.search);
  //   return search.get("isDraft") === "true";
  // }, [location.search]);

  const id = getSceneIdFromIdParam(idParam);
  const isDraft = searchParams.get('isDraft') === "true";

  // useLibraryBlobs(excalidrawAPI);

  const parsedSceneData = useMemo(() => {
    if (sceneData.scene === null) {
      return null;
    }

    // TODO: use zod here...
    const result = JSON.parse(sceneData.scene.data) as EncodedSceneServerData;
    if (sceneData.files.length === 0) {
      return result;
    }

    const files: BinaryFiles = {};
    sceneData.files.forEach((file) => {
      files[file.name] = JSON.parse(file.data);
    })

    return {
      ...result,
      files,
    };
  }, [sceneData]);

  const serverLoadedElements = useMemo(() => {
    if (parsedSceneData === null) {
      return [];
    }

    return (parsedSceneData.elements ?? []).map((element: ExcalidrawElement) => ({
      ...element,
      version: 0,
    }));
  }, [parsedSceneData]);

  const toast = useToast();


  // useEffect(() => {
  //   if (!excalidrawAPI || sceneQuery.isLoading || !sceneQuery.isSuccess) {
  //     return;
  //   }

  //   console.log("Loading scene from server");

  //   const sceneData = JSON.parse(sceneQuery.data.data);

  //   setServerLoadedElements(
  //     sceneData.elements.map((element: ExcalidrawElement) => ({
  //       ...element,
  //       version: 0,
  //     })),
  //   );

  //   excalidrawAPI.resetScene();
  //   excalidrawAPI.addFiles(sceneFilesQueries.data);
  //   excalidrawAPI.updateScene(sceneData);
  // }, [excalidrawAPI, sceneQuery.data, sceneFilesQueries.pending]);

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

  const updateScene = async () => {
    if (excalidrawAPI === undefined) {
      throw new Error("Excalidraw API is not set");
    }

    if (id === '__root__') {
      saveSceneDisclosure.onOpen();
      return; // if we don't have an id, we can't update the scene - so we open the save as modal
    }

    const elements = excalidrawAPI.getSceneElements();
    const files = excalidrawAPI.getFiles();
    const appState = excalidrawAPI.getAppState();

    const newSceneData = await buildSceneData(elements, appState, files, {
      name: sceneData.scene?.name,
      description: sceneData.scene?.description,
    });

    const updatedScene = await updateSceneMutation.mutateAsync({
      sceneId: id,
      data: newSceneData.scene
    });

    // if this part fails - we lose the files
    const promises = newSceneData.files.map((value) => {
      return saveSceneFileToServerMutation.mutateAsync({
        params: {
          revision_id: updatedScene.revision_id,
        },
        data: value
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
    await clearSceneDataFromLocalDB(id)
    setSearchParams((prev) => {
      prev.delete("isDraft");
      return prev;
    });
  }

  const restoreSceneToServer = async () => {
    if (!excalidrawAPI) {
      throw new Error("Excalidraw API is not set");
    }

    excalidrawAPI.resetScene(); // delete any local changes
    if (parsedSceneData === null) {
      return; // nothing more to do...
    }

    excalidrawAPI.updateScene(parsedSceneData);
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
      data: {
        name: sceneName,
        description,
        picture: await exportToImageBase64({ elements, appState, files }),
        data: JSON.stringify({ elements } satisfies EncodedSceneServerData),
      }
    });

    // if this part fails - we lose the files
    const promises = Object.entries(files).map(([key, value]) => {
      return saveSceneFileToServerMutation.mutateAsync({
        params: {
          revision_id: savedScene.revision_id,
        },
        data: {
          name: key,
          data: JSON.stringify(value),
        },
      });
    });

    await Promise.all(promises);

    loadFromServer(savedScene.id);
  };

  const loadFromServer = (sceneId: string) => {
    navigate(`/scenes/${sceneId}`);
  };

  const deleteFromServer = async (sceneId: string) => {
    await deleteSceneMutation.mutateAsync({ sceneId });
  }

  window.saveToServer = saveToServer;

  const [lastComparedElements, setComparedElements] = useState<readonly ExcalidrawElement[]>(serverLoadedElements);

  // TODO: looks like we must fork :\...
  // useHotkeys(['ctrl+s', 'command+s'], (event) => {
  //   // event.preventDefault();
  //   console.log("lol")
  //   // updateScene();
  // }, {
  //   preventDefault: true,
  // })

  return (
    <Flex key={id} flex={"1"}>
      <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={parsedSceneData}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
          }
        }}
        onChange={async (elements, state, files) => {
          const changed = isChanged(lastComparedElements, elements);
          if (changed) {
            const elementsDeepCopy = JSON.parse(JSON.stringify(elements)) as ExcalidrawElement[];
            await storeDraftDebouncer.call(id, elements, state, files, {
              name: sceneData.scene?.name,
              description: sceneData.scene?.description,
            });
            setComparedElements(elementsDeepCopy);
            if (!isDraft) {
              // add isDraft=true to the search params
              setSearchParams((prev) => {
                prev.set("isDraft", "true");
                return prev;
              })
            }
          }
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
          <MainMenu.Item
            onSelect={updateScene}
            icon={<MdOutlineSave />}
          >
            Save
          </MainMenu.Item>
          <MainMenu.Item onSelect={saveSceneDisclosure.onOpen} icon={<MdOutlineSaveAs />}>
            {/*<Button onClick={onOpen}>Open Modal</Button>*/}
            Save as new scene...
          </MainMenu.Item>
          <MainMenu.Item onSelect={() => {
            // excalidrawAPI?.resetScene();
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
              {sceneData.scene?.name} {
                isDraft && <Text as="span" color="gray.500">(Draft)</Text>
              }
            </Text>
          </Flex>
        </>
      }
      <BrowseScenesModal isOpen={browseScenesDisclosure.isOpen} onClose={browseScenesDisclosure.onClose}
        deleteScene={deleteFromServer}
        loadScene={loadFromServer} />
      <SaveAsSceneModal isOpen={saveSceneDisclosure.isOpen}
        initialSceneName={sceneData.scene?.name ?? ""}
        initialSceneDescription={sceneData.scene?.description ?? ""}
        onClose={saveSceneDisclosure.onClose}
        onSaveAsScene={async (params) => {
          await saveToServer(params.sceneName, params.description);
        }} />
    </Flex>
  )
}

function App() {
  const { sceneData } = useLoaderData() as { sceneData: SceneData };

  return (
    <Suspense fallback={
      <Center>
        <CircularProgress isIndeterminate />
      </Center>
    }>
      <Await
        resolve={sceneData}
        errorElement={<Text>Error loading scene</Text>}
      >
        <ExcalidrawApp />
        {/* <Example/> */}
      </Await>
    </Suspense>
  );
}

const Root = () => {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

const protectedRouteLoader: IndexRouteObject["loader"] = async ({ request }) => {
  const queryOptions = getUsersCurrentUserApiV1UsersMeGetQueryOptions();
  try {
    return defer({
      user: await queryClient.fetchQuery(queryOptions),
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        storeSourceLocation(new URL(request.url));
        return redirect(ON_UNAUTHORIZED_REDIRECT_TO);
      }
    }

    throw new Response("Unexpected error occured", { status: 500 });
  }
}


type SceneData = {
  scene: BaseSceneWithRevision | null,
  files: SceneFile[],
};

const clearSceneDataFromLocalDB = async (id: string) => {
  await db.drafts.delete(id);
}

const saveSceneDataToLocalDB = async (id: string, sceneData: SceneData) => {
  await db.drafts.put({
    id: id,
    content: JSON.stringify(sceneData),
  });
}

const getSceneIdFromIdParam = (idParam: string = '__root__') => {
  return idParam;
}

const loadSceneDataFromLocalDB = async (id: string) => {
  const result = await db.drafts.get(id);
  if (result === undefined) {
    return null;
  }

  return JSON.parse(result.content) as SceneData;
}


const sceneLoader: IndexRouteObject["loader"] = async ({ params, request }) => {
  const getSceneData = async () => {
    const search = new URL(request.url).searchParams;
    const isDraft = search.get("isDraft") === "true";
    let existingDraft: SceneData | null = null;
    if (isDraft) {
      // load from local storage
      const id = getSceneIdFromIdParam(params.id);
      existingDraft = await loadSceneDataFromLocalDB(id);
    }

    if (!params.id) {
      return existingDraft ?? {
        scene: null,
        files: [],
      } satisfies SceneData;
    }

    const queryOptions = getGetSceneApiV1ScenesSceneIdGetQueryOptions(params.id);
    const scene = await queryClient.fetchQuery(queryOptions)
    const fileIds = scene.files_ids ?? [];
    const files = await Promise.all(fileIds.map(fileId => {
      return queryClient.fetchQuery(getGetSceneFileApiV1SceneFilesFileIdGetQueryOptions(fileId));
    }));

    return existingDraft ?? {
      scene,
      files,
    } satisfies SceneData;
  }

  return defer({
    sceneData: getSceneData(),
  });
}

const ProtectedRoute = () => {
  const { user } = useLoaderData() as { user: Awaited<ReturnType<typeof usersCurrentUserApiV1UsersMeGet>> };
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    return apiManager.subscribeErrors((errorData) => {
      if (errorData.code === ErrorCode.Unauthorized) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired, redirecting to login page...",
          status: "error",
          duration: 3000,
          isClosable: true,
          onCloseComplete: () => {
            storeSourceLocation(location);
            navigate(ON_UNAUTHORIZED_REDIRECT_TO)
          }
        })
      }
    });
  }, []);

  return <Outlet context={{ user }} />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route path="login/" element={<Login />} />
      <Route path="callback/" loader={() => redirect(restoreSourceLocation())} />

      <Route loader={protectedRouteLoader} id="root" element={<ProtectedRoute />}>
        <Route loader={sceneLoader} index element={<App />} />
        <Route loader={sceneLoader} path="scenes/:id" element={<App />} />
      </Route>
    </Route>
  ),
)

const ProvidedApp = () => <RouterProvider router={router} />;

export default ProvidedApp;
