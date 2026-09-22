import { authHandlers } from './auth'
import { categoryHandlers } from './categories'
import { locationHandlers } from './locations'
import { supplierHandlers } from './suppliers'
import { userHandlers } from './users'
import { stockHandlers } from './stocks'
import { productHandlers } from './products'
import { purchaseOrderHandlers } from './purchase-orders'
import { stockMovementHandlers } from './stock-movements'
import { replenishmentHandlers } from './replenishment'

export const handlers = [...authHandlers, ...categoryHandlers, ...locationHandlers, ...supplierHandlers, ...userHandlers, ...stockHandlers, ...productHandlers, ...purchaseOrderHandlers, ...stockMovementHandlers, ...replenishmentHandlers]
