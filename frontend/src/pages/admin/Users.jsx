import { Fragment, useState } from "react";
import { adminService } from "../../services/admin.service";
import { useDebounce, useFetch } from "../../hooks/hooks";
import { useToast } from "../../context/ToastContext";
import { Async, PageHead, Pagination } from "../../components/ui";
import { dateTime, label } from "../../utils/format";

export default function Users() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const s = useDebounce(search);
  const q = useFetch(() => adminService.users({ page, limit: 10, search: s }), [page, s]);

  const block = async (u) => {
    if (!window.confirm(`${u.isBlocked ? "Unblock" : "Block"} ${u.name}?`)) return;
    try { await adminService.blockUser(u._id, !u.isBlocked); toast(u.isBlocked ? "User unblocked" : "User blocked"); q.reload(); }
    catch (e) { toast(e.message, "error"); }
  };

  return (
    <>
      <PageHead title="Users" />
      <div className="filters"><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or email" aria-label="Search users" /></div>
      <Async q={q} emptyText="No users found.">
        {(d) => (
          <>
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {d.items.map((u) => (
                  <Fragment key={u._id}>
                    <tr>
                      <td data-label="Name"><b>{u.name}</b></td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Phone">{u.phone}</td>
                      <td data-label="Role">{label(u.role)}</td>
                      <td data-label="Status"><span className={`badge ${u.isBlocked ? "st-cancelled" : "st-delivered"}`}>{u.isBlocked ? "Blocked" : "Active"}</span></td>
                      <td data-label="Joined">{dateTime(u.createdAt)}</td>
                      <td data-label="Actions"><div className="row">
                        <button className="btn ghost sm" onClick={() => setOpen(open === u._id ? null : u._id)}>{open === u._id ? "Hide" : "View"}</button>
                        {u.role !== "super_admin" && <button className={`btn sm ${u.isBlocked ? "" : "danger"}`} onClick={() => block(u)}>{u.isBlocked ? "Unblock" : "Block"}</button>}
                      </div></td>
                    </tr>
                    {open === u._id && <tr className="detail"><td colSpan="7">ID: {u._id} · Last updated {dateTime(u.updatedAt)}</td></tr>}
                  </Fragment>
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
