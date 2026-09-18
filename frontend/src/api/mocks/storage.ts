const PREFIX = 'mock:'

export function loadMock<T>(key: string, seed: T): T {
    try {
        const raw = localStorage.getItem(PREFIX + key)
        return raw ? (JSON.parse(raw) as T) : seed
    } catch {
        return seed
    }
}

export function saveMock<T>(key: string, data: T): void {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(data))
    } catch {
        // stockage indisponible (navigation privee, quota) : la demo continue en memoire
    }
}

export function resetMockStorage(): void {
    try {
        Object.keys(localStorage)
            .filter((key) => key.startsWith(PREFIX))
            .forEach((key) => localStorage.removeItem(key))
    } catch {
        // stockage indisponible : rien a nettoyer
    }
}

// Accessible depuis la console (window.resetMockData()) pour repartir de la seed
// avant une demo, sans toucher au bootstrap MSW (main.tsx / browser.ts) gele.
if (import.meta.env.DEV) {
    (window as unknown as { resetMockData: typeof resetMockStorage }).resetMockData = resetMockStorage
}
