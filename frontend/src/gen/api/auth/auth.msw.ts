/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import {
  faker
} from '@faker-js/faker'
import {
  HttpResponse,
  delay,
  http
} from 'msw'
import type {
  BearerResponse,
  OAuth2AuthorizeResponse,
  UserRead
} from '../../model'

export const getAuthJwtLoginAuthJwtLoginPostResponseMock = (overrideResponse: Partial< BearerResponse > = {}): BearerResponse => ({access_token: faker.word.sample(), token_type: faker.word.sample(), ...overrideResponse})

export const getRegisterRegisterAuthRegisterPostResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getVerifyVerifyAuthVerifyPostResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getOauthGoogleJwtAuthorizeAuthGoogleAuthorizeGetResponseMock = (overrideResponse: Partial< OAuth2AuthorizeResponse > = {}): OAuth2AuthorizeResponse => ({authorization_url: faker.word.sample(), ...overrideResponse})


export const getAuthJwtLoginAuthJwtLoginPostMockHandler = (overrideResponse?: BearerResponse | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<BearerResponse> | BearerResponse)) => {
  return http.post('*/auth/jwt/login', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getAuthJwtLoginAuthJwtLoginPostResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getAuthJwtLogoutAuthJwtLogoutPostMockHandler = (overrideResponse?: unknown | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<unknown> | unknown)) => {
  return http.post('*/auth/jwt/logout', async (info) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }
    return new HttpResponse(null,
      { status: 200,
        
      })
  })
}

export const getRegisterRegisterAuthRegisterPostMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.post('*/auth/register', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getRegisterRegisterAuthRegisterPostResponseMock()),
      { status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getResetForgotPasswordAuthForgotPasswordPostMockHandler = (overrideResponse?: unknown | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<unknown> | unknown)) => {
  return http.post('*/auth/forgot-password', async (info) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }
    return new HttpResponse(null,
      { status: 202,
        
      })
  })
}

export const getResetResetPasswordAuthResetPasswordPostMockHandler = (overrideResponse?: unknown | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<unknown> | unknown)) => {
  return http.post('*/auth/reset-password', async (info) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }
    return new HttpResponse(null,
      { status: 200,
        
      })
  })
}

export const getVerifyRequestTokenAuthRequestVerifyTokenPostMockHandler = (overrideResponse?: unknown | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<unknown> | unknown)) => {
  return http.post('*/auth/request-verify-token', async (info) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }
    return new HttpResponse(null,
      { status: 202,
        
      })
  })
}

export const getVerifyVerifyAuthVerifyPostMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.post>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.post('*/auth/verify', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getVerifyVerifyAuthVerifyPostResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getOauthGoogleJwtAuthorizeAuthGoogleAuthorizeGetMockHandler = (overrideResponse?: OAuth2AuthorizeResponse | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<OAuth2AuthorizeResponse> | OAuth2AuthorizeResponse)) => {
  return http.get('*/auth/google/authorize', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getOauthGoogleJwtAuthorizeAuthGoogleAuthorizeGetResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getOauthGoogleJwtCallbackAuthGoogleCallbackGetMockHandler = (overrideResponse?: unknown | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<unknown> | unknown)) => {
  return http.get('*/auth/google/callback', async (info) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }
    return new HttpResponse(null,
      { status: 200,
        
      })
  })
}
export const getAuthMock = () => [
  getAuthJwtLoginAuthJwtLoginPostMockHandler(),
  getAuthJwtLogoutAuthJwtLogoutPostMockHandler(),
  getRegisterRegisterAuthRegisterPostMockHandler(),
  getResetForgotPasswordAuthForgotPasswordPostMockHandler(),
  getResetResetPasswordAuthResetPasswordPostMockHandler(),
  getVerifyRequestTokenAuthRequestVerifyTokenPostMockHandler(),
  getVerifyVerifyAuthVerifyPostMockHandler(),
  getOauthGoogleJwtAuthorizeAuthGoogleAuthorizeGetMockHandler(),
  getOauthGoogleJwtCallbackAuthGoogleCallbackGetMockHandler()
]