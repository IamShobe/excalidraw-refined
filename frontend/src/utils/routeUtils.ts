import { NavigateFunction, Location } from "react-router-dom";


export const ON_UNAUTHORIZED_REDIRECT_TO = "/login/";
const SESSION_STORAGE_KEY_REDIRECT_ORIGIN = "redirect_origin";

export const storeSourceLocation = (source: {
    pathname: string;
    search: string;
    hash: string;
}) => {
    const toStore = source.pathname + source.search + source.hash;

    sessionStorage.setItem(SESSION_STORAGE_KEY_REDIRECT_ORIGIN, toStore);
};

export const restoreSourceLocation = () => {
    const result = sessionStorage.getItem(SESSION_STORAGE_KEY_REDIRECT_ORIGIN);
    if (result) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY_REDIRECT_ORIGIN);
    }
    return result ?? "/";
}

export const onUnauthorize = (navigate: NavigateFunction, url: URL) => {
    storeSourceLocation(url);
    navigate(ON_UNAUTHORIZED_REDIRECT_TO);
}
