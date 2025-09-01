[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [controllers/auth.controller](../README.md) / AuthController

# Class: AuthController

Defined in: controllers/auth.controller.ts:11

## Constructors

### Constructor

> **new AuthController**(`authService`): `AuthController`

Defined in: controllers/auth.controller.ts:12

#### Parameters

##### authService

[`AuthService`](../../../services/auth.service/classes/AuthService.md)

#### Returns

`AuthController`

## Methods

### login()

> **login**(`req`, `res`): `Promise`\<`void`\>

Defined in: controllers/auth.controller.ts:17

POST /api/v1/auth/login

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### logout()

> **logout**(`req`, `res`): `Promise`\<`void`\>

Defined in: controllers/auth.controller.ts:128

POST /api/v1/auth/logout
Requires: Authorization header dengan valid access token

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### me()

> **me**(`req`, `res`): `Promise`\<`void`\>

Defined in: controllers/auth.controller.ts:157

GET /api/v1/auth/me
Requires: Authorization header dengan valid access token

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>

***

### refresh()

> **refresh**(`req`, `res`): `Promise`\<`void`\>

Defined in: controllers/auth.controller.ts:74

POST /api/v1/auth/refresh

#### Parameters

##### req

`Request`

##### res

`Response`

#### Returns

`Promise`\<`void`\>
