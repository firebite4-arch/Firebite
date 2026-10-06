# FIREBITE — React + Supabase + Vercel

A premium responsive static-first food ordering website for FIREBITE (Charcoal Chicken & Kababs).

## Included now
- Responsive FIREBITE landing page
- Menu with Chicken Skewers, Chicken Wings, Chicken Kababs and Combo
- Cart with quantity controls and local persistence
- Login / signup UI ready for Supabase Auth
- Checkout/order flow ready for Supabase `orders` table
- Demo mode works without Supabase credentials
- FIREBITE banner artwork included in `public/assets`
- Vercel SPA rewrite included

## Run locally
```bash
npm install
npm run dev
```

## Connect Supabase
1. Create a Supabase project.
2. Enable Email/Password authentication.
3. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Run `supabase-schema.sql` in Supabase SQL Editor.
5. Restart `npm run dev`.

The browser only uses the Supabase public/anon key. Do not put a Supabase service-role/secret key in this React app.

## Vercel
Import this folder into Vercel. Build command: `npm run build`. Output directory: `dist`.
Add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in Vercel.

## Next production phase
- Supabase product/menu tables instead of hard-coded products
- Customer profiles and saved addresses
- Order status tracking
- Admin dashboard
- UPI/Razorpay/PhonePe payment integration
- WhatsApp/order notifications
- Store open/closed status and delivery/pickup options
