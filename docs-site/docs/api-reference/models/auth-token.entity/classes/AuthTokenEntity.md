[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [models/auth-token.entity](../README.md) / AuthTokenEntity

# Class: AuthTokenEntity

Defined in: models/auth-token.entity.ts:9

## Constructors

### Constructor

> **new AuthTokenEntity**(): `AuthTokenEntity`

#### Returns

`AuthTokenEntity`

## Properties

### expiresAt

> **expiresAt**: `Date`

Defined in: models/auth-token.entity.ts:29

***

### issuedAt

> **issuedAt**: `Date`

Defined in: models/auth-token.entity.ts:26

***

### revokedAt

> **revokedAt**: `null` \| `Date`

Defined in: models/auth-token.entity.ts:32

***

### rotatedFrom

> **rotatedFrom**: `null` \| `string`

Defined in: models/auth-token.entity.ts:35

***

### session

> **session**: [`AuthSessionEntity`](../../auth-session.entity/classes/AuthSessionEntity.md)

Defined in: models/auth-token.entity.ts:40

***

### sessionId

> **sessionId**: `string`

Defined in: models/auth-token.entity.ts:14

***

### tokenHash

> **tokenHash**: `Buffer`

Defined in: models/auth-token.entity.ts:23

***

### tokenId

> **tokenId**: `string`

Defined in: models/auth-token.entity.ts:11

***

### type

> **type**: `"access"` \| `"refresh"`

Defined in: models/auth-token.entity.ts:20

***

### userId

> **userId**: `number`

Defined in: models/auth-token.entity.ts:17
