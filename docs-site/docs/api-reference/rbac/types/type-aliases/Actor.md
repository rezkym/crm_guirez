[**CRM MindiMedia API Reference v0.0.1**](../../../README.md)

***

[CRM MindiMedia API Reference](../../../README.md) / [rbac/types](../README.md) / Actor

# Type Alias: Actor

> **Actor** = `object`

Defined in: rbac/types.ts:5

## Properties

### email

> **email**: `string`

Defined in: rbac/types.ts:7

***

### id

> **id**: `bigint`

Defined in: rbac/types.ts:6

***

### isSuperadmin?

> `optional` **isSuperadmin**: `boolean`

Defined in: rbac/types.ts:10

***

### permissions?

> `optional` **permissions**: `object`[]

Defined in: rbac/types.ts:9

#### action

> **action**: [`PermissionAction`](../../enums/enumerations/PermissionAction.md)

#### hotel\_id?

> `optional` **hotel\_id**: `bigint` \| `null`

#### resource

> **resource**: [`PermissionResource`](../../enums/enumerations/PermissionResource.md)

***

### roles

> **roles**: `object`[]

Defined in: rbac/types.ts:8

#### hotel\_id?

> `optional` **hotel\_id**: `bigint` \| `null`

#### slug

> **slug**: [`RoleSlug`](../../enums/enumerations/RoleSlug.md)
