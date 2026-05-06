import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../auth.context";
import { register, login, logout, getMe } from "../services/auth.api";

/**
 * Custom hook for authentication logic.
 * It connects API layer with Auth Context state.
 */
const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  /**
   * Rehydrate user on app refresh.
   * This checks if token cookie is still valid.
   */
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

  /**
   * Register user and redirect to login page.
   */
  const handleRegister = async ({ username, email, password }) => {
    try {
      setLoading(true);

      await register({ username, email, password });

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user and redirect to home page.
   */
  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);

      const data = await login({ email, password });

      setUser(data.user);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and redirect to login page.
   */
  const handleLogout = async () => {
    try {
      setLoading(true);

      await logout();

      setUser(null);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAndSetUser();
  }, []);

  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    getAndSetUser,
  };
};

export default useAuth;
