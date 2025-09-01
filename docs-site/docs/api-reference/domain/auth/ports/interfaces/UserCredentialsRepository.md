[**CRM MindiMedia API Reference v0.0.1**](../../../../README.md)

***

[CRM MindiMedia API Reference](../../../../README.md) / [domain/auth/ports](../README.md) / UserCredentialsRepository

# Interface: UserCredentialsRepository

Defined in: domain/auth/ports.ts:86

## Methods

### findByEmail()

> **findByEmail**(`email`): `Promise`\<`null` \| [`UserCredentials`](../../types/interfaces/UserCredentials.md)\>

Defined in: domain/auth/ports.ts:90

Cari user berdasarkan email

#### Parameters

##### email

`string`

#### Returns

`Promise`\<`null` \| [`UserCredentials`](../../types/interfaces/UserCredentials.md)\>

***

### findById()

> **findById**(`userId`): `Promise`\<`null` \| [`UserCredentials`](../../types/interfaces/UserCredentials.md)\>

Defined in: domain/auth/ports.ts:95

Cari user berdasarkan ID

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`null` \| [`UserCredentials`](../../types/interfaces/UserCredentials.md)\>

***

### updateLastLogin()

> **updateLastLogin**(`userId`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:100

Update last login time

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`void`\>
