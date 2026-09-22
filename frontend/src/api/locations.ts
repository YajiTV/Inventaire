import { apiFetch} from "../lib/api.ts";
import type {LocationCreate, LocationRead, LocationUpdate} from "../types/api";

export async function fetchLocations(): Promise<LocationRead[]> {
    const response = await apiFetch("/locations");
    return response.json()
}

export async function createLocation(data: LocationCreate): Promise<LocationRead> {
    const response = await apiFetch('/locations', {
        method: 'POST',
        body: JSON.stringify(data),
    })
    return response.json()
}

export async function updateLocation(id: number, data: LocationUpdate): Promise<LocationRead> {
    const response =await apiFetch(`/locations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
    return response.json()
}
export async function deleteLocation(id: number): Promise<void> {
    await apiFetch(`/locations/${id}`, {
        method: 'DELETE',
    })
}