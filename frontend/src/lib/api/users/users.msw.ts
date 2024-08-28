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
} from '../../../model'

export const getUsersCurrentUserUsersMeGetResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getUsersPatchCurrentUserUsersMePatchResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getUsersUserUsersIdGetResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})

export const getUsersPatchUserUsersIdPatchResponseMock = (overrideResponse: Partial< UserRead > = {}): UserRead => ({email: faker.internet.email(), id: faker.string.uuid(), is_active: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_superuser: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), is_verified: faker.helpers.arrayElement([faker.datatype.boolean(), undefined]), ...overrideResponse})


export const getUsersCurrentUserUsersMeGetMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.get('*/users/me', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersCurrentUserUsersMeGetResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersPatchCurrentUserUsersMePatchMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.patch>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.patch('*/users/me', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersPatchCurrentUserUsersMePatchResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersUserUsersIdGetMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.get>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.get('*/users/:id', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersUserUsersIdGetResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersPatchUserUsersIdPatchMockHandler = (overrideResponse?: UserRead | ((info: Parameters<Parameters<typeof http.patch>[1]>[0]) => Promise<UserRead> | UserRead)) => {
  return http.patch('*/users/:id', async (info) => {await delay(1000);
  
    return new HttpResponse(JSON.stringify(overrideResponse !== undefined 
            ? (typeof overrideResponse === "function" ? await overrideResponse(info) : overrideResponse) 
            : getUsersPatchUserUsersIdPatchResponseMock()),
      { status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
  })
}

export const getUsersDeleteUserUsersIdDeleteMockHandler = (overrideResponse?: void | ((info: Parameters<Parameters<typeof http.delete>[1]>[0]) => Promise<void> | void)) => {
  return http.delete('*/users/:id', async (info) => {await delay(1000);
  if (typeof overrideResponse === 'function') {await overrideResponse(info); }
    return new HttpResponse(null,
      { status: 204,
        
      })
  })
}
export const getUsersMock = () => [
  getUsersCurrentUserUsersMeGetMockHandler(),
  getUsersPatchCurrentUserUsersMePatchMockHandler(),
  getUsersUserUsersIdGetMockHandler(),
  getUsersPatchUserUsersIdPatchMockHandler(),
  getUsersDeleteUserUsersIdDeleteMockHandler()
]
