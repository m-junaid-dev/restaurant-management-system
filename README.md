# Restaurant Management System (Thaali)

Folders: `frontend/` (React + Vite, GitHub Pages par jata hai) aur `backend/` (Node + Express + MongoDB Atlas). Backend ke steps `backend/README.md` mein hain.

## Frontend chalana

```bash
cd frontend
cp .env.example .env      # phir .env mein VITE_API_URL set karein
npm install
npm run dev               # http://localhost:5173
```

## Environment

| Variable | Matlab |
|---|---|
| `VITE_API_URL` | Backend ka URL, jaise `http://localhost:5000/api` |
| `VITE_BASE` | GitHub repo ka naam, jaise `/restaurant-management-system/` |

Backend ke secrets frontend mein kabhi mat daalein.

## GitHub Pages par deploy

1. `frontend/.env` mein `VITE_API_URL` apne deployed backend ka URL rakhein, `VITE_BASE` apne repo ka naam.
2. `npm run build` phir `npm run deploy` (gh-pages package `dist/` ko `gh-pages` branch par bhej deta hai).
3. GitHub: Settings → Pages → branch `gh-pages`.
4. Site yahan khulegi: `https://USERNAME.github.io/REPOSITORY-NAME/`

App `HashRouter` use karti hai (URLs `#/restaurants` jaise), is liye reload par page break nahi hota.
Backend ka `CLIENT_URL` (CORS) mein `https://USERNAME.github.io` daalna zaroori hoga.

## Backend ke liye API contract (frontend yehi expect karta hai)

Har response: `{ success, message, data }`. Error: `{ success:false, message, errors:[] }`.

**Lists** (restaurants, menu, orders, users...): `data = { items: [], page, totalPages, total }`
Query params: `page, limit, search, city, isOpen, isActive, category, minPrice, maxPrice, availability, status, date, owner=me`

| Endpoint | `data` |
|---|---|
| `POST /auth/register`, `POST /auth/login` | `{ token, user }` |
| `GET /users/me`, `PATCH /users/me` | `user` |
| `GET /restaurants?owner=me` | list, sirf login admin ka restaurant |
| `GET /restaurants/:id/categories` | array ya list |
| `GET /cart` (+ add/update/remove/clear) | `{ restaurant:{_id,name}, items:[{menuItem:{_id,name,image}, quantity, price}], subtotal, deliveryFee, discount, total }` |
| `POST /orders` body | `{ deliveryAddress:{address,city,postalCode}, phone, paymentMethod:"cash_on_delivery", notes }` → order |
| order | `{ _id, orderNumber, restaurant:{name}, user:{name}, items:[{name,price,quantity,subtotal}], deliveryAddress, phone, subtotal, deliveryFee, discount, total, paymentMethod, paymentStatus, orderStatus, notes, createdAt }` |
| `GET /restaurants/:id/orders` | list + `stats:{ total, pending, preparing, completed }` |
| `GET /admin/dashboard` | `{ totalUsers, totalRestaurants, totalOrders, totalRevenue, todayOrders, pendingOrders, completedOrders }` |

**Do naye endpoints** jo spec mein nahi the, frontend inhe use karta hai:
`PATCH /admin/users/:id/block` body `{ isBlocked }` aur `PATCH /admin/restaurants/:id/status` body `{ isActive }`.

## Abhi baaki

- Backend ke tests aur Postman collection.
- Image upload: abhi image ka URL paste karte hain. Cloudinary upload backend ke baad.
- Frontend tests aur reviews/favorites (optional features).
