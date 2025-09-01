[**CRM MindiMedia API Reference v0.0.1**](../../../../README.md)

***

[CRM MindiMedia API Reference](../../../../README.md) / [domain/auth/ports](../README.md) / TokenStore

# Interface: TokenStore

Defined in: domain/auth/ports.ts:44

## Methods

### cleanupExpired()

> **cleanupExpired**(): `Promise`\<`number`\>

Defined in: domain/auth/ports.ts:83

Cleanup expired tokens

#### Returns

`Promise`\<`number`\>

***

### issueAccess()

> **issueAccess**(`sessionId`, `userId`, `expiresAt`): `Promise`\<`string`\>

Defined in: domain/auth/ports.ts:48

Issue access token baru

#### Parameters

##### sessionId

`string`

##### userId

`string`

##### expiresAt

`Date`

#### Returns

`Promise`\<`string`\>

***

### issueRefresh()

> **issueRefresh**(`sessionId`, `userId`, `expiresAt`): `Promise`\<`string`\>

Defined in: domain/auth/ports.ts:53

Issue refresh token baru

#### Parameters

##### sessionId

`string`

##### userId

`string`

##### expiresAt

`Date`

#### Returns

`Promise`\<`string`\>

***

### markReuseDetected()

> **markReuseDetected**(`tokenId`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:78

Mark token sebagai reuse detected

#### Parameters

##### tokenId

`string`

#### Returns

`Promise`\<`void`\>

***

### revokeToken()

> **revokeToken**(`tokenId`, `reason`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:73

Revoke token

#### Parameters

##### tokenId

`string`

##### reason

`string`

#### Returns

`Promise`\<`void`\>

***

### rotateRefresh()

> **rotateRefresh**(`oldToken`): `Promise`\<`string`\>

Defined in: domain/auth/ports.ts:68

Rotasi refresh token - buat baru dan revoke yang lama

#### Parameters

##### oldToken

`string`

#### Returns

`Promise`\<`string`\>

***

### verifyAccess()

> **verifyAccess**(`token`): `Promise`\<`null` \| [`TokenRecord`](../../types/interfaces/TokenRecord.md)\>

Defined in: domain/auth/ports.ts:58

Verify access token

#### Parameters

##### token

`string`

#### Returns

`Promise`\<`null` \| [`TokenRecord`](../../types/interfaces/TokenRecord.md)\>

***

### verifyRefresh()

> **verifyRefresh**(`token`): `Promise`\<[`TokenVerificationResult`](../../types/interfaces/TokenVerificationResult.md)\>

Defined in: domain/auth/ports.ts:63

Verify refresh token dengan status detection

#### Parameters

##### token

`string`

#### Returns

`Promise`\<[`TokenVerificationResult`](../../types/interfaces/TokenVerificationResult.md)\>
