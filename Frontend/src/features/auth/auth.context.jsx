import { createContext, useState } from "react";

export const AuthContext = createContext(null);

/**
 * AuthProvider stores authentication state globally.
 * It lets the whole app know who the logged-in user is.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
