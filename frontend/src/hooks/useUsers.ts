import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users'
import { useCrudList } from './useCrudList'

export function useUsers() {
  const { items, loading, error, add, edit, remove } = useCrudList({
    fetchAll: fetchUsers,
    create: createUser,
    update: updateUser,
    remove: deleteUser,
  })

  return { users: items, loading, error, addUser: add, editUser: edit, removeUser: remove }
}
