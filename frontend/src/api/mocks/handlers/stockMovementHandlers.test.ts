import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './index'

const server = setupServer(...handlers)
const BASE = 'http://localhost:8000'

async function postMovement(body: unknown) {
  return fetch(`${BASE}/stock-movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function quantityAt(productId: number, locationId: number) {
  const stocks = await (await fetch(`${BASE}/stocks`)).json()
  return stocks.find(
    (s: { product_id: number; location_id: number }) =>
      s.product_id === productId && s.location_id === locationId,
  )?.quantity
}

describe('handler stock-movements', () => {
  beforeAll(() => server.listen())
  afterAll(() => server.close())

  it('refuse une sortie superieure au stock avec un 409 et son detail', async () => {
    const response = await postMovement({
      product_id: 1,
      type: 'out',
      quantity: 9999,
      source_location_id: 1,
    })

    expect(response.status).toBe(409)
    expect((await response.json()).detail).toContain('Stock insuffisant')
  })

  it('applique une entree au stock', async () => {
    const before = await quantityAt(1, 1)
    const response = await postMovement({
      product_id: 1,
      type: 'in',
      quantity: 5,
      target_location_id: 1,
    })

    expect(response.status).toBe(201)
    expect(await quantityAt(1, 1)).toBe(before + 5)
  })

  it('deplace la quantite lors d un transfert', async () => {
    const beforeSource = await quantityAt(1, 1)
    const response = await postMovement({
      product_id: 1,
      type: 'transfer',
      quantity: 3,
      source_location_id: 1,
      target_location_id: 2,
    })

    expect(response.status).toBe(201)
    expect(await quantityAt(1, 1)).toBe(beforeSource - 3)
    expect(await quantityAt(1, 2)).toBe(3)
  })

  it('filtre l historique par type', async () => {
    const all = await (await fetch(`${BASE}/stock-movements`)).json()
    const onlyIn = await (await fetch(`${BASE}/stock-movements?type=in`)).json()

    expect(onlyIn.length).toBeLessThan(all.length)
    expect(onlyIn.every((m: { type: string }) => m.type === 'in')).toBe(true)
  })
})
