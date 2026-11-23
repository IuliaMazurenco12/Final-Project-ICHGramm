import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import httpClient from "../api/httpClient";
import { useCurrentUser } from "../context/CurrentUserContext";
import logo from "../assets/logo.svg";
import styles from "../styles/Entry.module.css";

const EMPTY_FORM = { email: "", fullName: "", username: "", password: "" };

const SIGNUP_FIELDS = [
  { name: "email", type: "email", placeholder: "Email", autoComplete: "email" },
  {
    name: "fullName",
    type: "text",
    placeholder: "Full Name",
    autoComplete: "name",
  },
  {
    name: "username",
    type: "text",
    placeholder: "Username",
    autoComplete: "username",
  },
  {
    name: "password",
    type: "password",
    placeholder: "Password",
    autoComplete: "new-password",
  },
];

const Signup = () => {
  const { currentUser, startSession } = useCurrentUser();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (currentUser) return <Navigate to="/" replace />;

  const allFilled = Object.values(formValues).every(
    (value) => value.trim() !== "",
  );
  const canSubmit = allFilled && formValues.password.length >= 6 && !isSending;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError("");
    setIsSending(true);

    try {
      const { data } = await httpClient.post("/auth/register", formValues);
      startSession(data.token, data.user);
      navigate("/");
    } catch (error) {
      const serverReply = error.response?.data;

      if (serverReply?.field) {
        setFieldErrors({ [serverReply.field]: serverReply.message });
      } else {
        setGeneralError(
          serverReply?.message || "Something went wrong. Try again.",
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className={styles.stage}>
      <section className={styles.column}>
        <div className={styles.panel}>
          <img src={logo} alt="ICHGRAM" className={styles.brand} />

          <p className={styles.tagline}>
            Sign up to see photos and videos from your friends.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {SIGNUP_FIELDS.map((field) => (
              <div key={field.name}>
                <input
                  className={styles.field}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  value={formValues[field.name]}
                  onChange={handleChange}
                />
                {fieldErrors[field.name] && (
                  <p className={styles.fieldError}>{fieldErrors[field.name]}</p>
                )}
              </div>
            ))}

            <p className={styles.finePrint}>
              People who use our service may have uploaded your contact
              information to ICHGRAM.{" "}
              <span className={styles.finePrintLink}>Learn More</span>
            </p>

            <p className={styles.finePrint}>
              By signing up, you agree to our{" "}
              <span className={styles.finePrintLink}>Terms</span>,{" "}
              <span className={styles.finePrintLink}>Privacy Policy</span> and{" "}
              <span className={styles.finePrintLink}>Cookies Policy</span>.
            </p>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={!canSubmit}
            >
              {isSending ? "Signing up..." : "Sign up"}
            </button>
          </form>

          {generalError && <p className={styles.errorText}>{generalError}</p>}
        </div>

        <div className={styles.panelSmall}>
          Have an account?{" "}
          <Link to="/login" className={styles.accentLink}>
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Signup;
