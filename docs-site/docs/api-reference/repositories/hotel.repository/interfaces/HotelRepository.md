[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [repositories/hotel.repository](../README.md) / HotelRepository

# Interface: HotelRepository

Defined in: repositories/hotel.repository.ts:11

## Extends

- [`BaseRepository`](../../base.repository/interfaces/BaseRepository.md)\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md), [`HotelFilter`](../type-aliases/HotelFilter.md)\>

## Methods

### count()

> **count**(`filter`): `Promise`\<`number`\>

Defined in: repositories/base.repository.ts:22

#### Parameters

##### filter

[`HotelFilter`](../type-aliases/HotelFilter.md)

#### Returns

`Promise`\<`number`\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`count`](../../base.repository/interfaces/BaseRepository.md#count)

***

### create()

> **create**(`payload`): `Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

Defined in: repositories/base.repository.ts:19

#### Parameters

##### payload

`Partial`\<`T`\>

#### Returns

`Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

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

### findAll()?

> `optional` **findAll**(`params?`): `Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)[]\>

Defined in: repositories/base.repository.ts:25

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)[]\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findAll`](../../base.repository/interfaces/BaseRepository.md#findall)

***

### findById()

> **findById**(`id`): `Promise`\<`null` \| [`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

Defined in: repositories/base.repository.ts:15

#### Parameters

##### id

`bigint`

#### Returns

`Promise`\<`null` \| [`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findById`](../../base.repository/interfaces/BaseRepository.md#findbyid)

***

### findMany()

> **findMany**(`filter`, `options?`): `Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)[]\>

Defined in: repositories/base.repository.ts:17

#### Parameters

##### filter

[`HotelFilter`](../type-aliases/HotelFilter.md)

##### options?

###### limit?

`number`

###### offset?

`number`

###### order?

`Record`\<`string`, `"ASC"` \| `"DESC"`\>

#### Returns

`Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)[]\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findMany`](../../base.repository/interfaces/BaseRepository.md#findmany)

***

### findOne()

> **findOne**(`filter`): `Promise`\<`null` \| [`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

Defined in: repositories/base.repository.ts:16

#### Parameters

##### filter

[`HotelFilter`](../type-aliases/HotelFilter.md)

#### Returns

`Promise`\<`null` \| [`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`findOne`](../../base.repository/interfaces/BaseRepository.md#findone)

***

### listByOwner()

> **listByOwner**(`ownerUserId`, `page?`, `pageSize?`): `Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>\>

Defined in: repositories/hotel.repository.ts:12

#### Parameters

##### ownerUserId

`bigint`

##### page?

`number`

##### pageSize?

`number`

#### Returns

`Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>\>

***

### paginate()

> **paginate**(`filter`, `page`, `pageSize`, `order?`): `Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>\>

Defined in: repositories/base.repository.ts:18

#### Parameters

##### filter

[`HotelFilter`](../type-aliases/HotelFilter.md)

##### page

`number`

##### pageSize

`number`

##### order?

`Record`\<`string`, `"ASC"` \| `"DESC"`\>

#### Returns

`Promise`\<[`Page`](../../base.repository/type-aliases/Page.md)\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>\>

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

> `optional` **update**(`id`, `data`): `Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

Defined in: repositories/base.repository.ts:26

#### Parameters

##### id

`string` | `number`

##### data

`Partial`\<`T`\>

#### Returns

`Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`update`](../../base.repository/interfaces/BaseRepository.md#update)

***

### updateById()

> **updateById**(`id`, `payload`): `Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

Defined in: repositories/base.repository.ts:20

#### Parameters

##### id

`bigint`

##### payload

`Partial`\<`T`\>

#### Returns

`Promise`\<[`Hotel`](../../../domain/entity/interfaces/Hotel.md)\>

#### Inherited from

[`BaseRepository`](../../base.repository/interfaces/BaseRepository.md).[`updateById`](../../base.repository/interfaces/BaseRepository.md#updatebyid)
