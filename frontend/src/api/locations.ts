import { apiFetch} from "../lib/api.ts";
import type {LocationRead} from "../types/api.ts";

export async function fetchLocations(): Promise<LocationRead[]> {
    const response = await apiFetch("/locations");
    return response.json()
}