import { Link } from 'react-router-dom'
import { BUTTON_VARIANTS } from '../lib/ui'
import { Stamp } from '../components/Stamp'

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <div className="mb-8 scale-150">
        <Stamp>Introuvable</Stamp>
      </div>
      <h1 className="mb-3 text-4xl font-extrabold uppercase tracking-tight font-stretch-condensed">Page introuvable</h1>
      <p className="mb-8 text-ink-soft">Cette adresse ne correspond à aucune page.</p>
      <Link to="/" className={BUTTON_VARIANTS.primary}>
        Retour à l'accueil
      </Link>
    </section>
  )
}
