import { useAuth } from "./features/auth/AuthContext";

function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <p>Chargement…</p>;

  return (
    <div>
      <h1>NovelRealm</h1>
      {user ? (
        <>
          <p>Connecté en tant que {user.pseudo} ({user.email})</p>
          <button onClick={() => logout()}>Se déconnecter</button>
        </>
      ) : (
        <>
          <p>Pas connecté.</p>
          <button onClick={() => login("clean@test.com", "secret123")}>
            Se connecter (test)
          </button>
        </>
      )}
    </div>
  );
}

export default App;