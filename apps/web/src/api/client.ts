// Point d'entrée unique vers le backend.
// Centraliser ici évite de répéter l'URL partout et facilitera l'ajout
// futur de gestion d'erreurs, d'en-têtes, d'authentification, etc.

const API_URL = import.meta.env.VITE_API_URL

/**
 * Effectue un GET sur l'API et renvoie la réponse JSON typée.
 * @param path chemin relatif, ex. "/api/ping"
 */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Requête échouée (${response.status}) sur ${path}`)
  }
  return response.json() as Promise<T>
}
