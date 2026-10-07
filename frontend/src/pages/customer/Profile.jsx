import { useState } from "react";
import { authService } from "../../services/auth.service";
import { setToken } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useForm } from "../../hooks/hooks";
import { Field, PageHead } from "../../components/ui";

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const p = useForm({ name: user.name, phone: user.phone || "" });
  const pw = useForm({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy("p");
    try { setUser(await authService.updateMe(p.values)); toast("Profile updated"); } catch (er) { toast(er.message, "error"); }
    setBusy("");
  };
  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.values.newPassword.length < 8) return toast("New password must be at least 8 characters.", "error");
    setBusy("w");
    try { const d = await authService.changePassword(pw.values); if (d?.token) setToken(d.token); pw.setValues({ currentPassword: "", newPassword: "" }); toast("Password changed"); } catch (er) { toast(er.message, "error"); }
    setBusy("");
  };

  return (
    <>
      <PageHead title="Profile and settings" />
      <form className="panel" onSubmit={saveProfile}>
        <h2>Your details</h2>
        <Field label="Email"><input value={user.email} disabled /></Field>
        <Field label="Name"><input {...p.bind("name")} /></Field>
        <Field label="Phone"><input type="tel" {...p.bind("phone")} /></Field>
        <button className="btn" disabled={busy === "p"}>Save changes</button>
      </form>
      <form className="panel" onSubmit={savePassword}>
        <h2>Change password</h2>
        <Field label="Current password"><input type="password" autoComplete="current-password" {...pw.bind("currentPassword")} /></Field>
        <Field label="New password"><input type="password" autoComplete="new-password" {...pw.bind("newPassword")} /></Field>
        <button className="btn" disabled={busy === "w"}>Change password</button>
      </form>
    </>
  );
}
