import { BinaryFileData } from "@excalidraw/excalidraw/types/types";
import { queryOptions, useQueries, useQueryClient } from "@tanstack/react-query";
import { getGetSceneFileApiV1SceneFilesFileIdGetQueryOptions, getGetScenesApiV1ScenesGetQueryKey, useAddSceneFileApiV1SceneFilesPost, useCreateSceneApiV1ScenesPost, useDeleteSceneApiV1ScenesSceneIdDelete, useGetSceneApiV1ScenesSceneIdGet, useGetScenesApiV1ScenesGetInfinite, useUpdateSceneApiV1ScenesSceneIdPut } from "./gen/api/default/default";
import { AxiosError } from "axios";

export enum ErrorCode {
  Unauthorized,
}

export type ErrorData = {
  message: string;
  code: ErrorCode;
};

export type SubscriberCallback = (data: ErrorData, error: AxiosError) => void;
export type UnsubscribeCallback = () => void;
export type Subscriber = {
  callback: SubscriberCallback;
  unsubscribe: UnsubscribeCallback;
};

export const createApiManager = () => {
  const listeners: Record<string, Subscriber> = {};

  const subscribeErrors = (callback: SubscriberCallback) => {
    const uuid = Math.random().toString(36).substring(7);

    listeners[uuid] = {
      callback,
      unsubscribe: () => {
        delete listeners[uuid];
      },
    };

    return listeners[uuid].unsubscribe;
  }

  const emit = async (data: ErrorData, error: AxiosError) => {
    await Promise.all(Object.values(listeners).map((listener) => listener.callback(data, error)));
  }


  const retryPredicate = (count: number, error: AxiosError) => {
    if (count > 3) {
      return false;
    }

    if (!error.response) {
      return true; // Retry on network errors
    }

    // check if the error is a 404
    if (error.status === 404) {
      return false;
    }

    if (error.status === 401) {
      emit({
        message: "Resource not found",
        code: ErrorCode.Unauthorized,
      }, error)
      return false;
    }

    return true;
  }


  return {
    subscribeErrors,
    retryPredicate,
  }
}

export const apiManager = createApiManager();

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

export const useScenes = ({ enabled, search }: { enabled: boolean, search: string }) => {
  return useGetScenesApiV1ScenesGetInfinite({
    name_filter: search,
  }, {
    query: {
      enabled,
      getNextPageParam: (lastPage) => {
        return lastPage.next_cursor;
      },
      retry: apiManager.retryPredicate,
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
        await queryClient.invalidateQueries({ queryKey: [sceneQueryKeyPrefix, response.id], exact: true });
      },
    }
  });
}

export const useScene = (sceneId?: string) => {
  return useGetSceneApiV1ScenesSceneIdGet(sceneId!, {
    query: {
      queryKey: getSceneQueryKey(sceneId!),
      enabled: Boolean(sceneId),
      retry: apiManager.retryPredicate,
    },
  });
}

export const useSceneFiles = (fileIds: string[]) => {
  return useQueries({
    queries: fileIds.map(fileId => {
      const options = getGetSceneFileApiV1SceneFilesFileIdGetQueryOptions(fileId);
      return queryOptions({
        queryKey: options.queryKey,
        queryFn: options.queryFn,
        retry: apiManager.retryPredicate,
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
