# Backend (Node + Express + MongoDB)

## Chalane ke steps

1. **MongoDB Atlas** par free account banayein, ek free cluster banayein, "Database Access" mein user banayein, aur "Network Access" mein apna IP (ya `0.0.0.0/0` testing ke liye) allow karein. Phir "Connect" → "Drivers" se connection string copy karein.
2. Terminal mein:

```bash
cd backend
cp .env.example .env     # .env kholein: MONGODB_URI aur JWT_SECRET zaroor bharein
npm install
npm run seed             # demo data (pehle ka data delete ho jata hai)
npm run dev              # http://localhost:5000/api/health
```

Frontend ke `.env` mein `VITE_API_URL=http://localhost:5000/api` rakhein.

## Demo logins (seed ke baad)

| Role | Email | Password |
|---|---|---|
| Super admin | admin@thaali.pk | Admin@12345 |
| Restaurant admin | imran@thaali.pk | Owner@12345 |
| Restaurant admin | sana@thaali.pk | Owner@12345 |
| Customer | ayesha@example.com | Customer@123 |

## Folder structure

`src/config` (env, database) · `src/models` · `src/validators` (Joi) · `src/middleware` (auth, validation, errors) · `src/services` (price calculation, cart, order rules) · `src/controllers` · `src/routes` · `seed/seed.js`

## Security jo laga hai

bcrypt password hash · JWT · role check (`authorize`) · restaurant ownership check · Joi validation · ObjectId check · helmet · CORS (sirf `CLIENT_URL`) · login/register par rate limit · `$` wali keys ki safai · password kabhi response mein nahi · prices sirf server par calculate hoti hain · order status ke qaide (delivered se wapas preparing nahi ho sakta)

## Deploy

Backend ko kisi Node hosting (jaise Render ka free plan) par chalayein. Environment variables wahan daalein (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=https://USERNAME.github.io`). `.env` file GitHub par kabhi na daalein.

## Abhi baaki

- Automated tests (Jest + Supertest)
- Postman collection
- Cloudinary image upload (abhi image ka URL paste hota hai)
