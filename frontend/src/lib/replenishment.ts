import type { ReplenishmentSuggestion } from '../types/api'

export function groupBySupplier(suggestions: ReplenishmentSuggestion[]): {
  withSupplier: Map<number, ReplenishmentSuggestion[]>
  withoutSupplier: ReplenishmentSuggestion[]
} {
  const withSupplier = new Map<number, ReplenishmentSuggestion[]>()
  const withoutSupplier: ReplenishmentSuggestion[] = []

  for (const suggestion of suggestions) {
    if (suggestion.supplier_id === null) {
      withoutSupplier.push(suggestion)
      continue
    }
    const existing = withSupplier.get(suggestion.supplier_id) ?? []
    existing.push(suggestion)
    withSupplier.set(suggestion.supplier_id, existing)
  }

  return { withSupplier, withoutSupplier }
}

export function validateTrigger(locationId: number | null): string[] {
  const errors: string[] = []
  if (locationId === null) {
    errors.push('Choisissez un emplacement de livraison avant de générer la commande.')
  }
  return errors
}