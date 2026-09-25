const MONEY = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const QUANTITY = new Intl.NumberFormat('fr-FR')

// API prices arrive as strings ("201.60"), quantities as numbers
export function formatMoney(value: number | string): string {
  return MONEY.format(Number(value))
}

export function formatQuantity(value: number): string {
  return QUANTITY.format(value)
}

// Movement slip number printed in red, from the movement id
export function slipNumber(id: number): string {
  return `N° ${String(id).padStart(6, '0')}`
}
