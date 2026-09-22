import { fetchLocations, createLocation, updateLocation, deleteLocation } from '../api/locations'
import { useCrudList } from './useCrudList'

export function useLocations() {
  const { items, loading, error, add, edit, remove } = useCrudList({
    fetchAll: fetchLocations,
    create: createLocation,
    update: updateLocation,
    remove: deleteLocation,
  })

  return { locations: items, loading, error, addLocation: add, editLocation: edit, removeLocation: remove }
}
