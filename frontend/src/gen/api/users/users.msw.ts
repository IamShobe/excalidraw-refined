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
  UserRead
} from '../../model'

export const getUsersCurrentUserApiV1UsersMeGetResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getUsersPatchCurrentUserApiV1UsersMePatchResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getUsersUserApiV1UsersIdGetResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getUsersPatchUserApiV1UsersIdPatchResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})


export const getUsersCurrentUserApiV1UsersMeGetMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.get('*/api/v1/users/me', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersCurrentUserApiV1UsersMeGetResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersPatchCurrentUserApiV1UsersMePatchMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.patch>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.patch('*/api/v1/users/me', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersPatchCurrentUserApiV1UsersMePatchResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersUserApiV1UsersIdGetMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.get('*/api/v1/users/:id', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersUserApiV1UsersIdGetResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersPatchUserApiV1UsersIdPatchMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.patch>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.patch('*/api/v1/users/:id', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersPatchUserApiV1UsersIdPatchResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersDeleteUserApiV1UsersIdDeleteMockHandler = (overrideResponse?: void | ((info: Parameters<Parameters<typeof http.delete>[1]>[0]) => Promise<void> | void)) => {
  return http.delete('*/api/v1/users/:id', async (info) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }
    return new HttpResponse(null,
      { status: 204,
        
      })
  })
}
export const getUsersMock = () => [
  getUsersCurrentUserApiV1UsersMeGetMockHandler(),
  getUsersPatchCurrentUserApiV1UsersMePatchMockHandler(),
  getUsersUserApiV1UsersIdGetMockHandler(),
  getUsersPatchUserApiV1UsersIdPatchMockHandler(),
  getUsersDeleteUserApiV1UsersIdDeleteMockHandler()
]
