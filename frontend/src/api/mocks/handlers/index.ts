import { authHandlers } from './auth'
import {categoryHandlers} from './categories'
import {locationHandlers} from './locations'

export const handlers = [...authHandlers, ...categoryHandlers, ...locationHandlers]
