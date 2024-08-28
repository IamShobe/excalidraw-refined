/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import {
  useMutation,
  useQuery
} from '@tanstack/react-query'
import type {
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import * as axios from 'axios';
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'
import type {
  ErrorModel,
  HTTPValidationError,
  UserRead,
  UserUpdate
} from '../../../model'



/**
 * @summary Users:Current User
 */
export const usersCurrentUserUsersMeGet = (
     options?: AxiosRequestConfig
 ): Promise<AxiosResponse<UserRead>> => {
    
    return axios.default.get(
      `/users/me`,options
    );
  }


export const getUsersCurrentUserUsersMeGetQueryKey = () => {
    return [`/users/me`] as const;
    }

    
export const getUsersCurrentUserUsersMeGetQueryOptions = <TData = Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError = AxiosError<void>>( options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError, TData>>, axios?: AxiosRequestConfig}
) => {

const {query: queryOptions, axios: axiosOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getUsersCurrentUserUsersMeGetQueryKey();

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>> = ({ signal }) => usersCurrentUserUsersMeGet({ signal, ...axiosOptions });

      

      

   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError, TData> & { queryKey: QueryKey }
}

export type UsersCurrentUserUsersMeGetQueryResult = NonNullable<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>>
export type UsersCurrentUserUsersMeGetQueryError = AxiosError<void>


export function useUsersCurrentUserUsersMeGet<TData = Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError = AxiosError<void>>(
  options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>,
          TError,
          TData
        > , 'initialData'
      >, axios?: AxiosRequestConfig}

  ):  DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useUsersCurrentUserUsersMeGet<TData = Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError = AxiosError<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>,
          TError,
          TData
        > , 'initialData'
      >, axios?: AxiosRequestConfig}

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useUsersCurrentUserUsersMeGet<TData = Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError = AxiosError<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError, TData>>, axios?: AxiosRequestConfig}

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }
/**
 * @summary Users:Current User
 */

export function useUsersCurrentUserUsersMeGet<TData = Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError = AxiosError<void>>(
  options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersCurrentUserUsersMeGet>>, TError, TData>>, axios?: AxiosRequestConfig}

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey } {

  const queryOptions = getUsersCurrentUserUsersMeGetQueryOptions(options)

  const query = useQuery(queryOptions) as  UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



/**
 * @summary Users:Patch Current User
 */
export const usersPatchCurrentUserUsersMePatch = (
    userUpdate: UserUpdate, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<UserRead>> => {
    
    return axios.default.patch(
      `/users/me`,
      userUpdate,options
    );
  }



export const getUsersPatchCurrentUserUsersMePatchMutationOptions = <TError = AxiosError<ErrorModel | void | HTTPValidationError>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof usersPatchCurrentUserUsersMePatch>>, TError,{data: UserUpdate}, TContext>, axios?: AxiosRequestConfig}
): UseMutationOptions<Awaited<ReturnType<typeof usersPatchCurrentUserUsersMePatch>>, TError,{data: UserUpdate}, TContext> => {
const {mutation: mutationOptions, axios: axiosOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof usersPatchCurrentUserUsersMePatch>>, {data: UserUpdate}> = (props) => {
          const {data} = props ?? {};

          return  usersPatchCurrentUserUsersMePatch(data,axiosOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type UsersPatchCurrentUserUsersMePatchMutationResult = NonNullable<Awaited<ReturnType<typeof usersPatchCurrentUserUsersMePatch>>>
    export type UsersPatchCurrentUserUsersMePatchMutationBody = UserUpdate
    export type UsersPatchCurrentUserUsersMePatchMutationError = AxiosError<ErrorModel | void | HTTPValidationError>

    /**
 * @summary Users:Patch Current User
 */
export const useUsersPatchCurrentUserUsersMePatch = <TError = AxiosError<ErrorModel | void | HTTPValidationError>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof usersPatchCurrentUserUsersMePatch>>, TError,{data: UserUpdate}, TContext>, axios?: AxiosRequestConfig}
): UseMutationResult<
        Awaited<ReturnType<typeof usersPatchCurrentUserUsersMePatch>>,
        TError,
        {data: UserUpdate},
        TContext
      > => {

      const mutationOptions = getUsersPatchCurrentUserUsersMePatchMutationOptions(options);

      return useMutation(mutationOptions);
    }
    /**
 * @summary Users:User
 */
export const usersUserUsersIdGet = (
    id: string, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<UserRead>> => {
    
    return axios.default.get(
      `/users/${id}`,options
    );
  }


export const getUsersUserUsersIdGetQueryKey = (id: string,) => {
    return [`/users/${id}`] as const;
    }

    
export const getUsersUserUsersIdGetQueryOptions = <TData = Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError = AxiosError<void | HTTPValidationError>>(id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError, TData>>, axios?: AxiosRequestConfig}
) => {

const {query: queryOptions, axios: axiosOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getUsersUserUsersIdGetQueryKey(id);

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof usersUserUsersIdGet>>> = ({ signal }) => usersUserUsersIdGet(id, { signal, ...axiosOptions });

      

      

   return  { queryKey, queryFn, enabled: !!(id), ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError, TData> & { queryKey: QueryKey }
}

export type UsersUserUsersIdGetQueryResult = NonNullable<Awaited<ReturnType<typeof usersUserUsersIdGet>>>
export type UsersUserUsersIdGetQueryError = AxiosError<void | HTTPValidationError>


export function useUsersUserUsersIdGet<TData = Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError = AxiosError<void | HTTPValidationError>>(
 id: string, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof usersUserUsersIdGet>>,
          TError,
          TData
        > , 'initialData'
      >, axios?: AxiosRequestConfig}

  ):  DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useUsersUserUsersIdGet<TData = Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError = AxiosError<void | HTTPValidationError>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof usersUserUsersIdGet>>,
          TError,
          TData
        > , 'initialData'
      >, axios?: AxiosRequestConfig}

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }
export function useUsersUserUsersIdGet<TData = Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError = AxiosError<void | HTTPValidationError>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError, TData>>, axios?: AxiosRequestConfig}

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey }
/**
 * @summary Users:User
 */

export function useUsersUserUsersIdGet<TData = Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError = AxiosError<void | HTTPValidationError>>(
 id: string, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof usersUserUsersIdGet>>, TError, TData>>, axios?: AxiosRequestConfig}

  ):  UseQueryResult<TData, TError> & { queryKey: QueryKey } {

  const queryOptions = getUsersUserUsersIdGetQueryOptions(id,options)

  const query = useQuery(queryOptions) as  UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



/**
 * @summary Users:Patch User
 */
export const usersPatchUserUsersIdPatch = (
    id: string,
    userUpdate: UserUpdate, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<UserRead>> => {
    
    return axios.default.patch(
      `/users/${id}`,
      userUpdate,options
    );
  }



export const getUsersPatchUserUsersIdPatchMutationOptions = <TError = AxiosError<ErrorModel | void | HTTPValidationError>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof usersPatchUserUsersIdPatch>>, TError,{id: string;data: UserUpdate}, TContext>, axios?: AxiosRequestConfig}
): UseMutationOptions<Awaited<ReturnType<typeof usersPatchUserUsersIdPatch>>, TError,{id: string;data: UserUpdate}, TContext> => {
const {mutation: mutationOptions, axios: axiosOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof usersPatchUserUsersIdPatch>>, {id: string;data: UserUpdate}> = (props) => {
          const {id,data} = props ?? {};

          return  usersPatchUserUsersIdPatch(id,data,axiosOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type UsersPatchUserUsersIdPatchMutationResult = NonNullable<Awaited<ReturnType<typeof usersPatchUserUsersIdPatch>>>
    export type UsersPatchUserUsersIdPatchMutationBody = UserUpdate
    export type UsersPatchUserUsersIdPatchMutationError = AxiosError<ErrorModel | void | HTTPValidationError>

    /**
 * @summary Users:Patch User
 */
export const useUsersPatchUserUsersIdPatch = <TError = AxiosError<ErrorModel | void | HTTPValidationError>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof usersPatchUserUsersIdPatch>>, TError,{id: string;data: UserUpdate}, TContext>, axios?: AxiosRequestConfig}
): UseMutationResult<
        Awaited<ReturnType<typeof usersPatchUserUsersIdPatch>>,
        TError,
        {id: string;data: UserUpdate},
        TContext
      > => {

      const mutationOptions = getUsersPatchUserUsersIdPatchMutationOptions(options);

      return useMutation(mutationOptions);
    }
    /**
 * @summary Users:Delete User
 */
export const usersDeleteUserUsersIdDelete = (
    id: string, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<void>> => {
    
    return axios.default.delete(
      `/users/${id}`,options
    );
  }



export const getUsersDeleteUserUsersIdDeleteMutationOptions = <TError = AxiosError<void | HTTPValidationError>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof usersDeleteUserUsersIdDelete>>, TError,{id: string}, TContext>, axios?: AxiosRequestConfig}
): UseMutationOptions<Awaited<ReturnType<typeof usersDeleteUserUsersIdDelete>>, TError,{id: string}, TContext> => {
const {mutation: mutationOptions, axios: axiosOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof usersDeleteUserUsersIdDelete>>, {id: string}> = (props) => {
          const {id} = props ?? {};

          return  usersDeleteUserUsersIdDelete(id,axiosOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type UsersDeleteUserUsersIdDeleteMutationResult = NonNullable<Awaited<ReturnType<typeof usersDeleteUserUsersIdDelete>>>
    
    export type UsersDeleteUserUsersIdDeleteMutationError = AxiosError<void | HTTPValidationError>

    /**
 * @summary Users:Delete User
 */
export const useUsersDeleteUserUsersIdDelete = <TError = AxiosError<void | HTTPValidationError>,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof usersDeleteUserUsersIdDelete>>, TError,{id: string}, TContext>, axios?: AxiosRequestConfig}
): UseMutationResult<
        Awaited<ReturnType<typeof usersDeleteUserUsersIdDelete>>,
        TError,
        {id: string},
        TContext
      > => {

      const mutationOptions = getUsersDeleteUserUsersIdDeleteMutationOptions(options);

      return useMutation(mutationOptions);
    }
    