# SR5 Tools

همه فایل‌ها در یک پوشه‌اند و بدون زیرپوشه روی GitHub آپلود می‌شوند.

- index.html, style.css, app.js : خود سایت
- logo.png, intro.mp4 : لوگو و ویدیوی ورودی
- schema.sql : کد دیتابیس (در Supabase > SQL Editor اجرا شود)
- ai-function.ts : کد Edge Function با نام ai (در Supabase > Edge Functions > Via Editor)

آدرس و کلید anon پروژه از قبل داخل app.js گذاشته شده است.
کلیدهای Groq / Mistral / OpenRouter فقط در Supabase > Edge Functions > Secrets با همین نام‌ها ذخیره شوند:
GROQ_API_KEY, MISTRAL_API_KEY, OPENROUTER_API_KEY
