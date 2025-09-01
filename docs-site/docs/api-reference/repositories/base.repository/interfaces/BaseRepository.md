[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [repositories/base.repository](../README.md) / BaseRepository

# Interface: BaseRepository\<T, F\>

Defined in: repositories/base.repository.ts:14

## Extended by

- [`HotelRepository`](../../hotel.repository/interfaces/HotelRepository.md)
- [`UserRepository`](../../user.repository/interfaces/UserRepository.md)

## Type Parameters

### T

`T`

### F

`F` = `Partial`\<`T`\>

## Methods

### count()

> **count**(`filter`): `Promise`\<`number`\>

Defined in: repositories/base.repository.ts:22

#### Parameters

##### filter

`F`

#### Returns

`Promise`\<`number`\>

***

### create()

> **create**(`payload`): `Promise`\<`T`\>

Defined in: repositories/base.repository.ts:19

#### Parameters

##### payload

`Partial`\<`T`\>

#### Returns

`Promise`\<`T`\>

***

### delete()?

> `optional` **delete**(`id`): `Promise`\<`void`\>

Defined in: repositories/base.repository.ts:27

#### Parameters

##### id

`string` | `number`

#### Returns

`Promise`\<`void`\>

***

### findAll()?

> `optional` **findAll**(`params?`): `Promise`\<`T`[]\>

Defined in: repositories/base.repository.ts:25

#### Parameters

##### params?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`T`[]\>

***

### findById()

> **findById**(`id`): `Promise`\<`null` \| `T`\>

Defined in: repositories/base.repository.ts:15

#### Parameters

##### id

`bigint`

#### Returns

`Promise`\<`null` \| `T`\>

***

### findMany()

> **findMany**(`filter`, `options?`): `Promise`\<`T`[]\>

Defined in: repositories/base.repository.ts:17

#### Parameters

##### filter

`F`

##### options?

###### limit?

`number`

###### offset?

`number`

###### order?

`Record`\<`string`, `"ASC"` \| `"DESC"`\>

#### Returns

`Promise`\<`T`[]\>

***

### findOne()

> **findOne**(`filter`): `Promise`\<`null` \| `T`\>

Defined in: repositories/base.repository.ts:16

#### Parameters

##### filter

`F`

#### Returns

`Promise`\<`null` \| `T`\>

***

### paginate()

> **paginate**(`filter`, `page`, `pageSize`, `order?`): `Promise`\<[`Page`](../type-aliases/Page.md)\<`T`\>\>

Defined in: repositories/base.repository.ts:18

#### Parameters

##### filter

`F`

##### page

`number`

##### pageSize

`number`

##### order?

`Record`\<`string`, `"ASC"` \| `"DESC"`\>

#### Returns

`Promise`\<[`Page`](../type-aliases/Page.md)\<`T`\>\>

***

### softDeleteById()

> **softDeleteById**(`id`): `Promise`\<`void`\>

Defined in: repositories/base.repository.ts:21

#### Parameters

##### id

`bigint`

#### Returns

`Promise`\<`void`\>

***

### update()?

> `optional` **update**(`id`, `data`): `Promise`\<`T`\>

Defined in: repositories/base.repository.ts:26

#### Parameters

##### id

`string` | `number`

##### data

`Partial`\<`T`\>

#### Returns

`Promise`\<`T`\>

***

### updateById()

> **updateById**(`id`, `payload`): `Promise`\<`T`\>

Defined in: repositories/base.repository.ts:20

#### Parameters

##### id

`bigint`

##### payload

`Partial`\<`T`\>

#### Returns

`Promise`\<`T`\>
