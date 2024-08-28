import Axios, { AxiosRequestConfig } from 'axios';
 
 export const AXIOS_INSTANCE = Axios.create({ 
    headers: {
        'Authorization': '' 
    }
 });
 
 export const customInstance = <T>(
   config: AxiosRequestConfig,
   options?: AxiosRequestConfig,
 ): Promise<T> => {
   const source = Axios.CancelToken.source();
   const promise = AXIOS_INSTANCE({
     ...config,
     ...options,
     cancelToken: source.token,
   }).then(({ data }) => data);
 
   // @ts-ignore
   promise.cancel = () => {
     source.cancel('Query was cancelled');
   };
 
   return promise;
 };
 