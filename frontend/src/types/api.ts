export type UserRole = 'admin' | 'operator'
export type MovementType = 'in' | 'out' | 'transfer'
export type OrderStatus = 'draft' | 'sent' | 'received' | 'cancelled'

export interface ErrorResponse {
  detail: string
}

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail?: ValidationError[]
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type?: string
  expires_in: number
}

export interface UserRead {
  id: number
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface UserCreate {
  email: string
  full_name: string
  password: string
  role?: UserRole
}

export interface UserUpdate {
  full_name?: string | null
  role?: UserRole | null
  is_active?: boolean | null
}

export interface CategoryRead {
  id: number
  name: string
  description?: string | null
}

export interface CategoryCreate {
  name: string
  description?: string | null
}

export interface CategoryUpdate {
  name?: string | null
  description?: string | null
}

export interface LocationRead {
  id: number
  code: string
  name: string
  description?: string | null
}

export interface LocationCreate {
  code: string
  name: string
  description?: string | null
}

export interface LocationUpdate {
  code?: string | null
  name?: string | null
  description?: string | null
}

export interface SupplierRead {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface SupplierCreate {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface SupplierUpdate {
  name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface ProductRead {
  id: number
  sku: string
  name: string
  description?: string | null
  barcode?: string | null
  unit_price: string
  reorder_threshold: number
  total_quantity: number
  category_id: number
  supplier_id?: number | null
}

export interface ProductCreate {
  sku: string
  name: string
  description?: string | null
  barcode?: string | null
  unit_price: number | string
  reorder_threshold?: number
  category_id: number
  supplier_id?: number | null
}

export interface ProductUpdate {
  name?: string | null
  description?: string | null
  barcode?: string | null
  unit_price?: number | string | null
  reorder_threshold?: number | null
  category_id?: number | null
  supplier_id?: number | null
}

export interface ProductLookup {
  barcode: string
  name?: string | null
  description?: string | null
  image_url?: string | null
}

export interface PageProductRead {
  items: ProductRead[]
  total: number
  limit: number
  offset: number
}

export interface StockRead {
  id: number
  product_id: number
  location_id: number
  quantity: number
}

export interface StockCreate {
  product_id: number
  location_id: number
  quantity: number
}

export interface StockUpdate {
  quantity?: number | null
}

export interface StockMovementRead {
  id: number
  type: MovementType
  product_id: number
  quantity: number
  source_location_id: number | null
  target_location_id: number | null
  reason: string | null
  user_id: number
  created_at: string
}

export interface StockMovementCreate {
  type: MovementType
  product_id: number
  quantity: number
  source_location_id?: number | null
  target_location_id?: number | null
  reason?: string | null
}

export interface OrderLineRead {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: string
}

export interface OrderLineCreate {
  product_id: number
  quantity: number
  unit_price: number | string
}

export interface OrderLineUpdate {
  quantity?: number | null
  unit_price?: number | string | null
}

export interface PurchaseOrderRead {
  id: number
  reference: string
  status: OrderStatus
  supplier_id: number
  location_id: number
  lines: OrderLineRead[]
  total_price: string
  ordered_at: string
  received_at: string | null
}

export interface PurchaseOrderCreate {
  reference: string
  supplier_id: number
  location_id: number
  lines: OrderLineCreate[]
}

export interface PurchaseOrderUpdate {
  status?: OrderStatus | null
  location_id?: number | null
}

export interface ReplenishmentRequest {
  supplier_id: number
  location_id: number
  product_ids: number[]
}

export interface ReplenishmentSuggestion {
  product_id: number
  product_name: string
  current_quantity: number
  reorder_threshold: number
  suggested_quantity: number
  supplier_id: number | null
}
