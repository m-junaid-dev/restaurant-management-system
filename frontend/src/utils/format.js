export const money = (n) => "Rs. " + Number(n || 0).toLocaleString("en-PK");
export const dateTime = (d) => (d ? new Date(d).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "-");
export const idOf = (x) => (x && typeof x === "object" ? x._id : x);
export const addressText = (a) => (!a ? "-" : typeof a === "string" ? a : [a.address, a.city, a.postalCode].filter(Boolean).join(", "));
export const label = (s) => String(s || "").replaceAll("_", " ");
export const FLOW = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];
// Restaurant admin ke liye agla allowed status (final faisla backend karta hai)
export const NEXT_STATUS = {
  pending: ["confirmed", "rejected"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};
