import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Stocks from './Stocks'
import Movements from './Movements'
import NewMovement from './NewMovement'
import { fetchStocks } from '../api/stocks'
import { fetchMovements, createMovement } from '../api/stockMovements'
import { ApiError } from '../lib/api'

vi.mock('../api/stocks')
vi.mock('../api/stockMovements', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/stockMovements')>()
  return { ...actual, fetchMovements: vi.fn(), createMovement: vi.fn() }
})

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigate }
})

function show(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('écrans Stocks et mouvements', () => {
  afterEach(() => {
    cleanup()
    vi.resetAllMocks()
  })

  it('affiche les stocks une fois chargés', async () => {
    vi.mocked(fetchStocks).mockResolvedValue([
      { id: 1, product_id: 10, location_id: 1, quantity: 25 },
    ])
    show(<Stocks />)

    expect(screen.getByText('Chargement des stocks...')).toBeDefined()
    await waitFor(() => expect(screen.getByText('25')).toBeDefined())
  })

  it('affiche une alerte quand le chargement des stocks échoue', async () => {
    vi.mocked(fetchStocks).mockRejectedValue(new ApiError(500, 'Serveur indisponible'))
    show(<Stocks />)

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Serveur indisponible'))
  })

  it('renvoie les filtres saisis à la requête des mouvements', async () => {
    vi.mocked(fetchMovements).mockResolvedValue([])
    show(<Movements />)

    await waitFor(() => expect(fetchMovements).toHaveBeenCalled())
    fireEvent.change(screen.getByLabelText('Produit'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Type de mouvement'), { target: { value: 'out' } })

    await waitFor(() =>
      expect(vi.mocked(fetchMovements).mock.calls.at(-1)?.[0]).toMatchObject({
        productId: '10',
        type: 'out',
      }),
    )
  })

  it('affiche le détail du 409 quand le stock est insuffisant', async () => {
    vi.mocked(createMovement).mockRejectedValue(
      new ApiError(409, "Stock insuffisant sur l'emplacement d'origine."),
    )
    show(<NewMovement />)

    fireEvent.change(screen.getByLabelText('Produit'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Quantité'), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText('Emplacement de destination'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((node) => node.textContent === "Stock insuffisant sur l'emplacement d'origine."),
      ).toBe(true),
    )
    expect(navigate).not.toHaveBeenCalled()
  })

  it('redirige vers la liste après une création réussie', async () => {
    vi.mocked(createMovement).mockResolvedValue({
      id: 2,
      product_id: 10,
      type: 'in',
      quantity: 4,
      source_location_id: null,
      target_location_id: 2,
      reason: null,
      user_id: 1,
      created_at: '2026-09-16T08:00:00Z',
    })
    show(<NewMovement />)

    fireEvent.change(screen.getByLabelText('Produit'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Quantité'), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText('Emplacement de destination'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/movements'))
  })
})
