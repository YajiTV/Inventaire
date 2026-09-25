import { describe, expect, it } from 'vitest'
import { formatMoney, formatQuantity, slipNumber } from './format'

// fr-FR uses narrow no-break spaces; normalise them to compare
const plain = (s: string) => s.replace(/\s/g, ' ')

describe('format', () => {
  it('formats prices the French way', () => {
    expect(plain(formatMoney('201.60'))).toBe('201,60 €')
    expect(plain(formatMoney(1200))).toBe('1 200,00 €')
  })

  it('groups thousands in quantities', () => {
    expect(plain(formatQuantity(2051))).toBe('2 051')
  })

  it('pads slip numbers', () => {
    expect(slipNumber(7)).toBe('N° 000007')
  })
})
