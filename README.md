# SR5 Tools

وب‌اپ فارسی RTL با ۳۰ ابزار واقعی. فرانت‌اند ساکن (GitHub Pages) + Supabase (Auth, DB, Edge Functions).

## ساختار
- `index.html` — کل اپ (۳۰ ابزار، ورود Google، داشبورد، پنل ادمین، ویدیوی ورودی)
- `assets/logo.png`, `assets/intro.mp4`
- `supabase/schema.sql` — جداول، RLS، تریگر ۳ اعتبار رایگان
- `supabase/functions/ai/index.ts` — اجرای AI با Fallback: Groq → Mistral → OpenRouter

## راه‌اندازی
1. پروژه Supabase بسازید و `schema.sql` را در SQL Editor اجرا کنید.
2. Authentication → Providers → Google را فعال کنید و Redirect URL را آدرس GitHub Pages بگذارید.
3. کلیدها فقط به‌صورت Secret در Supabase:
   `supabase secrets set GROQ_API_KEY=... MISTRAL_API_KEY=... OPENROUTER_API_KEY=...`
4. `supabase functions deploy ai`
5. در `index.html` مقادیر `SUPABASE_URL` و `SUPABASE_ANON` (فقط کلید anon عمومی) را پر کنید.
6. پوشه را روی GitHub Pages منتشر کنید.
7. بعد از اولین ورود، ادمین شوید:
   `update public.profiles set role='admin' where email='EMAIL';`

## نکته امنیتی
هیچ API Key ای در فرانت‌اند نیست. کسر اعتبار فقط در Edge Function و بعد از موفقیت AI انجام می‌شود.
