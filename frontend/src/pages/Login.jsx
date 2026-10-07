import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { useForm } from "../hooks/hooks";
import { Field } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from;
  const { bind, values } = useForm({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return setErr("Enter a valid email address.");
    if (!values.password) return setErr("Enter your password.");
    setBusy(true);
    try {
      const u = await login(values);
      nav(from || homeFor(u.role), { replace: true });
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <div className="wrap narrow section">
      <form className="panel" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        {err && <div className="alert" role="alert">{err}</div>}
        <Field label="Email"><input type="email" autoComplete="email" {...bind("email")} /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" {...bind("password")} /></Field>
        <button className="btn full" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
        <p className="small">New here? <Link className="link" to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
