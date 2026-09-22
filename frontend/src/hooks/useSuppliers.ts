import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers'
import { useCrudList } from './useCrudList'

export function useSuppliers() {
  const { items, loading, error, add, edit, remove } = useCrudList({
    fetchAll: getSuppliers,
    create: createSupplier,
    update: updateSupplier,
    remove: deleteSupplier,
  })

  return { suppliers: items, loading, error, addSupplier: add, editSupplier: edit, removeSupplier: remove }
}
