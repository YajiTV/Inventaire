import { authHandlers } from './auth'
import {categoryHandlers} from './categories'
import {locationHandlers} from './locations'
import { supplierHandlers } from './suppliers'

export const handlers = [...authHandlers, ...categoryHandlers, ...locationHandlers, ...supplierHandlers]
