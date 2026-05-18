import { useAuth } from '../auth/AuthContext';

export function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__brand">SMS Frontend</div>
      <div className="navbar__actions">
        {currentUser ? (
          <>
            <div className="navbar__user">Signed in as {currentUser.fullName}</div>
            <button type="button" className="button button--ghost" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <div className="navbar__user">Guest</div>
        )}
      </div>
    </header>
  );
}
