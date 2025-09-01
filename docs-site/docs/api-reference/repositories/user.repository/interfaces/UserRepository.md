[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [repositories/user.repository](../README.md) / UserRepository

# Interface: UserRepository

Defined in: repositories/user.repository.ts:12

## Extends

- [`BaseRepository`](../../base.repository/interfaces/BaseRepository.md)\<[`User`](../../../domain/entity/interfaces/User.md), [`UserFilter`](../type-aliases/UserFilter.md)\>

## Methods

### attachToHotel()

> **attachToHotel**(`userId`, `hotelId`, `role?`): `Promise`\<`void`\>

Defined in: repositories/user.repository.ts:18

#### Parameters

##### userId

`bigint`

##### hotelId

`bigint`

##### role?

[`RoleSlug`](../../../rbac/enums/enumerations/RoleSlug.md)

#### Returns

`Promise`\<`void`\>

***

### count()

> **count**(`filter`): `Promise`\<`number`\>

Defined in: repositories/base.repository.ts:22

#### Parameters

##### filter

[`UserFilter`](../type-aliases/UserFilter.md)

#### Returns

`Promise`\<`number`\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`count`](../../base.repository/interfaces/BaseRepository.md#count)

***

### create()

> **create**(`payload`): `Promise`\<[`User`](../../../domain/entity/interfaces/User.md)\>

Defined in: repositories/base.repository.ts:19

#### Parameters

##### payload

`Partial`\<`T`\>

#### Returns

`Promise`\<[`User`](../../../domain/entity/interfaces/User.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`create`](../../base.repository/interfaces/BaseRepository.md#create)

***

### delete()?

> `optional` **delete**(`id`): `Promise`\<`void`\>

Defined in: repositories/base.repository.ts:27

#### Parameters

##### id

`string` | `number`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`delete`](../../base.repository/interfaces/BaseRepository.md#delete)

***

### detachFromHotel()

> **detachFromHotel**(`userId`, `hotelId`): `Promise`\<`void`\>

Defined in: repositories/user.repository.ts:19

#### Parameters

##### userId

`bigint`

##### hotelId

`bigint`

#### Returns

`Promise`\<`void`\>

***

### findAll()?

> `optional` **findAll**(`params?`): `Promise`\<[`User`](../../../domain/entity/interfaces/User.md)[]\>

Defined in: repositories/base.repository.ts:25

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<[`User`](../../../domain/entity/interfaces/User.md)[]\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findAll`](../../base.repository/interfaces/BaseRepository.md#findall)

***

### findByEmail()

> **findByEmail**(`email`): `Promise`\<`null` \| [`User`](../../../domain/entity/interfaces/User.md)\>

Defined in: repositories/user.repository.ts:13

#### Parameters

##### email

`string`

#### Returns

`Promise`\<`null` \| [`User`](../../../domain/entity/interfaces/User.md)\>

***

### findById()

> **findById**(`id`): `Promise`\<`null` \| [`User`](../../../domain/entity/interfaces/User.md)\>

Defined in: repositories/base.repository.ts:15

#### Parameters

##### id

`bigint`

#### Returns

`Promise`\<`null` \| [`User`](../../../domain/entity/interfaces/User.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findById`](../../base.repository/interfaces/BaseRepository.md#findbyid)

***

### findMany()

> **findMany**(`filter`, `options?`): `Promise`\<[`User`](../../../domain/entity/interfaces/User.md)[]\>

Defined in: repositories/base.repository.ts:17

#### Parameters

##### filter

[`UserFilter`](../type-aliases/UserFilter.md)

##### options?

###### limit?

`number`

###### offset?

`number`

###### order?

`Record`\<`string`, `"ASC"` \| `"DESC"`\>

#### Returns

`Promise`\<[`User`](../../../domain/entity/interfaces/User.md)[]\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findMany`](../../base.repository/interfaces/BaseRepository.md#findmany)

***

### findOne()

> **findOne**(`filter`): `Promise`\<`null` \| [`User`](../../../domain/entity/interfaces/User.md)\>

Defined in: repositories/base.repository.ts:16

#### Parameters

##### filter

[`UserFilter`](../type-aliases/UserFilter.md)

#### Returns

`Promise`\<`null` \| [`User`](../../../domain/entity/interfaces/User.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findOne`](../../base.repository/interfaces/BaseRepository.md#findone)

***

### listByHotel()

> **listByHotel**(`hotelId`, `options?`): `Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`User`](../../../domain/entity/interfaces/User.md)\>\>

Defined in: repositories/user.repository.ts:14

#### Parameters

##### hotelId

`bigint`

##### options?

###### page?

`number`

###### pageSize?

`number`

#### Returns

`Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`User`](../../../domain/entity/interfaces/User.md)\>\>

***

### paginate()

> **paginate**(`filter`, `page`, `pageSize`, `order?`): `Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`User`](../../../domain/entity/interfaces/User.md)\>\>

Defined in: repositories/base.repository.ts:18

#### Parameters

##### filter

[`UserFilter`](../type-aliases/UserFilter.md)

##### page

`number`

##### pageSize

`number`

##### order?

`Record`\<`string`, `"ASC"` \| `"DESC"`\>

#### Returns

`Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`User`](../../../domain/entity/interfaces/User.md)\>\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`paginate`](../../base.repository/interfaces/BaseRepository.md#paginate)

***

### softDeleteById()

> **softDeleteById**(`id`): `Promise`\<`void`\>

Defined in: repositories/base.repository.ts:21

#### Parameters

##### id

`bigint`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`softDeleteById`](../../base.repository/interfaces/BaseRepository.md#softdeletebyid)

***

### update()?

> `optional` **update**(`id`, `data`): `Promise`\<[`User`](../../../domain/entity/interfaces/User.md)\>

Defined in: repositories/base.repository.ts:26

#### Parameters

##### id

`string` | `number`

##### data

`Partial`\<`T`\>

#### Returns

`Promise`\<[`User`](../../../domain/entity/interfaces/User.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`update`](../../base.repository/interfaces/BaseRepository.md#update)

***

### updateById()

> **updateById**(`id`, `payload`): `Promise`\<[`User`](../../../domain/entity/interfaces/User.md)\>

Defined in: repositories/base.repository.ts:20

#### Parameters

##### id

`bigint`

##### payload

`Partial`\<`T`\>

#### Returns

`Promise`\<[`User`](../../../domain/entity/interfaces/User.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`updateById`](../../base.repository/interfaces/BaseRepository.md#updatebyid)
