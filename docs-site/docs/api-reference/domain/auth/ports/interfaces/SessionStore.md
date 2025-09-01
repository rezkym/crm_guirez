[**CRM MindiMedia API Reference v0.0.1**](../../../../README.md)

***

[CRM MindiMedia API Reference](../../../../README.md) / [domain/auth/ports](../README.md) / SessionStore

# Interface: SessionStore

Defined in: domain/auth/ports.ts:7

## Methods

### cleanupExpired()

> **cleanupExpired**(): `Promise`\<`number`\>

Defined in: domain/auth/ports.ts:41

Cleanup expired sessions

#### Returns

`Promise`\<`number`\>

***

### createSession()

> **createSession**(`userId`, `userAgent?`, `ipAddress?`, `expiresAt?`): `Promise`\<[`Session`](../../types/interfaces/Session.md)\>

Defined in: domain/auth/ports.ts:11

Buat session baru untuk user

#### Parameters

##### userId

`string`

##### userAgent?

`string`

##### ipAddress?

`string`

##### expiresAt?

`Date`

#### Returns

`Promise`\<[`Session`](../../types/interfaces/Session.md)\>

***

### getSessionById()

> **getSessionById**(`sessionId`): `Promise`\<`null` \| [`Session`](../../types/interfaces/Session.md)\>

Defined in: domain/auth/ports.ts:16

Ambil session berdasarkan ID

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`null` \| [`Session`](../../types/interfaces/Session.md)\>

***

### listSessionsByUser()

> **listSessionsByUser**(`userId`): `Promise`\<[`Session`](../../types/interfaces/Session.md)[]\>

Defined in: domain/auth/ports.ts:26

Ambil semua session aktif untuk user

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<[`Session`](../../types/interfaces/Session.md)[]\>

***

### revokeSession()

> **revokeSession**(`sessionId`, `reason`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:21

Revoke/batalkan session

#### Parameters

##### sessionId

`string`

##### reason

[`SessionRevokeReason`](../../types/enumerations/SessionRevokeReason.md)

#### Returns

`Promise`\<`void`\>

***

### touchSession()

> **touchSession**(`sessionId`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:31

Update last access time untuk session

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

***

### updateSessionActivity()

> **updateSessionActivity**(`sessionId`, `userAgent?`, `ipAddress?`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:36

Update session dengan UA/IP tracking dan anomaly detection

#### Parameters

##### sessionId

`string`

##### userAgent?

`string`

##### ipAddress?

`string`

#### Returns

`Promise`\<`void`\>
