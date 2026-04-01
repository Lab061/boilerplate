import { useAuth } from "../auth/AuthContext.js";

export function Home() {
  const { logout } = useAuth();

  return (
    <div className="container">
      <div className="header">
        <h1>Home</h1>
        <button className="btn btn-danger" onClick={logout}>
          Log Out
        </button>
      </div>
      <p>Welcome! You are authenticated.</p>
    </div>
  );
}
