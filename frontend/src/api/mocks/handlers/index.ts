import { authHandlers } from './auth'
import {categoryHandlers} from './categories'

export const handlers = [...authHandlers, ...categoryHandlers]
