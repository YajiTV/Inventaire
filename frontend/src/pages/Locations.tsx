import type { FormEvent } from 'react'
import { useState } from 'react'
import { useLocations } from '../hooks/useLocations'
import { validateLocation } from '../lib/locations'
import { ApiError } from '../lib/api'
import { DataTable } from '../components/DataTable'
import type { DataTableColumn } from '../components/DataTable'
import { FormField } from '../components/FormField'
import { StatusMessage } from '../components/StatusMessage'
import type { LocationRead } from '../types/api'

export default function Locations() {
  const { locations, loading, error, addLocation, editLocation, removeLocation } = useLocations()

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [formErrors, setFormErrors] = useState<string[]>([])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCode, setEditCode] = useState('')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editErrors, setEditErrors] = useState<string[]>([])

  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setApiError(null)
    setSuccessMessage(null)

    const payload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() === '' ? null : description.trim(),
    }

    const found = validateLocation(payload)
    setFormErrors(found)
    if (found.length > 0) return

    try {
      await addLocation(payload)
      setCode('')
      setName('')
      setDescription('')
      setSuccessMessage('Emplacement ajouté avec succès.')
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Erreur inattendue')
    }
  }

  function startEdit(location: LocationRead) {
    setEditingId(location.id)
    setEditCode(location.code)
    setEditName(location.name)
    setEditDescription(location.description ?? '')
    setEditErrors([])
  }

  function cancelEdit() {
    setEditingId(null)
    setEditErrors([])
  }

  async function saveEdit(id: number) {
    setApiError(null)
    setSuccessMessage(null)

    const payload = {
      code: editCode.trim(),
      name: editName.trim(),
      description: editDescription.trim() === '' ? null : editDescription.trim(),
    }

    const found = validateLocation(payload)
    setEditErrors(found)
    if (found.length > 0) return

    try {
      await editLocation(id, payload)
      setEditingId(null)
      setSuccessMessage('Emplacement modifié avec succès.')
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Erreur inattendue')
    }
  }

  async function handleDelete(location: LocationRead) {
    const confirmed = window.confirm(`Supprimer l'emplacement "${location.name}" ?`)
    if (!confirmed) return

    setApiError(null)
    setSuccessMessage(null)
    try {
      await removeLocation(location.id)
      setSuccessMessage('Emplacement supprimé avec succès.')
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Erreur inattendue')
    }
  }

  const columns: DataTableColumn<LocationRead>[] = [
    {
      header: 'Code',
      render: (l) =>
        editingId === l.id ? (
          <FormField id={`edit-code-${l.id}`} label="" value={editCode} onChange={setEditCode} />
        ) : (
          l.code
        ),
    },
    {
      header: 'Nom',
      render: (l) =>
        editingId === l.id ? (
          <FormField id={`edit-name-${l.id}`} label="" value={editName} onChange={setEditName} />
        ) : (
          l.name
        ),
    },
    {
      header: 'Description',
      render: (l) =>
        editingId === l.id ? (
          <FormField id={`edit-description-${l.id}`} label="" value={editDescription} onChange={setEditDescription} />
        ) : (
          l.description
        ),
    },
  ]

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Emplacements</h1>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
        <FormField id="code" label="Code" value={code} onChange={setCode} placeholder="RESERVE-01" required />
        <FormField id="name" label="Nom" value={name} onChange={setName} required />
        <FormField id="description" label="Description" value={description} onChange={setDescription} />
        <button type="submit" className="self-end border rounded px-3 py-1">
          Ajouter
        </button>
        {formErrors.map((err) => (
          <p key={err} role="alert" className="w-full text-red-600 text-sm">
            {err}
          </p>
        ))}
      </form>

      <StatusMessage
        loading={loading}
        error={error}
        isEmpty={!loading && !error && locations.length === 0}
        emptyMessage="Aucun emplacement"
      />
      {apiError && (
        <p role="alert" className="text-red-600">
          {apiError}
        </p>
      )}
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {editErrors.map((err) => (
        <p key={err} role="alert" className="text-red-600 text-sm">
          {err}
        </p>
      ))}

      {!loading && !error && locations.length > 0 && (
        <DataTable
          columns={columns}
          rows={locations}
          getRowId={(l) => l.id}
          renderActions={(l) =>
            editingId === l.id ? (
              <>
                <button onClick={() => saveEdit(l.id)}>Enregistrer</button>
                <button onClick={cancelEdit}>Annuler</button>
              </>
            ) : (
              <>
                <button onClick={() => startEdit(l)}>Modifier</button>
                <button onClick={() => handleDelete(l)}>Supprimer</button>
              </>
            )
          }
        />
      )}
    </div>
  )
}