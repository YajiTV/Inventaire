import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [pseudo, setPseudo] = useState('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        try {
            await register(pseudo, email, password, confirm)
            navigate('/')
        } catch {
            setError('Erreur dans les champs requis')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto mt-20 flex max-w-sm flex-col gap-4">
            <h1 className="text-xl font-semibold">S'enregistrer</h1>
            <input type="speudo" placeholder="Votre pseudo" value={pseudo} onChange={(p) => setPseudo(p.target.value)} required/>
            <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="text" placeholder="Votre mot de passe" value={password} onChange={(m) => setPassword(m.target.value)} required />
            <input type="text" placeholder="Confirmez votre mot de passe" value={confirm} onChange={(c) => setConfirm(c.target.value)} required />
            {error && <p className="text-red-600">{error}</p>}
            <button type="submit">S'enregistrer</button>
        </form>
    )
}
