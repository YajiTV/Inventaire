import type { FormEvent } from 'react'
import { useState } from 'react'
import { useLocations } from '../hooks/useLocations'
import { validateLocation } from '../lib/locations'
import { useActionFeedback } from '../hooks/useActionFeedback'
import { DataTable } from '../components/DataTable'
import type { DataTableColumn } from '../components/DataTable'
import { FormField } from '../components/FormField'
import { StatusMessage } from '../components/StatusMessage'
import { ActionFeedback } from '../components/ActionFeedback'
import { ErrorList } from '../components/ErrorList'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { Workbench } from '../components/Workbench'
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

  const feedback = useActionFeedback()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    feedback.clear()

    const payload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() === '' ? null : description.trim(),
    }

    const found = validateLocation(payload)
    setFormErrors(found)
    if (found.length > 0) return

    const added = await feedback.run(() => addLocation(payload), 'Emplacement ajouté avec succès.')
    if (added) {
      setCode('')
      setName('')
      setDescription('')
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
    const payload = {
      code: editCode.trim(),
      name: editName.trim(),
      description: editDescription.trim() === '' ? null : editDescription.trim(),
    }

    const found = validateLocation(payload)
    setEditErrors(found)
    if (found.length > 0) return

    const saved = await feedback.run(() => editLocation(id, payload), 'Emplacement modifié avec succès.')
    if (saved) setEditingId(null)
  }

  async function handleDelete(location: LocationRead) {
    const confirmed = window.confirm(`Supprimer l'emplacement "${location.name}" ?`)
    if (!confirmed) return

    await feedback.run(() => removeLocation(location.id), 'Emplacement supprimé avec succès.')
  }

  const columns: DataTableColumn<LocationRead>[] = [
    {
      header: 'Code',
      render: (l) =>
        editingId === l.id ? (
          <FormField id={`edit-code-${l.id}`} label="Code" value={editCode} onChange={setEditCode} compact />
        ) : (
          <span className="font-bold whitespace-nowrap font-stretch-condensed text-stamp">{l.code}</span>
        ),
    },
    {
      header: 'Nom',
      render: (l) =>
        editingId === l.id ? (
          <FormField id={`edit-name-${l.id}`} label="Nom" value={editName} onChange={setEditName} compact />
        ) : (
          <span className="font-semibold">{l.name}</span>
        ),
    },
    {
      header: 'Description',
      render: (l) =>
        editingId === l.id ? (
          <FormField id={`edit-description-${l.id}`} label="Description" value={editDescription} onChange={setEditDescription} compact />
        ) : (
          <span className="text-ink-soft">{l.description}</span>
        ),
    },
  ]

  return (
    <>
      <PageHeader title="Emplacements" />

      <Workbench
        formTitle="Nouvel emplacement"
        form={
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            <FormField id="code" label="Code" value={code} onChange={setCode} placeholder="RESERVE-01" required />
            <FormField id="name" label="Nom" value={name} onChange={setName} placeholder="Réserve sèche" required />
            <FormField id="description" label="Description" value={description} onChange={setDescription} placeholder="Étagères du fond" />
            <ErrorList errors={formErrors} />
            <Button type="submit" variant="primary">
              Ajouter l'emplacement
            </Button>
          </form>
        }
      >
        <ActionFeedback error={feedback.error} success={feedback.success} />
        <ErrorList errors={editErrors} />
        <StatusMessage
          loading={loading}
          error={error}
          isEmpty={!loading && !error && locations.length === 0}
          emptyMessage="Aucun emplacement. Ajoutez le premier avec le formulaire."
        />

        {!loading && !error && locations.length > 0 && (
          <DataTable
            columns={columns}
            rows={locations}
            getRowId={(l) => l.id}
            renderActions={(l) =>
              editingId === l.id ? (
                <>
                  <Button onClick={() => saveEdit(l.id)} variant="primary">
                    Enregistrer
                  </Button>
                  <Button onClick={cancelEdit}>Annuler</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => startEdit(l)}>Modifier</Button>
                  <Button onClick={() => handleDelete(l)} variant="danger">
                    Supprimer
                  </Button>
                </>
              )
            }
          />
        )}
      </Workbench>
    </>
  )
}
