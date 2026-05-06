import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../auth.form.scss";

function Login() {
  const { handleLogin, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (event) => {
    event.preventDefault();

    await handleLogin({
      email,
      password,
    });
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login to continue creating your interview strategy.</p>

        <form onSubmit={submitHandler} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
