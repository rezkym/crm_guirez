[**CRM MindiMedia API Reference v0.0.1**](../../../../README.md)

***

[CRM MindiMedia API Reference](../../../../README.md) / [domain/auth/ports](../README.md) / AuditLogger

# Interface: AuditLogger

Defined in: domain/auth/ports.ts:135

## Methods

### logLoginAttempt()

> **logLoginAttempt**(`attempt`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:139

Log login attempt

#### Parameters

##### attempt

[`LoginAttempt`](../../types/interfaces/LoginAttempt.md)

#### Returns

`Promise`\<`void`\>

***

### logSecurityEvent()

> **logSecurityEvent**(`event`, `data`, `requestId?`): `Promise`\<`void`\>

Defined in: domain/auth/ports.ts:144

Log security event

#### Parameters

##### event

`string`

##### data

`any`

##### requestId?

`string`

#### Returns

`Promise`\<`void`\>
