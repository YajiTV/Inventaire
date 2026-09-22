import { useFetch } from './useFetch'

type CrudApi<T, C, U> = {
  fetchAll: () => Promise<T[]>
  create: (data: C) => Promise<T>
  update: (id: number, data: U) => Promise<T>
  remove: (id: number) => Promise<void>
}

export function useCrudList<T extends { id: number }, C, U>(api: CrudApi<T, C, U>) {
  const { data: items, setData: setItems, loading, error } = useFetch(api.fetchAll, [] as T[])

  async function add(data: C) {
    const created = await api.create(data)
    setItems((prev) => [...prev, created])
  }

  async function edit(id: number, data: U) {
    const updated = await api.update(id, data)
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  async function remove(id: number) {
    await api.remove(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return { items, loading, error, add, edit, remove }
}
