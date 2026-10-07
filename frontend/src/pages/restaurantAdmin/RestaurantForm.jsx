import { useState } from "react";
import { restaurantService } from "../../services/restaurant.service";
import { useMyRestaurant } from "../../hooks/useMyRestaurant";
import { useToast } from "../../context/ToastContext";
import { useForm } from "../../hooks/hooks";
import { ErrorBox, Field, Loading, PageHead } from "../../components/ui";

function Form({ r, reload }) {
  const toast = useToast();
  const { bind, values } = useForm({
    name: r?.name || "", description: r?.description || "", phone: r?.phone || "", email: r?.email || "",
    address: r?.address || "", city: r?.city || "", image: r?.image || "",
    openingTime: r?.openingTime || "10:00", closingTime: r?.closingTime || "23:00", isOpen: r?.isOpen ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!values.name.trim() || !values.address.trim() || !values.city.trim()) return setErr("Name, address and city are required.");
    setBusy(true);
    try {
      r ? await restaurantService.update(r._id, values) : await restaurantService.create(values);
      toast(r ? "Restaurant updated" : "Restaurant created");
      reload();
    } catch (er) { setErr(er.message); }
    setBusy(false);
  };

  return (
    <form className="panel" onSubmit={submit} noValidate>
      {err && <div className="alert" role="alert">{err}</div>}
      <Field label="Restaurant name"><input {...bind("name")} /></Field>
      <Field label="Description"><textarea rows="3" {...bind("description")} /></Field>
      <div className="row2">
        <Field label="Phone"><input type="tel" {...bind("phone")} /></Field>
        <Field label="Email"><input type="email" {...bind("email")} /></Field>
      </div>
      <Field label="Address"><input {...bind("address")} /></Field>
      <Field label="City"><input {...bind("city")} /></Field>
      <div className="row2">
        <Field label="Opens at"><input type="time" {...bind("openingTime")} /></Field>
        <Field label="Closes at"><input type="time" {...bind("closingTime")} /></Field>
      </div>
      <Field label="Image URL" hint="Paste a link for now. Photo upload comes with the backend."><input {...bind("image")} placeholder="https://..." /></Field>
      <label className="check"><input type="checkbox" checked={!!values.isOpen} onChange={bind("isOpen").onChange} name="isOpen" /> Open for orders right now</label>
      <button className="btn" disabled={busy}>{busy ? "Saving..." : r ? "Save changes" : "Create restaurant"}</button>
    </form>
  );
}

export default function RestaurantForm() {
  const mine = useMyRestaurant();
  if (mine.loading && !mine.data) return <Loading />;
  if (mine.error) return <ErrorBox message={mine.error} onRetry={mine.reload} />;
  return (
    <>
      <PageHead title={mine.restaurant ? "Your restaurant" : "Create your restaurant"} />
      <Form key={mine.restaurant?._id || "new"} r={mine.restaurant} reload={mine.reload} />
    </>
  );
}
