import { createContext, useEffect, useState } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext(null);

/**
 * AuthProvider stores authentication state globally.
 * It checks the logged-in user only once when the app loads.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAndSetUser = async () => {
    try {
      setLoading(true);

      const data = await getMe();

      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAndSetUser();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    getAndSetUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
