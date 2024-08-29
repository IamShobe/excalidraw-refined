import axios from "axios";

export const createWrapper = (magicPrefix: string = "_MUW_") => {
    const wrapOAuth2Authorize = (authorizationUrl: string) => {
        const addRedirect = <T,>(newRedirectUri: string, additionalState?: T) => {
            const url = new URL(authorizationUrl);
            const originalRedirect = url.searchParams.get('redirect_uri')
            const originalState = url.searchParams.get('state')

            const newState = magicPrefix + btoa(JSON.stringify({
                originalState: originalState,
                originalRedirect: originalRedirect,
                additionalState: additionalState ?? {},
            }));

            url.searchParams.set('redirect_uri', newRedirectUri.toString());
            url.searchParams.set('state', newState);

            return wrapOAuth2Authorize(url.toString());
        }

        return {
            addRedirect,
            addRedirectPath: <T,>(newRedirectPath: string, additionalState?: T) => {
                const newUri = new URL(window.location.origin);
                newUri.pathname = newRedirectPath;

                return addRedirect(newUri.toString(), additionalState);
            },
            authorize: () => {
                window.location.replace(authorizationUrl);
            },
        }
    }

    const oauth2CallbackUnwrapper = (location: string) => {
        const verifyUrl = () => {
            const url = new URL(location);
            const state = url.searchParams.get('state');
            const code = url.searchParams.get('code');
            if (!state || !code) {
                throw new Error('Invalid state or code');
            }

            return { state, code };
        }

        return {
            execute: async () => {
                verifyUrl();
                return await axios.get(location);
            },
            unwrap: (options?: {
                assertState?: <T,>(state: T) => void,
            }) => {
                const {state, code} = verifyUrl();
                if (!state.startsWith(magicPrefix)) {
                    throw new Error('Invalid state');
                }

                const relevantState = state.slice(magicPrefix.length);
                const { originalState, originalRedirect, additionalState } = JSON.parse(atob(relevantState));
                const callbackUrl = new URL(originalRedirect);
                callbackUrl.searchParams.set('code', code);
                callbackUrl.searchParams.set('state', originalState);

                options?.assertState?.(additionalState);

                return oauth2CallbackUnwrapper(callbackUrl.toString()); 
            }
        }
    }

    return {
        wrapOAuth2Authorize,
        oauth2CallbackUnwrapper,
    }
}

const defaultWrapper = createWrapper();
export const wrapOAuth2Authorize = defaultWrapper.wrapOAuth2Authorize;
export const oauth2CallbackUnwrapper = defaultWrapper.oauth2CallbackUnwrapper;
