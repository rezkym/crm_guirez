[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [services/auth.service](../README.md) / AuthService

# Class: AuthService

Defined in: services/auth.service.ts:47

## Constructors

### Constructor

> **new AuthService**(`userRepo`, `sessionStore`, `tokenService`, `passwordService`, `rateLimitService`): `AuthService`

Defined in: services/auth.service.ts:48

#### Parameters

##### userRepo

[`UserCredentialsRepository`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md)

##### sessionStore

[`SessionStore`](../../../domain/auth/ports/interfaces/SessionStore.md)

##### tokenService

[`TokenService`](../../token.service/classes/TokenService.md)

##### passwordService

`PasswordService`

##### rateLimitService

`RateLimitService`

#### Returns

`AuthService`

## Methods

### cleanup()

> **cleanup**(): `Promise`\<\{ `sessionsRevoked`: `number`; `tokensCleaned`: `number`; \}\>

Defined in: services/auth.service.ts:310

Cleanup expired sessions dan tokens

#### Returns

`Promise`\<\{ `sessionsRevoked`: `number`; `tokensCleaned`: `number`; \}\>

***

### createAuthContext()

> **createAuthContext**(`accessToken`): `Promise`\<`null` \| [`AuthContext`](../../../domain/auth/types/interfaces/AuthContext.md)\>

Defined in: services/auth.service.ts:284

Create auth context untuk middleware

#### Parameters

##### accessToken

`string`

#### Returns

`Promise`\<`null` \| [`AuthContext`](../../../domain/auth/types/interfaces/AuthContext.md)\>

***

### login()

> **login**(`request`): `Promise`\<[`LoginResult`](../interfaces/LoginResult.md)\>

Defined in: services/auth.service.ts:59

Login user dengan email/password

#### Parameters

##### request

[`LoginRequest`](../interfaces/LoginRequest.md)

#### Returns

`Promise`\<[`LoginResult`](../interfaces/LoginResult.md)\>

***

### logout()

> **logout**(`accessToken`): `Promise`\<`void`\>

Defined in: services/auth.service.ts:232

Logout user

#### Parameters

##### accessToken

`string`

#### Returns

`Promise`\<`void`\>

***

### me()

> **me**(`accessToken`): `Promise`\<[`MeResult`](../interfaces/MeResult.md)\>

Defined in: services/auth.service.ts:254

Get user info dari access token

#### Parameters

##### accessToken

`string`

#### Returns

`Promise`\<[`MeResult`](../interfaces/MeResult.md)\>

***

### refresh()

> **refresh**(`refreshToken`, `requestId?`, `userAgent?`, `ipAddress?`): `Promise`\<[`RefreshResult`](../../../domain/auth/types/interfaces/RefreshResult.md)\>

Defined in: services/auth.service.ts:168

Refresh tokens

#### Parameters

##### refreshToken

`string`

##### requestId?

`string`

##### userAgent?

`string`

##### ipAddress?

`string`

#### Returns

`Promise`\<[`RefreshResult`](../../../domain/auth/types/interfaces/RefreshResult.md)\>
