import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { useForm } from "../hooks/hooks";
import { Field } from "../components/ui";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const { bind, values } = useForm({ name: "", email: "", password: "", phone: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (values.name.trim().length < 2) return setErr("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(values.email)) return setErr("Enter a valid email address.");
    if (values.password.length < 8) return setErr("Password must be at least 8 characters.");
    if (!/^\+?[0-9\s-]{10,15}$/.test(values.phone)) return setErr("Enter a valid phone number, e.g. +923001234567.");
    setBusy(true);
    try {
      const u = await register(values);
      nav(homeFor(u.role), { replace: true });
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <div className="wrap narrow section">
      <form className="panel" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        {err && <div className="alert" role="alert">{err}</div>}
        <Field label="Full name"><input autoComplete="name" {...bind("name")} /></Field>
        <Field label="Email"><input type="email" autoComplete="email" {...bind("email")} /></Field>
        <Field label="Phone"><input type="tel" autoComplete="tel" placeholder="+923001234567" {...bind("phone")} /></Field>
        <Field label="Password" hint="At least 8 characters."><input type="password" autoComplete="new-password" {...bind("password")} /></Field>
        <button className="btn full" disabled={busy}>{busy ? "Creating account..." : "Sign up"}</button>
        <p className="small">Already registered? <Link className="link" to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
