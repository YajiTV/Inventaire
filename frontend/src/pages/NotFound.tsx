import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="p-4 text-center sm:p-8">
      <h1 className="mb-2 text-2xl font-semibold">Page introuvable</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Cette adresse ne correspond à aucune page.</p>
      <Link to="/" className="underline">
        Retour à l'accueil
      </Link>
    </section>
  )
}
