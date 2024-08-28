import { BinaryFileData } from "@excalidraw/excalidraw/types/types";
import { queryOptions, useQueries, useQueryClient } from "@tanstack/react-query";
import { getGetSceneFileApiV1SceneFilesFileIdGetQueryOptions, getGetScenesApiV1ScenesGetQueryKey, useAddSceneFileApiV1SceneFilesPost, useCreateSceneApiV1ScenesPost, useDeleteSceneApiV1ScenesSceneIdDelete, useGetSceneApiV1ScenesSceneIdGet, useGetScenesApiV1ScenesGetInfinite, useUpdateSceneApiV1ScenesSceneIdPut } from "./gen/api/default/default";

export const useSaveSceneToServerMutation = () => {
  const queryClient = useQueryClient();

  return useCreateSceneApiV1ScenesPost({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetScenesApiV1ScenesGetQueryKey() });
      },
    }
  });
}

export const useScenes = ({enabled, search}: { enabled: boolean, search: string }) => {
  return useGetScenesApiV1ScenesGetInfinite({
    name_filter: search,
  }, {
    query: {
      enabled,
      getNextPageParam: (lastPage) => {
        return lastPage.next_cursor;
      }
    }
  });
}

export const useSaveSceneFileToServerMutation = () => {
  return useAddSceneFileApiV1SceneFilesPost()
}

export const sceneQueryKeyPrefix = "scene" as const;

export const getSceneQueryKey = (sceneId: string) => {
  return [sceneQueryKeyPrefix, sceneId] as const;
}

export const useDeleteSceneMutation = () => {
  const queryClient = useQueryClient();

  return useDeleteSceneApiV1ScenesSceneIdDelete({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetScenesApiV1ScenesGetQueryKey() });
        await queryClient.invalidateQueries({ queryKey: [sceneQueryKeyPrefix] });
      },
    }
  });
}

export const useUpdateSceneMutation = () => {
  const queryClient = useQueryClient();

  return useUpdateSceneApiV1ScenesSceneIdPut({
    mutation: {
      onSuccess: async (response) => {
        await queryClient.invalidateQueries({ queryKey: getGetScenesApiV1ScenesGetQueryKey() });
        await queryClient.invalidateQueries({ queryKey: [sceneQueryKeyPrefix, response.id], exact: true});
      },
    }
  });
}

export const useScene = (sceneId?: string) => {
  return useGetSceneApiV1ScenesSceneIdGet(sceneId!, {
    query: {
      queryKey: getSceneQueryKey(sceneId!),
      enabled: Boolean(sceneId),
    }
  });
}

export const useSceneFiles = (fileIds: string[]) => {
  return useQueries({
    queries: fileIds.map(fileId => {
      const options = getGetSceneFileApiV1SceneFilesFileIdGetQueryOptions(fileId);
      return queryOptions({
        queryKey: options.queryKey,
        queryFn: options.queryFn,
      })
    }),
    combine: (results) => {
      return {
        data: results
          .map(result => result.data?.data && JSON.parse(result.data.data) as BinaryFileData)
          .filter((sceneFile): sceneFile is BinaryFileData => sceneFile !== undefined),
        pending: results.some(result => result.isLoading),
      };
    },
  });
};
