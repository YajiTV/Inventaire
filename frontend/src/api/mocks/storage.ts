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
        // storage unavailable (private mode, quota): keep going in memory
    }
}

export function resetMockStorage(): void {
    try {
        Object.keys(localStorage)
            .filter((key) => key.startsWith(PREFIX))
            .forEach((key) => localStorage.removeItem(key))
    } catch {
        // storage unavailable (private mode, quota): keep going in memory
    }
}

if (import.meta.env.DEV) {
    (window as unknown as { resetMockData: typeof resetMockStorage }).resetMockData = resetMockStorage
}
