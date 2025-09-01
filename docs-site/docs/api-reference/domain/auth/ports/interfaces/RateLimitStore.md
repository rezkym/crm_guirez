[**CRM MindiMedia API Reference v0.0.1**](../../../../README.md)

***

[CRM MindiMedia API Reference](../../../../README.md) / [domain/auth/ports](../README.md) / RateLimitStore

# Interface: RateLimitStore

Defined in: domain/auth/ports.ts:103

## Methods

### blockKey()

> **blockKey**(`key`, `duration`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:122

Block key untuk durasi tertentu

#### Parameters

##### key

`string`

##### duration

`number`

#### Returns

`Promise`\<`void`\>

***

### cleanupExpired()

> **cleanupExpired**(): `Promise`\<`number`\>

Defined in: domain/auth/ports.ts:132

Cleanup expired records

#### Returns

`Promise`\<`number`\>

***

### getAttemptCount()

> **getAttemptCount**(`key`): `Promise`\<`number`\>

Defined in: domain/auth/ports.ts:117

Get attempt count dalam window

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`number`\>

***

### isBlocked()

> **isBlocked**(`key`): `Promise`\<`boolean`\>

Defined in: domain/auth/ports.ts:112

Check apakah key sudah di-block

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`boolean`\>

***

### recordAttempt()

> **recordAttempt**(`key`, `success`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:107

Record login attempt

#### Parameters

##### key

`string`

##### success

`boolean`

#### Returns

`Promise`\<`void`\>

***

### resetAttempts()

> **resetAttempts**(`key`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:127

Reset attempts untuk key

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>
