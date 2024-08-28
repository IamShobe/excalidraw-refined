import Axios, { AxiosRequestConfig } from 'axios';

// auth is performed using a cookie
export const AXIOS_INSTANCE = Axios.create({});

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

    AXIOS_INSTANCE.interceptors.response.use(
        (response) => response,
        (error) => {
            if (Axios.isCancel(error)) {
                return Promise.reject(new Error('Query was cancelled'));
            }

            // check 401 and redirect to login
            if (error.response.status === 401) {
                window.location.href = '/?origin=' + window.location.pathname;
            }

            return Promise.reject(error);
        },
    );

    return promise;
};
