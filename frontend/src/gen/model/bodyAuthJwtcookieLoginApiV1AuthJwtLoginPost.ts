/**
 * Generated by orval v7.0.1 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import type { BodyAuthJwtcookieLoginApiV1AuthJwtLoginPostClientId } from './bodyAuthJwtcookieLoginApiV1AuthJwtLoginPostClientId';
import type { BodyAuthJwtcookieLoginApiV1AuthJwtLoginPostClientSecret } from './bodyAuthJwtcookieLoginApiV1AuthJwtLoginPostClientSecret';
import type { BodyAuthJwtcookieLoginApiV1AuthJwtLoginPostGrantType } from './bodyAuthJwtcookieLoginApiV1AuthJwtLoginPostGrantType';

export interface BodyAuthJwtcookieLoginApiV1AuthJwtLoginPost {
  client_id?: BodyAuthJwtcookieLoginApiV1AuthJwtLoginPostClientId;
  client_secret?: BodyAuthJwtcookieLoginApiV1AuthJwtLoginPostClientSecret;
  grant_type?: BodyAuthJwtcookieLoginApiV1AuthJwtLoginPostGrantType;
  password: string;
  scope?: string;
  username: string;
}