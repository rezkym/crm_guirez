[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [repositories/user.credentials.repository](../README.md) / MemoryUserCredentialsRepository

# Class: MemoryUserCredentialsRepository

Defined in: repositories/user.credentials.repository.ts:7

## Implements

- [`UserCredentialsRepository`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md)

## Constructors

### Constructor

> **new MemoryUserCredentialsRepository**(): `MemoryUserCredentialsRepository`

Defined in: repositories/user.credentials.repository.ts:11

#### Returns

`MemoryUserCredentialsRepository`

## Methods

### createUser()

> **createUser**(`userData`): `Promise`\<[`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

Defined in: repositories/user.credentials.repository.ts:78

#### Parameters

##### userData

`Omit`\<[`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md), `"id"`\>

#### Returns

`Promise`\<[`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

***

### deleteUser()

> **deleteUser**(`userId`): `Promise`\<`boolean`\>

Defined in: repositories/user.credentials.repository.ts:110

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### findByEmail()

> **findByEmail**(`email`): `Promise`\<`null` \| [`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

Defined in: repositories/user.credentials.repository.ts:53

Cari user berdasarkan email

#### Parameters

##### email

`string`

#### Returns

`Promise`\<`null` \| [`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

#### Implementation of

[`UserCredentialsRepository`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md).[`findByEmail`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md#findbyemail)

***

### findById()

> **findById**(`userId`): `Promise`\<`null` \| [`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

Defined in: repositories/user.credentials.repository.ts:63

Cari user berdasarkan ID

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`null` \| [`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

#### Implementation of

[`UserCredentialsRepository`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md).[`findById`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md#findbyid)

***

### getAllUsersForDebug()

> **getAllUsersForDebug**(): [`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)[]

Defined in: repositories/user.credentials.repository.ts:124

#### Returns

[`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)[]

***

### getUserCount()

> **getUserCount**(): `number`

Defined in: repositories/user.credentials.repository.ts:128

#### Returns

`number`

***

### updateLastLogin()

> **updateLastLogin**(`userId`): `Promise`\<`void`\>

Defined in: repositories/user.credentials.repository.ts:67

Update last login time

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`UserCredentialsRepository`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md).[`updateLastLogin`](../../../domain/auth/ports/interfaces/UserCredentialsRepository.md#updatelastlogin)

***

### updateUser()

> **updateUser**(`userId`, `updates`): `Promise`\<`null` \| [`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

Defined in: repositories/user.credentials.repository.ts:91

#### Parameters

##### userId

`string`

##### updates

`Partial`\<[`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>

#### Returns

`Promise`\<`null` \| [`UserCredentials`](../../../domain/auth/types/interfaces/UserCredentials.md)\>
