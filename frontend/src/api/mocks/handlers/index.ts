import { authHandlers } from './auth'
import {categoryHandlers} from './categories'
import {locationHandlers} from './locations'
import { supplierHandlers } from './suppliers'
import { userHandlers } from './users'
import { stockHandlers } from './stocks'

export const handlers = [...authHandlers, ...categoryHandlers, ...locationHandlers, ...supplierHandlers, ...userHandlers, ...stockHandlers]
