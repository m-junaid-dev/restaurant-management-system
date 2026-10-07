import { useState } from "react";
import { categoryService } from "../../services/restaurant.service";
import { useFetch, useForm } from "../../hooks/hooks";
import { useMyRestaurant } from "../../hooks/useMyRestaurant";
import { useToast } from "../../context/ToastContext";
import { Async, Field, Img, PageHead } from "../../components/ui";
import Gate from "./Gate";

const blank = { name: "", description: "", image: "", sortOrder: 0, isActive: true };

function Manager({ r }) {
  const toast = useToast();
  const q = useFetch(() => categoryService.list(r._id), [r._id]);
  const [editing, setEditing] = useState(null);
  const f = useForm(blank);

  const open = (c) => { setEditing(c || "new"); f.setValues(c ? { name: c.name, description: c.description || "", image: c.image || "", sortOrder: c.sortOrder ?? 0, isActive: c.isActive } : blank); };
  const save = async (e) => {
    e.preventDefault();
    if (!f.values.name.trim()) return toast("Category name is required.", "error");
    const body = { ...f.values, sortOrder: Number(f.values.sortOrder) || 0 };
    try {
      editing === "new" ? await categoryService.create(r._id, body) : await categoryService.update(editing._id, body);
      toast("Category saved"); setEditing(null); q.reload();
    } catch (er) { toast(er.message, "error"); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try { await categoryService.remove(c._id); toast("Category deleted"); q.reload(); } catch (er) { toast(er.message, "error"); }
  };
  const toggle = async (c) => {
    try { await categoryService.update(c._id, { isActive: !c.isActive }); q.reload(); } catch (er) { toast(er.message, "error"); }
  };

  return (
    <>
      <PageHead title="Categories"><button className="btn" onClick={() => open()}>Add category</button></PageHead>
      {editing && (
        <form className="panel" onSubmit={save}>
          <h2>{editing === "new" ? "New category" : "Edit category"}</h2>
          <Field label="Name"><input {...f.bind("name")} /></Field>
          <Field label="Description"><input {...f.bind("description")} /></Field>
          <div className="row2">
            <Field label="Sort order" hint="Smaller numbers show first."><input type="number" {...f.bind("sortOrder")} /></Field>
            <Field label="Image URL"><input {...f.bind("image")} /></Field>
          </div>
          <label className="check"><input type="checkbox" name="isActive" checked={!!f.values.isActive} onChange={f.bind("isActive").onChange} /> Show to customers</label>
          <div className="row"><button className="btn">Save category</button><button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button></div>
        </form>
      )}
      <Async q={q} emptyText="No categories yet. Add one to start building your menu.">
        {(d) => (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Category</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {(Array.isArray(d) ? d : d.items).map((c) => (
                <tr key={c._id}>
                  <td data-label="Category"><div className="row"><Img src={c.image} className="thumb sm" fallback="🍽️" /><div><b>{c.name}</b><div className="small">{c.description}</div></div></div></td>
                  <td data-label="Order">{c.sortOrder}</td>
                  <td data-label="Status"><span className={`badge ${c.isActive ? "st-delivered" : "st-cancelled"}`}>{c.isActive ? "Active" : "Hidden"}</span></td>
                  <td data-label="Actions"><div className="row">
                    <button className="btn ghost sm" onClick={() => open(c)}>Edit</button>
                    <button className="btn ghost sm" onClick={() => toggle(c)}>{c.isActive ? "Hide" : "Show"}</button>
                    <button className="btn danger sm" onClick={() => remove(c)}>Delete</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Async>
    </>
  );
}

export default function Categories() {
  const mine = useMyRestaurant();
  return <Gate mine={mine}>{(r) => <Manager r={r} />}</Gate>;
}
