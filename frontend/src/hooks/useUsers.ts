import { useEffect, useState } from 'react'
import { fetchUsers, createUser, updateUser } from '../api/users'
import type { UserCreate, UserRead, UserUpdate } from '../types/api'

export function useUsers() {
  const [users, setUsers] = useState<UserRead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchUsers()
      .then((data) => {
        if (cancelled) return
        setUsers(data)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function addUser(data: UserCreate) {
    const created = await createUser(data)
    setUsers((prev) => [...prev, created])
  }

  async function editUser(id: number, data: UserUpdate) {
    const updated = await updateUser(id, data)
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
  }

  return { users, loading, error, addUser, editUser }
}
