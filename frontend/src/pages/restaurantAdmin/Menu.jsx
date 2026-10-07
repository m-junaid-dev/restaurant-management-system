import { useState } from "react";
import { categoryService, menuService } from "../../services/restaurant.service";
import { useDebounce, useFetch, useForm } from "../../hooks/hooks";
import { useMyRestaurant } from "../../hooks/useMyRestaurant";
import { useToast } from "../../context/ToastContext";
import { Async, Field, Img, PageHead, Pagination } from "../../components/ui";
import { idOf, money } from "../../utils/format";
import Gate from "./Gate";

const blank = { category: "", name: "", description: "", price: "", discountPrice: "", image: "", ingredients: "", preparationTime: 15, isAvailable: true };

function Manager({ r }) {
  const toast = useToast();
  const cats = useFetch(() => categoryService.list(r._id), [r._id]);
  const categories = Array.isArray(cats.data) ? cats.data : cats.data?.items || [];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const s = useDebounce(search);
  const q = useFetch(() => menuService.list(r._id, { page, limit: 10, search: s, category }), [r._id, page, s, category]);
  const [editing, setEditing] = useState(null);
  const f = useForm(blank);

  const open = (m) => {
    setEditing(m || "new");
    f.setValues(m ? { ...m, category: idOf(m.category), ingredients: (m.ingredients || []).join(", "), discountPrice: m.discountPrice ?? "" } : { ...blank, category: categories[0]?._id || "" });
  };
  const save = async (e) => {
    e.preventDefault();
    const v = f.values;
    if (!v.name.trim() || !v.category) return toast("Name and category are required.", "error");
    if (!(Number(v.price) > 0)) return toast("Enter a price greater than 0.", "error");
    if (v.discountPrice !== "" && Number(v.discountPrice) >= Number(v.price)) return toast("Discount price must be lower than the price.", "error");
    const body = {
      category: v.category, name: v.name, description: v.description, image: v.image, isAvailable: !!v.isAvailable,
      price: Number(v.price), preparationTime: Number(v.preparationTime) || 15,
      ingredients: String(v.ingredients).split(",").map((x) => x.trim()).filter(Boolean),
      ...(v.discountPrice !== "" ? { discountPrice: Number(v.discountPrice) } : {}),
    };
    try {
      editing === "new" ? await menuService.create(r._id, body) : await menuService.update(editing._id, body);
      toast("Menu item saved"); setEditing(null); q.reload();
    } catch (er) { toast(er.message, "error"); }
  };
  const remove = async (m) => {
    if (!window.confirm(`Delete "${m.name}"?`)) return;
    try { await menuService.remove(m._id); toast("Item deleted"); q.reload(); } catch (er) { toast(er.message, "error"); }
  };
  const avail = async (m) => {
    try { await menuService.setAvailability(m._id, !m.isAvailable); q.reload(); } catch (er) { toast(er.message, "error"); }
  };

  return (
    <>
      <PageHead title="Menu"><button className="btn" onClick={() => open()} disabled={!categories.length}>Add item</button></PageHead>
      {!cats.loading && !categories.length && <div className="alert">Create a category first, then add menu items to it.</div>}
      {editing && (
        <form className="panel" onSubmit={save}>
          <h2>{editing === "new" ? "New menu item" : "Edit menu item"}</h2>
          <div className="row2">
            <Field label="Name"><input {...f.bind("name")} /></Field>
            <Field label="Category"><select {...f.bind("category")}>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
          </div>
          <Field label="Description"><textarea rows="2" {...f.bind("description")} /></Field>
          <div className="row2">
            <Field label="Price (Rs.)"><input type="number" min="0" {...f.bind("price")} /></Field>
            <Field label="Discount price (optional)"><input type="number" min="0" {...f.bind("discountPrice")} /></Field>
          </div>
          <Field label="Ingredients" hint="Separate with commas."><input {...f.bind("ingredients")} /></Field>
          <div className="row2">
            <Field label="Preparation time (minutes)"><input type="number" min="1" {...f.bind("preparationTime")} /></Field>
            <Field label="Image URL"><input {...f.bind("image")} /></Field>
          </div>
          <label className="check"><input type="checkbox" name="isAvailable" checked={!!f.values.isAvailable} onChange={f.bind("isAvailable").onChange} /> Available to order</label>
          <div className="row"><button className="btn">Save item</button><button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button></div>
        </form>
      )}
      <div className="filters">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search items" aria-label="Search items" />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <Async q={q} emptyText="No menu items found.">
        {(d) => (
          <>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Item</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead>
              <tbody>
                {d.items.map((m) => (
                  <tr key={m._id}>
                    <td data-label="Item"><div className="row"><Img src={m.image} className="thumb sm" /><div><b>{m.name}</b><div className="small">{m.category?.name}</div></div></div></td>
                    <td data-label="Price">{m.discountPrice ? <><b>{money(m.discountPrice)}</b> <s className="small">{money(m.price)}</s></> : money(m.price)}</td>
                    <td data-label="Availability"><button className={`badge btnbadge ${m.isAvailable ? "st-delivered" : "st-cancelled"}`} onClick={() => avail(m)}>{m.isAvailable ? "Available" : "Sold out"}</button></td>
                    <td data-label="Actions"><div className="row"><button className="btn ghost sm" onClick={() => open(m)}>Edit</button><button className="btn danger sm" onClick={() => remove(m)}>Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <Pagination data={d} onChange={setPage} />
          </>
        )}
      </Async>
    </>
  );
}

export default function Menu() {
  const mine = useMyRestaurant();
  return <Gate mine={mine}>{(r) => <Manager r={r} />}</Gate>;
}
