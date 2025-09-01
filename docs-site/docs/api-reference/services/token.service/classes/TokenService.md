[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [services/token.service](../README.md) / TokenService

# Class: TokenService

Defined in: services/token.service.ts:8

## Constructors

### Constructor

> **new TokenService**(`tokenStore`, `sessionStore`): `TokenService`

Defined in: services/token.service.ts:9

#### Parameters

##### tokenStore

[`TokenStore`](../../../domain/auth/ports/interfaces/TokenStore.md)

##### sessionStore

[`SessionStore`](../../../domain/auth/ports/interfaces/SessionStore.md)

#### Returns

`TokenService`

## Methods

### cleanupExpiredTokens()

> **cleanupExpiredTokens**(): `Promise`\<\{ `tokensCleaned`: `number`; \}\>

Defined in: services/token.service.ts:133

Cleanup expired tokens

#### Returns

`Promise`\<\{ `tokensCleaned`: `number`; \}\>

***

### issueTokenPair()

> **issueTokenPair**(`sessionId`, `userId`): `Promise`\<[`TokenPair`](../../../domain/auth/types/interfaces/TokenPair.md)\>

Defined in: services/token.service.ts:17

Issue access & refresh token pair untuk session baru

#### Parameters

##### sessionId

`string`

##### userId

`string`

#### Returns

`Promise`\<[`TokenPair`](../../../domain/auth/types/interfaces/TokenPair.md)\>

***

### refreshTokens()

> **refreshTokens**(`refreshToken`): `Promise`\<[`RefreshResult`](../../../domain/auth/types/interfaces/RefreshResult.md)\>

Defined in: services/token.service.ts:37

Refresh access token menggunakan refresh token

#### Parameters

##### refreshToken

`string`

#### Returns

`Promise`\<[`RefreshResult`](../../../domain/auth/types/interfaces/RefreshResult.md)\>

***

### revokeAccessToken()

> **revokeAccessToken**(`token`): `Promise`\<`void`\>

Defined in: services/token.service.ts:110

Revoke access token (untuk logout)

#### Parameters

##### token

`string`

#### Returns

`Promise`\<`void`\>

***

### revokeAllTokensForSession()

> **revokeAllTokensForSession**(`sessionId`): `Promise`\<`void`\>

Defined in: services/token.service.ts:121

Revoke semua tokens untuk session (untuk logout atau security)

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

***

### verifyAccessToken()

> **verifyAccessToken**(`token`): `Promise`\<`null` \| \{ `session`: [`Session`](../../../domain/auth/types/interfaces/Session.md); `tokenRecord`: [`TokenRecord`](../../../domain/auth/types/interfaces/TokenRecord.md); \}\>

Defined in: services/token.service.ts:87

Verify access token dan return auth context

#### Parameters

##### token

`string`

#### Returns

`Promise`\<`null` \| \{ `session`: [`Session`](../../../domain/auth/types/interfaces/Session.md); `tokenRecord`: [`TokenRecord`](../../../domain/auth/types/interfaces/TokenRecord.md); \}\>
