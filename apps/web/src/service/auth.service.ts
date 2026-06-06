const BASE_URL = "http://localhost:8080/api";

// Helper interne : fait le fetch avec les bonnes options PARTOUT.
// credentials: "include" = "navigateur, envoie/accepte les cookies même cross-origin"
async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    ...options,
    credentials: "include",                  // ← LE point crucial pour la session
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Si le serveur répond une erreur (4xx/5xx), on la transforme en exception JS.
  if (!response.ok) {
    // On essaie de lire le corps JSON d'erreur (ton ErrorResponse), sinon message générique.
    const error = await response.json().catch(() => ({ message: "Erreur réseau" }));
    throw new Error(error.message || "Erreur");
  }

  // 204 No Content (le logout) n'a pas de corps → on ne tente pas de le parser.
  if (response.status === 204) return null;

  return response.json();
}

// Une fonction par endpoint. Le composant React appelle ça, sans connaître les détails fetch.
export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(pseudo, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ pseudo, email, password }),
  });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function me() {
  return request("/users/me");   // GET par défaut
}