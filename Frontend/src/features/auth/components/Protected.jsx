import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Protected component blocks unauthenticated users
 * from accessing private frontend pages.
 */
function Protected({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main
        style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
      >
        <p>Checking authentication...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;
