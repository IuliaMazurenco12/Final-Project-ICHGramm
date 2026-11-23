import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import httpClient from "../api/httpClient";
import { useCurrentUser } from "../context/CurrentUserContext";
import logo from "../assets/logo.svg";
import phones from "../assets/phones2.png";
import styles from "../styles/Entry.module.css";

const Login = () => {
  const { currentUser, startSession } = useCurrentUser();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (currentUser) return <Navigate to="/" replace />;

  const canSubmit =
    identifier.trim() !== "" && password.length >= 6 && !isSending;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorText("");
    setIsSending(true);

    try {
      const { data } = await httpClient.post("/auth/login", {
        identifier,
        password,
      });
      startSession(data.token, data.user);
      navigate("/");
    } catch (error) {
      setErrorText(
        error.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className={styles.stage}>
      <img src={phones} alt="ICHGRAM app preview" className={styles.showcase} />

      <section className={styles.column}>
        <div className={styles.panel}>
          <img src={logo} alt="ICHGRAM" className={styles.brand} />
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.field}
              type="text"
              placeholder="Username, or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            <input
              className={styles.field}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={!canSubmit}
            >
              {isSending ? "Logging in..." : "Log in"}
            </button>
          </form>
          <div className={styles.divider}>
            <span>OR</span>
          </div>
          {errorText && <p className={styles.errorText}>{errorText}</p>}
          <span className={styles.quietLink}>Forgot password?</span>
          Forgot password?
        </div>

        <div className={styles.panelSmall}>
          Don't have an account?{" "}
          <Link to="/signup" className={styles.accentLink}>
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Login;
