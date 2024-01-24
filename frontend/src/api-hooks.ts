import {queryOptions, useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient} from "@tanstack/react-query";
import {BinaryFileData} from "@excalidraw/excalidraw/types/types";
import createClient from "openapi-fetch";
import {components, paths} from "./lib/api/v1";
import type {DefaultError, InfiniteData, QueryKey} from "@tanstack/query-core";


const client = createClient<paths>();


export type SceneSummary = components["schemas"]["SceneSummary"];
export type CursorPageSceneSummary = components["schemas"]["CursorPage_SceneSummary_"];
export const useScenes = ({enabled, search}: { enabled: boolean, search: string }) => {
  return useInfiniteQuery<CursorPageSceneSummary, DefaultError, InfiniteData<CursorPageSceneSummary>, QueryKey, string | undefined>({
    queryKey: ["scenes", search],
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    queryFn: async ({signal, pageParam}) => {
      const scenes = await client.GET("/api/v1/scenes/", {
        params: {
          query: {
            cursor: pageParam,
            name_filter: search,
          },
        },
        signal,
      });

      if (scenes.error) {
        console.error(scenes.error);
        throw scenes.error;
      }

      return scenes.data;
    },
    enabled,
  });
};

export const useSaveSceneToServerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string,
      description: string,
      data: string,
      picture: string,
    }) => {
      return await client.POST("/api/v1/scenes/", {
        body: {
          ...params,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ["scenes"]});
    },
  });
};


export const useSaveSceneFileToServerMutation = () => {
  return useMutation({
    mutationFn: async ({revisionId, params}: {
      revisionId: string, params: {
        name: string,
        data: string,
      }
    }) => {
      return await client.POST("/api/v1/scene-files/", {
        params: {
          query: {
            revision_id: revisionId,
          },
        },
        body: {
          ...params,
        },
      });
    },
  });
};


export const useDeleteSceneMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sceneId: string) => {
      return await client.DELETE("/api/v1/scenes/{scene_id}", {
        params: {
          path: {
            scene_id: sceneId,
          },
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ["scenes"]});
      await queryClient.invalidateQueries({queryKey: ["scene"]});
    },
  });
};


export const useUpdateSceneMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sceneId: string,
      name: string,
      description: string,
      data: string,
      picture: string,
    }) => {
      return await client.PUT("/api/v1/scenes/{scene_id}", {
        params: {
          path: {
            scene_id: params.sceneId,
          },
        },
        body: {
          ...params,
        },
      });
    },
    onSuccess: async (response) => {
      await queryClient.resetQueries({queryKey: ["scenes"]});
      await queryClient.invalidateQueries({queryKey: ["scene", response.data?.id], exact: true});
    },
  });
}

export const useScene = (sceneId?: string) => {
  return useQuery({
    queryKey: ["scene", sceneId],
    queryFn: async ({signal}) => {
      if (!sceneId) {
        throw new Error("sceneId is required");
      }

      const sceneData = await client.GET("/api/v1/scenes/{scene_id}", {
        params: {
          path: {
            scene_id: sceneId,
          },
        },
        signal,
      });

      if (sceneData.error) {
        console.error(sceneData.error);
        throw sceneData.error;
      }

      return sceneData.data;
    },
    enabled: Boolean(sceneId),
  });
};


export const useSceneFiles = (fileIds: string[]) => {
  return useQueries({
    queries: fileIds.map(fileId => queryOptions({
      queryKey: ["scene-file", fileId],
      queryFn: async ({signal}) => {
        const file = await client.GET("/api/v1/scene-files/{file_id}", {
          params: {
            path: {
              file_id: fileId,
            },
          },
          signal,
        });
        if (file.error) {
          console.error(file.error);
          throw file.error;
        }

        return {
          name: file.data.name,
          data: JSON.parse(file.data.data) as BinaryFileData,
        };
      },
    })),
    combine: (results) => {
      return {
        data: results
          .map(result => result.data?.data)
          .filter((file): file is BinaryFileData => file !== undefined),
        pending: results.some(result => result.isLoading),
      };
    },
  });
};
