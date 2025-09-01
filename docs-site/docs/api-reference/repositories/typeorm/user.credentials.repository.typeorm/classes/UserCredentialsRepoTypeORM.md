[**CRM MindiMedia API Reference v0.0.1**](../../../../README.md)

***

[CRM MindiMedia API Reference](../../../../README.md) / [repositories/typeorm/user.credentials.repository.typeorm](../README.md) / UserCredentialsRepoTypeORM

# Class: UserCredentialsRepoTypeORM

Defined in: repositories/typeorm/user.credentials.repository.typeorm.ts:9

## Implements

- [`UserCredentialsRepository`](../../../../domain/auth/ports/interfaces/UserCredentialsRepository.md)

## Constructors

### Constructor

> **new UserCredentialsRepoTypeORM**(`dataSource`): `UserCredentialsRepoTypeORM`

Defined in: repositories/typeorm/user.credentials.repository.typeorm.ts:10

#### Parameters

##### dataSource

`DataSource`

#### Returns

`UserCredentialsRepoTypeORM`

## Methods

### findByEmail()

> **findByEmail**(`email`): `Promise`\<`null` \| [`UserCredentials`](../../../../domain/auth/types/interfaces/UserCredentials.md)\>

Defined in: repositories/typeorm/user.credentials.repository.typeorm.ts:12

Cari user berdasarkan email

#### Parameters

##### email

`string`

#### Returns

`Promise`\<`null` \| [`UserCredentials`](../../../../domain/auth/types/interfaces/UserCredentials.md)\>

#### Implementation of

[`UserCredentialsRepository`](../../../../domain/auth/ports/interfaces/UserCredentialsRepository.md).[`findByEmail`](../../../../domain/auth/ports/interfaces/UserCredentialsRepository.md#findbyemail)

***

### findById()

> **findById**(`userId`): `Promise`\<`null` \| [`UserCredentials`](../../../../domain/auth/types/interfaces/UserCredentials.md)\>

Defined in: repositories/typeorm/user.credentials.repository.typeorm.ts:46

Cari user berdasarkan ID

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`null` \| [`UserCredentials`](../../../../domain/auth/types/interfaces/UserCredentials.md)\>

#### Implementation of

[`UserCredentialsRepository`](../../../../domain/auth/ports/interfaces/UserCredentialsRepository.md).[`findById`](../../../../domain/auth/ports/interfaces/UserCredentialsRepository.md#findbyid)

***

### updateLastLogin()

> **updateLastLogin**(`userId`): `Promise`\<`void`\>

Defined in: repositories/typeorm/user.credentials.repository.typeorm.ts:80

Update last login time

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`UserCredentialsRepository`](../../../../domain/auth/ports/interfaces/UserCredentialsRepository.md).[`updateLastLogin`](../../../../domain/auth/ports/interfaces/UserCredentialsRepository.md#updatelastlogin)
