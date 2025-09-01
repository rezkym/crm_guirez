[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [domain/entity](../README.md) / User

# Interface: User

Defined in: domain/entity.ts:13

## Extends

- [`TimestampFields`](../type-aliases/TimestampFields.md)

## Properties

### created\_at?

> `optional` **created\_at**: `Date`

Defined in: domain/entity.ts:4

#### Inherited from

[`TimestampFields`](../type-aliases/TimestampFields.md).[`created_at`](../type-aliases/TimestampFields.md#created_at)

***

### deleted\_at?

> `optional` **deleted\_at**: `null` \| `Date`

Defined in: domain/entity.ts:6

#### Inherited from

[`TimestampFields`](../type-aliases/TimestampFields.md).[`deleted_at`](../type-aliases/TimestampFields.md#deleted_at)

***

### email

> **email**: `string`

Defined in: domain/entity.ts:15

***

### email\_verified\_at?

> `optional` **email\_verified\_at**: `null` \| `Date`

Defined in: domain/entity.ts:17

***

### id

> **id**: `bigint`

Defined in: domain/entity.ts:14

***

### name

> **name**: `string`

Defined in: domain/entity.ts:16

***

### password

> **password**: `string`

Defined in: domain/entity.ts:18

***

### profile\_photo\_path?

> `optional` **profile\_photo\_path**: `null` \| `string`

Defined in: domain/entity.ts:24

***

### remember\_token?

> `optional` **remember\_token**: `null` \| `string`

Defined in: domain/entity.ts:21

***

### session?

> `optional` **session**: `null` \| `string`

Defined in: domain/entity.ts:23

***

### status

> **status**: [`UserStatus`](../type-aliases/UserStatus.md)

Defined in: domain/entity.ts:22

***

### two\_factor\_recovery\_codes?

> `optional` **two\_factor\_recovery\_codes**: `null` \| `string`

Defined in: domain/entity.ts:20

***

### two\_factor\_secret?

> `optional` **two\_factor\_secret**: `null` \| `string`

Defined in: domain/entity.ts:19

***

### updated\_at?

> `optional` **updated\_at**: `Date`

Defined in: domain/entity.ts:5

#### Inherited from

[`TimestampFields`](../type-aliases/TimestampFields.md).[`updated_at`](../type-aliases/TimestampFields.md#updated_at)
