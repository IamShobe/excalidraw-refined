import { NavigateFunction, Location } from "react-router-dom";


export const ON_UNAUTHORIZED_REDIRECT_TO = "/login/";
const SESSION_STORAGE_KEY_REDIRECT_ORIGIN = "redirect_origin";

export const storeSourceLocation = (location: Location | URL | string) => {
    let pathname = "/";
    if (typeof location === "string") {
        const url = new URL(location);
        pathname = url.pathname;
    } else if (location instanceof URL) {
        pathname = location.pathname;
    } else if (location.pathname) {
        pathname = location.pathname;
    }
    
    sessionStorage.setItem(SESSION_STORAGE_KEY_REDIRECT_ORIGIN, pathname);
};

export const restoreSourceLocation = () => {
    const result = sessionStorage.getItem(SESSION_STORAGE_KEY_REDIRECT_ORIGIN);
    if (result) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY_REDIRECT_ORIGIN);
    }
    return result ?? "/";
}

export const onUnauthorize = (navigate: NavigateFunction, location: Location) => {
    storeSourceLocation(location);
    navigate(ON_UNAUTHORIZED_REDIRECT_TO);
}
