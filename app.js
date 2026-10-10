/* ====== CONFIG: only the public anon key goes here ====== */
const SUPABASE_URL="https://fuevgplbxulbvajaqncd.supabase.co", SUPABASE_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZXZncGxieHVsYnZhamFxbmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzOTk3MTQsImV4cCI6MjEwNjk3NTcxNH0.eoauwiOCtIaumlfN3UMrZNNCI5J6awxXqK2AetshcuE";
const sb=(window.supabase&&true)?supabase.createClient(SUPABASE_URL,SUPABASE_ANON):null;

/* ====== helpers ====== */
const $=(s,e=document)=>e.querySelector(s);
const nz=v=>parseFloat(String(v).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[,٬،\s]/g,"").replace("٫","."))||0;
const fa=(n,d=2)=>isFinite(n)?Number(n).toLocaleString("fa-IR",{maximumFractionDigits:d}):"—";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const kv=a=>a.map(([k,v])=>`<div class="kv"><small>${k}</small><b>${v}</b></div>`).join("");
const toast=m=>{const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2800)};
let user=null,profile=null;

/* ====== tools ====== */
const N=(k,l,d)=>({k,l,t:"number",d}),S=(k,l,d)=>({k,l,t:"text",d}),A=(k,l,d)=>({k,l,t:"textarea",d,w:1}),D=(k,l,d)=>({k,l,t:"date",d}),O=(k,l,o,d)=>({k,l,t:"select",o,d});
const UNITS={"طول":{"متر":1,"کیلومتر":1000,"سانتی‌متر":.01,"میلی‌متر":.001,"مایل":1609.344,"فوت":.3048,"اینچ":.0254},"وزن":{"کیلوگرم":1,"گرم":.001,"تن":1000,"پوند":.45359237,"اونس":.0283495},"حجم":{"لیتر":1,"میلی‌لیتر":.001,"گالن (آمریکا)":3.785411784,"متر مکعب":1000},"مساحت":{"متر مربع":1,"هکتار":1e4,"کیلومتر مربع":1e6,"فوت مربع":.09290304},"سرعت":{"متر/ثانیه":1,"کیلومتر/ساعت":1/3.6,"مایل/ساعت":.44704},"داده":{"بایت":1,"کیلوبایت":1024,"مگابایت":1048576,"گیگابایت":1073741824}};
const aiFields={article:[S("topic","موضوع"),O("tone","لحن",["رسمی","دوستانه","تخصصی"]),O("len","طول",["کوتاه (۳۰۰ کلمه)","متوسط (۷۰۰ کلمه)","بلند (۱۲۰۰ کلمه)"])],
caption:[S("topic","موضوع پست"),O("tone","لحن",["شاد","لوکس","صمیمی","انگیزشی"])],
ad:[S("product","محصول/خدمت"),S("audience","مخاطب"),O("platform","پلتفرم",["اینستاگرام","تلگرام","پیامک","گوگل ادز"])],
product:[S("name","نام محصول"),A("features","ویژگی‌ها"),O("tone","لحن",["فروشگاهی","لوکس","ساده"])],
reels:[S("topic","موضوع"),O("dur","مدت",["۱۵ ثانیه","۳۰ ثانیه","۶۰ ثانیه"]),O("style","سبک",["آموزشی","طنز","داستانی","فروش"])],
summary:[A("text","متن"),O("len","حجم خلاصه",["خیلی کوتاه","متوسط"])],
rewrite:[A("text","متن")],
tone:[A("text","متن"),O("mode","تبدیل به",["رسمی","دوستانه"])],
resume_ai:[S("name","نام"),S("role","عنوان شغلی"),A("experience","سوابق (خام)"),S("skills","مهارت‌ها")],
ideas:[S("niche","حوزه فعالیت"),O("platform","پلتفرم",["اینستاگرام","یوتیوب","وبلاگ","لینکدین"])],
translate:[A("text","متن"),O("dir","جهت ترجمه",["فارسی به انگلیسی","انگلیسی به فارسی"]),O("tone","لحن",["طبیعی","رسمی"])],
email:[S("purpose","موضوع / هدف نامه"),O("type","نوع",["ایمیل کاری","نامه اداری","درخواست","عذرخواهی"]),O("tone","لحن",["رسمی","دوستانه"])],
hashtag:[S("topic","موضوع پست"),O("platform","پلتفرم",["اینستاگرام","توییتر / X","لینکدین"])],
slogan:[S("business","نوع کسب‌وکار"),A("about","ویژگی‌ها و مخاطب"),O("kind","نوع",["شعار تبلیغاتی","نام برند"])],
bio:[S("job","شغل / حوزه"),A("about","درباره خودت"),O("style","سبک",["رسمی","خلاقانه","کوتاه"])],
prompt:[S("goal","هدفت چیست؟"),O("target","برای",["ChatGPT (متن)","تولید تصویر","برنامه‌نویسی"]),A("details","جزئیات بیشتر")]};
const T=[
{id:"age",c:"محاسبات",i:"🎂",n:"محاسبه سن و تاریخ تولد",d:"سن دقیق، روز تا تولد بعدی و تاریخ شمسی",f:[D("b","تاریخ تولد (میلادی)")],
 run:v=>{const b=new Date(v.b),n=new Date();if(isNaN(b))throw"تاریخ را وارد کنید";let y=n.getFullYear()-b.getFullYear(),m=n.getMonth()-b.getMonth(),d=n.getDate()-b.getDate();if(d<0){m--;d+=new Date(n.getFullYear(),n.getMonth(),0).getDate()}if(m<0){y--;m+=12}
 let nx=new Date(n.getFullYear(),b.getMonth(),b.getDate());if(nx<=n)nx.setFullYear(n.getFullYear()+1);const j=new Intl.DateTimeFormat("fa-IR-u-ca-persian",{dateStyle:"long"}).format(b);
 return kv([["سن",`${fa(y)} سال، ${fa(m)} ماه، ${fa(d)} روز`],["تولد شمسی",j],["روز تا تولد بعدی",fa(Math.ceil((nx-n)/864e5))],["مجموع روز زندگی",fa(Math.floor((n-b)/864e5))]])}},
{id:"bmi",c:"سلامت",i:"⚖️",n:"BMI و وزن ایده‌آل",d:"شاخص توده بدنی و بازه وزن سالم",f:[N("h","قد (cm)",175),N("w","وزن (kg)",70),O("s","جنسیت",["مرد","زن"])],
 run:v=>{const h=nz(v.h)/100,w=nz(v.w);if(!h||!w)throw"قد و وزن را وارد کنید";const b=w/h/h,c=b<18.5?"کم‌وزن":b<25?"طبیعی":b<30?"اضافه‌وزن":"چاقی";const ih=nz(v.h)/2.54-60,dv=(v.s=="مرد"?50:45.5)+2.3*ih;
 return kv([["BMI",fa(b,1)],["وضعیت",c],["بازه وزن سالم",`${fa(18.5*h*h,1)} تا ${fa(24.9*h*h,1)} کیلو`],["وزن ایده‌آل (Devine)",fa(dv,1)+" کیلو"]])}},
{id:"bmr",c:"سلامت",i:"🔥",n:"کالری و BMR",d:"کالری پایه و نیاز روزانه (Mifflin-St Jeor)",f:[O("s","جنسیت",["مرد","زن"]),N("a","سن",30),N("h","قد (cm)",175),N("w","وزن (kg)",70),O("act","فعالیت",[["1.2","کم‌تحرک"],["1.375","سبک"],["1.55","متوسط"],["1.725","زیاد"]])],
 run:v=>{const b=10*nz(v.w)+6.25*nz(v.h)-5*nz(v.a)+(v.s=="مرد"?5:-161),t=b*nz(v.act);return kv([["BMR",fa(b,0)+" kcal"],["نگهداری وزن",fa(t,0)+" kcal"],["کاهش وزن",fa(t-500,0)+" kcal"],["افزایش وزن",fa(t+400,0)+" kcal"]])}},
{id:"pct",c:"محاسبات",i:"％",n:"درصد و درصد تغییر",d:"سه حالت محاسبه درصد",f:[O("m","حالت",[["1","X درصد از Y"],["2","X چند درصد Y است"],["3","درصد تغییر از X به Y"]]),N("x","X",20),N("y","Y",500)],
 run:v=>{const x=nz(v.x),y=nz(v.y);if(v.m=="1")return kv([["نتیجه",fa(x*y/100)]]);if(!y)throw"Y صفر است";if(v.m=="2")return kv([["درصد",fa(x/y*100)+"٪"]]);if(!x)throw"X صفر است";const c=(y-x)/Math.abs(x)*100;return kv([["درصد تغییر",fa(c)+"٪"],["تغییر",c>=0?"افزایش":"کاهش"]])}},
{id:"disc",c:"مالی",i:"🏷️",n:"محاسبه تخفیف",d:"قیمت نهایی و مبلغ صرفه‌جویی",f:[N("p","قیمت اصلی",1000000),N("d","درصد تخفیف",25),N("e","تخفیف دوم (اختیاری)",0)],
 run:v=>{const p=nz(v.p),a=p*(1-nz(v.d)/100),f=a*(1-nz(v.e)/100);return kv([["قیمت نهایی",fa(f,0)],["صرفه‌جویی",fa(p-f,0)],["تخفیف مؤثر",fa((p-f)/p*100)+"٪"]])}},
{id:"pl",c:"مالی",i:"📈",n:"سود و زیان",d:"حاشیه سود و درصد سود",f:[N("c","قیمت خرید",800000),N("s","قیمت فروش",1000000),N("q","تعداد",1)],
 run:v=>{const c=nz(v.c),s=nz(v.s),q=nz(v.q)||1,p=(s-c)*q;return kv([[p>=0?"سود":"زیان",fa(Math.abs(p),0)],["درصد سود از خرید",fa(c?(s-c)/c*100:0)+"٪"],["حاشیه سود از فروش",fa(s?(s-c)/s*100:0)+"٪"]])}},
{id:"loan",c:"مالی",i:"🏦",n:"قسط وام",d:"قسط ماهانه، سود کل و جمع بازپرداخت",f:[N("p","مبلغ وام",500000000),N("r","نرخ سالانه (٪)",23),N("m","تعداد ماه",24)],
 run:v=>{const P=nz(v.p),m=nz(v.m),r=nz(v.r)/1200;if(!P||!m)throw"مبلغ و مدت را وارد کنید";const e=r?P*r*Math.pow(1+r,m)/(Math.pow(1+r,m)-1):P/m;return kv([["قسط ماهانه",fa(e,0)],["جمع بازپرداخت",fa(e*m,0)],["کل سود",fa(e*m-P,0)]])}},
{id:"ci",c:"مالی",i:"🌱",n:"سود مرکب",d:"رشد سرمایه با واریز ماهانه",f:[N("p","سرمایه اولیه",100000000),N("m","واریز ماهانه",5000000),N("r","نرخ سالانه (٪)",20),N("y","سال",5)],
 run:v=>{let b=nz(v.p),r=nz(v.r)/1200,dep=nz(v.m),n=nz(v.y)*12,tot=b;for(let i=0;i<n;i++){b=b*(1+r)+dep;tot+=dep}return kv([["ارزش نهایی",fa(b,0)],["جمع واریزی",fa(tot,0)],["سود حاصل",fa(b-tot,0)]])}},
{id:"rahn",c:"املاک",i:"🏠",n:"تبدیل رهن و اجاره",d:"تبدیل ودیعه به اجاره ماهانه و برعکس",f:[N("r1","رهن فعلی",500000000),N("e1","اجاره فعلی",10000000),N("r2","رهن جدید",300000000),N("k","نرخ تبدیل سالانه (٪)",24)],
 run:v=>{const dr=nz(v.r1)-nz(v.r2),e2=nz(v.e1)+dr*nz(v.k)/1200;if(e2<0)throw"رهن جدید خیلی بیشتر است؛ اجاره منفی می‌شود";return kv([["اجاره جدید ماهانه",fa(e2,0)],["تغییر رهن",fa(dr,0)],["معادل رهن کامل (اجاره صفر)",fa(nz(v.r1)+nz(v.e1)*1200/nz(v.k),0)]])}},
{id:"comm",c:"املاک",i:"🤝",n:"کمیسیون املاک",d:"حق‌الزحمه خریدار و فروشنده با ارزش افزوده",f:[N("p","قیمت معامله",10000000000),N("r","نرخ هر طرف (٪)",0.5),N("v","مالیات ارزش افزوده (٪)",10)],
 run:v=>{const c=nz(v.p)*nz(v.r)/100,t=c*(1+nz(v.v)/100);return kv([["کمیسیون هر طرف",fa(c,0)],["با ارزش افزوده (هر طرف)",fa(t,0)],["مجموع دو طرف",fa(t*2,0)]])}},
...[["article","مقاله‌نویس AI","✍️","مقاله سئو‌شده با ساختار کامل"],["caption","کپشن‌ساز اینستاگرام AI","📸","کپشن و هشتگ آماده"],["ad","تولید متن تبلیغاتی AI","📣","متن‌های فروش اثرگذار"],["product","توضیحات محصول AI","🛍️","توضیح حرفه‌ای برای فروشگاه"],["reels","سناریونویس ریلز AI","🎬","سناریوی صحنه‌به‌صحنه"],["summary","خلاصه‌کننده متن AI","📝","خلاصه و نکات کلیدی"],["rewrite","بازنویسی و اصلاح متن AI","🔁","ویرایش نگارشی و بازنویسی"],["tone","تبدیل متن رسمی/دوستانه AI","🎭","تغییر لحن متن"],["resume_ai","رزومه‌ساز هوشمند AI","📄","متن رزومه حرفه‌ای"],["ideas","تولید عنوان و ایده محتوا AI","💡","۱۰ ایده محتوایی"],["translate","مترجم هوشمند AI","🌐","ترجمه فارسی و انگلیسی"],["email","نامه و ایمیل‌نویس AI","✉️","ایمیل و نامه کامل"],["hashtag","تولید هشتگ AI","#️⃣","۲۰ هشتگ دسته‌بندی‌شده"],["slogan","شعار و نام برند AI","🏷️","۱۰ ایده شعار یا نام"],["bio","بیو اینستاگرام AI","👤","۳ بیوگرافی جذاب"],["prompt","پرامپت‌ساز AI","🪄","پرامپت حرفه‌ای"]].map(([id,n,i,d])=>({id,c:"هوش مصنوعی",i,n,d,ai:1,f:aiFields[id]})),
{id:"qr",c:"ساخت",i:"🔳",n:"QR Code ساز",d:"ساخت و دانلود QR از متن یا لینک",f:[S("t","متن یا لینک","https://"),N("s","اندازه (px)",256)],
 run:(v,o)=>{if(!v.t)throw"متن را وارد کنید";const w=document.createElement("div");w.className="kv";w.style.cssText="grid-column:1/-1;text-align:center";const q=document.createElement("div");q.style.cssText="display:inline-block;background:#fff;padding:14px;border-radius:12px";w.append(q);new QRCode(q,{text:v.t,width:Math.min(nz(v.s)||256,512),height:Math.min(nz(v.s)||256,512)});const b=document.createElement("button");b.className="btn pri";b.textContent="دانلود PNG";b.style.marginTop="14px";b.onclick=()=>{const c=q.querySelector("canvas");const a=document.createElement("a");a.href=c.toDataURL();a.download="sr5-qr.png";a.click()};w.append(document.createElement("br"),b);return w}},
{id:"inv",c:"ساخت",i:"🧾",n:"فاکتورساز",d:"فاکتور قابل چاپ و ذخیره PDF",f:[S("se","فروشنده"),S("by","خریدار"),S("no","شماره فاکتور","۱۰۰۱"),A("it","اقلام (هر خط: نام | تعداد | قیمت واحد)","خدمات طراحی | 2 | 5000000\nهاستینگ | 1 | 2000000"),N("tx","مالیات (٪)",10)],pr:1,
 run:v=>{let sum=0;const rows=v.it.split("\n").filter(x=>x.trim()).map((l,i)=>{const [n,q,p]=l.split("|");const t=nz(q)*nz(p);sum+=t;return `<tr><td>${fa(i+1,0)}</td><td>${esc(n)}</td><td>${fa(nz(q))}</td><td>${fa(nz(p),0)}</td><td>${fa(t,0)}</td></tr>`}).join("");const tx=sum*nz(v.tx)/100;
 return `<div class="sheet"><h2>فاکتور فروش — شماره ${esc(v.no)}</h2><p>تاریخ: ${new Intl.DateTimeFormat("fa-IR",{dateStyle:"long"}).format(new Date())}<br>فروشنده: ${esc(v.se)} | خریدار: ${esc(v.by)}</p><table><tr><th>#</th><th>شرح</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th></tr>${rows}</table><p><br>جمع: ${fa(sum,0)} | مالیات: ${fa(tx,0)}<br><b>قابل پرداخت: ${fa(sum+tx,0)}</b></p></div>`}},
{id:"cv",c:"ساخت",i:"📑",n:"رزومه PDF ساز",d:"رزومه تمیز و آماده ذخیره PDF",f:[S("n","نام و نام خانوادگی"),S("t","عنوان شغلی"),S("c","تماس (تلفن / ایمیل)"),A("s","درباره من"),S("k","مهارت‌ها (با ویرگول)"),A("e","سوابق (هر خط یک مورد)")],pr:1,
 run:v=>`<div class="sheet"><h2>${esc(v.n)}</h2><b>${esc(v.t)}</b><br><small>${esc(v.c)}</small><hr><h3>درباره من</h3><p>${esc(v.s)}</p><h3>مهارت‌ها</h3><p>${v.k.split(/[,،]/).map(x=>`• ${esc(x.trim())}`).join("&nbsp; ")}</p><h3>سوابق</h3>${v.e.split("\n").filter(x=>x.trim()).map(x=>`<p>▪ ${esc(x)}</p>`).join("")}</div>`},
{id:"vc",c:"ساخت",i:"💳",n:"کارت ویزیت دیجیتال",d:"کارت زیبا + دانلود فایل مخاطب (vCard)",f:[S("n","نام"),S("t","سمت"),S("p","تلفن"),S("e","ایمیل"),S("w","وب‌سایت")],
 run:v=>{const w=document.createElement("div");w.style.gridColumn="1/-1";w.innerHTML=`<div class="vc"><div><h2>${esc(v.n)}</h2><span style="color:var(--b)">${esc(v.t)}</span></div><div style="font-size:13px;line-height:1.9">📞 ${esc(v.p)}<br>✉️ ${esc(v.e)}<br>🌐 ${esc(v.w)}</div></div>`;const b=document.createElement("button");b.className="btn pri";b.textContent="دانلود vCard";b.style.marginTop="14px";b.onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([`BEGIN:VCARD\nVERSION:3.0\nFN:${v.n}\nTITLE:${v.t}\nTEL:${v.p}\nEMAIL:${v.e}\nURL:${v.w}\nEND:VCARD`],{type:"text/vcard"}));a.download="contact.vcf";a.click()};w.append(b);return w}},
{id:"unit",c:"ابزار",i:"📐",n:"تبدیل واحد",d:"طول، وزن، حجم، مساحت، سرعت و داده",f:[O("c","دسته",Object.keys(UNITS)),N("x","مقدار",1),S("from","از واحد","متر"),S("to","به واحد","کیلومتر")],unit:1,
 run:v=>{const u=UNITS[v.c];if(!u[v.from]||!u[v.to])throw"واحد را از لیست انتخاب کنید";return kv([["نتیجه",fa(nz(v.x)*u[v.from]/u[v.to],6)+" "+v.to]])}},
{id:"temp",c:"ابزار",i:"🌡️",n:"تبدیل دما",d:"سانتی‌گراد، فارنهایت و کلوین",f:[N("x","مقدار",25),O("u","واحد",["سانتی‌گراد","فارنهایت","کلوین"])],
 run:v=>{const x=nz(v.x),c=v.u=="سانتی‌گراد"?x:v.u=="فارنهایت"?(x-32)*5/9:x-273.15;return kv([["سانتی‌گراد",fa(c)+"°"],["فارنهایت",fa(c*9/5+32)+"°"],["کلوین",fa(c+273.15)]])}},
{id:"fuel",c:"خودرو",i:"⛽",n:"محاسبه مصرف سوخت",d:"لیتر در ۱۰۰ کیلومتر و هزینه هر کیلومتر",f:[N("k","مسافت (km)",400),N("l","سوخت مصرفی (لیتر)",32),N("p","قیمت هر لیتر",5000)],
 run:v=>{const k=nz(v.k),l=nz(v.l);if(!k||!l)throw"مقادیر را وارد کنید";return kv([["لیتر در ۱۰۰ کیلومتر",fa(l/k*100)],["کیلومتر بر لیتر",fa(k/l)],["هزینه هر کیلومتر",fa(l*nz(v.p)/k,0)],["هزینه کل",fa(l*nz(v.p),0)]])}},
{id:"dep",c:"خودرو",i:"🚗",n:"محاسبه افت قیمت خودرو",d:"تخمین ارزش با افت سنی و کارکرد",f:[N("p","قیمت امروز (صفر)",1000000000),N("y","سن خودرو (سال)",3),N("k","کارکرد (km)",60000),N("r","افت سالانه (٪)",8)],
 run:v=>{const p=nz(v.p),a=p*Math.pow(1-nz(v.r)/100,nz(v.y)),km=Math.min(nz(v.k)/10000*.01,.4),e=a*(1-km);return kv([["ارزش تخمینی",fa(e,0)],["افت کل",fa(p-e,0)],["درصد افت",fa((p-e)/p*100)+"٪"]])}},
{id:"wc",c:"ابزار",i:"🔤",n:"شمارش کلمات و کاراکتر",d:"کلمه، کاراکتر، جمله و زمان مطالعه",f:[A("t","متن")],live:1,
 run:v=>{const t=v.t,w=(t.trim().match(/\S+/g)||[]).length;return kv([["کلمه",fa(w,0)],["کاراکتر",fa(t.length,0)],["بدون فاصله",fa(t.replace(/\s/g,"").length,0)],["جمله",fa((t.match(/[.!؟?!]+/g)||[]).length,0)],["خط",fa(t?t.split("\n").length:0,0)],["زمان مطالعه",fa(Math.ceil(w/200),0)+" دقیقه"]])}},
{id:"pw",c:"ابزار",i:"🔐",n:"رمزساز امن",d:"رمز تصادفی قوی با crypto مرورگر",f:[N("l","طول",16),O("o","شامل",[["a","حروف+عدد+نماد"],["b","حروف+عدد"],["c","فقط عدد"]])],
 run:v=>{const L=Math.min(Math.max(nz(v.l)||16,4),128),cs={a:"abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*-_?",b:"abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789",c:"0123456789"}[v.o],a=new Uint32Array(L);crypto.getRandomValues(a);const p=[...a].map(x=>cs[x%cs.length]).join("");const bits=Math.log2(cs.length)*L;
 return `<div class="kv" style="grid-column:1/-1"><small>رمز شما (برای کپی کلیک کنید)</small><b dir="ltr" style="cursor:pointer;word-break:break-all;display:block;text-align:left" onclick="navigator.clipboard.writeText(this.textContent);toast('کپی شد')">${esc(p)}</b><small style="margin-top:8px">قدرت: ${fa(bits,0)} بیت — ${bits>80?"عالی":bits>50?"خوب":"ضعیف"}</small></div>`}}
];
const CATS=["همه",...new Set(T.map(t=>t.c))];

/* ====== views ====== */
let cat="همه",q="";
const SITE_URL="https://amirsr5.github.io/SR5-tools/",TG="https://t.me/sr5_admin";
let IMG={},SET={};
const sn=(k,d)=>{const v=parseInt(SET[k]);return isNaN(v)?d:v};
const ti=t=>IMG[t.id]?`<img class="cv" src="${IMG[t.id]}" alt="${esc(t.n)}" loading="lazy">`:`<div class="ic">${t.i}</div>`;
async function loadMeta(){if(!sb)return;try{const[a,b]=await Promise.all([sb.from("tool_images").select("*"),sb.from("settings").select("*")]);IMG=Object.fromEntries((a.data||[]).map(r=>[r.tool,r.url]));SET=Object.fromEntries((b.data||[]).map(r=>[r.key,r.value]))}catch(_){}
 const e=$("#enamad");if(e&&SET.enamad_html)e.innerHTML=SET.enamad_html}
async function logout(){try{await Promise.race([sb.auth.signOut({scope:"local"}),new Promise(r=>setTimeout(r,2000))])}catch(_){}
 try{Object.keys(localStorage).filter(k=>k.startsWith("sb-")).forEach(k=>localStorage.removeItem(k))}catch(_){}
 user=profile=null;location.hash="#/";location.reload()}
function nav(){const h=location.hash||"#/",on=p=>h==p?"on":"";const n=$("#nav");
 n.innerHTML=`<a class="btn hide-m" href="#/chat">💬 چت‌بات</a><a class="btn hide-m" href="#/pricing">💎 اشتراک</a><a class="btn hide-m" href="#/about">درباره ما</a>`+(user?`<a class="btn hide-m" href="#/dash">⚡ ${fa(profile?.credits??0,0)} اعتبار</a>${profile?.role=="admin"?'<a class="btn hide-m" href="#/admin">🛡️ ادمین</a>':""}<button class="btn hide-m" id="lo">خروج</button>`:`<button class="btn pri" id="li">ورود با Google</button>`);
 $("#bn").innerHTML=`<a href="#/" class="${h=="#/"||h.startsWith("#/t/")?"on":""}"><span>🧰</span>ابزارها</a><a href="#/chat" class="${on("#/chat")}"><span>💬</span>چت</a><a href="#/pricing" class="${on("#/pricing")}"><span>💎</span>اشتراک</a>`+(user?`<a href="#/dash" class="${on("#/dash")}"><span>⚡</span>${fa(profile?.credits??0,0)}</a>`+(profile?.role=="admin"?`<a href="#/admin" class="${on("#/admin")}"><span>🛡️</span>ادمین</a>`:""):`<button id="li2"><span>🔑</span>ورود</button>`);
 $("#bk").style.display=(h=="#/"||h=="")?"none":"inline-flex";
 for(const i of["li","li2"])$("#"+i)&&($("#"+i).onclick=login);$("#lo")&&($("#lo").onclick=logout)}
async function webLogin(){await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}})}
async function login(){if(!sb)return toast("ابتدا Supabase را در index.html تنظیم کنید");
 if(window.SR5Native){if(window._ngl)return;window._ngl=1;toast("در حال ورود…");setTimeout(()=>{window._ngl=0},60000);window.SR5Native.signInWithGoogle();return}
 await webLogin()}
window.onNativeGoogleResult=async(token,nonce)=>{window._ngl=0;try{const{error}=await sb.auth.signInWithIdToken({provider:"google",token,nonce});if(error)throw error;await loadProfile();toast("وارد شدید ✅");route()}catch(e){toast("خطا در ورود: "+(e.message||e))}};
window.onNativeGoogleError=t=>{window._ngl=0;if(/CANCEL/i.test(String(t)))return;webLogin()};
async function loadProfile(){if(!sb)return;try{const{data:{session}}=await sb.auth.getSession();user=session?.user||null;profile=null;if(user){const{data}=await sb.from("profiles").select("*").eq("id",user.id).single();const{data:q}=await sb.rpc("my_quota");profile=data?{...data,...(q||{})}:null}}catch(e){}nav()}
const CD={"محاسبات":["🧮","سن، درصد، تخفیف و محاسبات روزمره"],"سلامت":["💪","BMI، کالری و وزن ایده‌آل"],"مالی":["💰","وام، سود مرکب، سود و زیان"],"املاک":["🏠","تبدیل رهن و اجاره و کمیسیون"],"هوش مصنوعی":["🤖","مقاله، کپشن، ریلز، رزومه و بیشتر"],"ساخت":["🛠️","QR، فاکتور، رزومه PDF، کارت ویزیت"],"ابزار":["⚙️","تبدیل واحد و دما، شمارش کلمات، رمزساز"],"خودرو":["🚗","مصرف سوخت و افت قیمت"]};
function renderGrid(){const list=T.filter(t=>(cat=="همه"||t.c==cat)&&(t.n+t.d).includes(q));
 $("#cats").innerHTML=CATS.map(c=>`<button class="btn ${c==cat?"on":""}" data-c="${c}">${c}</button>`).join("");
 $("#grid").innerHTML=list.map((t,i)=>`<div class="tc sr" style="--d:${Math.min(i%8,7)}" data-id="${t.id}">${t.ai?'<span class="tag">AI</span>':""}${ti(t)}<h3>${t.n}</h3><p>${t.d}</p></div>`).join("")||'<p style="grid-column:1/-1;text-align:center;color:var(--mu)">چیزی پیدا نشد</p>';
 document.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{cat=b.dataset.c;renderGrid()});
 document.querySelectorAll(".tc").forEach(c=>c.onclick=()=>location.hash="#/t/"+c.dataset.id);observe()}
function scrolly(){const sc=$("#sc"),v=$("#sv");if(!sc)return;let target=0,cur=0,last=-1;const N=90,cx=v.getContext("2d"),fr=[];for(let i=0;i<N;i++){const im=new Image();im.decoding="async";im.src="sf-"+String(i+1).padStart(3,"0")+".webp";im.onload=()=>{im.ok=1;last=-1};fr.push(im)}const ly=[...sc.querySelectorAll(".ly")];
 const upd=()=>{if(!sc.isConnected)return removeEventListener("scroll",upd);const h=sc.offsetHeight-innerHeight;target=Math.min(1,Math.max(0,-sc.getBoundingClientRect().top/h))};
 addEventListener("scroll",upd,{passive:true});addEventListener("resize",upd);upd();
  (function loop(){if(!sc.isConnected)return;cur+=(target-cur)*.14;if(Math.abs(target-cur)<.0005)cur=target;
  {const k=Math.min(N-1,Math.round(cur*(N-1)));if(k!==last){let j=k;while(j>=0&&!fr[j].ok)j--;if(j<0)j=fr.findIndex(f=>f.ok);if(j>=0){cx.drawImage(fr[j],0,0,1280,720);last=k}}}
  $("#pb").style.transform=`scaleX(${cur})`;
  for(const l of ly){const a=+l.dataset.a,b=+l.dataset.b,k=(cur-a)/(b-a);let o=1;if(!l.dataset.f)o=Math.min(o,k/.22);if(!l.dataset.l)o=Math.min(o,(1-k)/.22);o=Math.max(0,Math.min(1,o));l.style.opacity=o;l.style.transform=`translate3d(0,${(1-o)*(k<.5?36:-36)}px,0) scale(${.96+.04*o})`;l.style.pointerEvents=o>.6?"auto":"none"}
  requestAnimationFrame(loop)})()}
function home(){document.title="SR5 Tools | ۳۶ ابزار هوشمند آنلاین فارسی";
 const cc=c=>T.filter(t=>t.c==c).length;
 $("#view").innerHTML=`<section id="sc" class="sc"><div class="stage"><canvas id="sv" width="1280" height="720"></canvas><div class="shade"></div>
 <div class="ly" data-a="0" data-b=".26" data-f="1"><div class="orb"><img src="logo.png" alt="SR5 Tools"></div><h1>SR5 <span>Tools</span></h1><p>پلتفرم ابزارهای هوشمند فارسی</p><div class="hint">برای شروع پایین بکش<b>↓</b></div></div>
 <div class="ly" data-a=".26" data-b=".52"><span class="pill">۱ / ۳</span><h2>۳۶ ابزار واقعی</h2><p>ماشین‌حساب مالی و سلامت، فاکتور، رزومه PDF، QR و کارت ویزیت؛ همه سریع و داخل مرورگر.</p></div>
 <div class="ly" data-a=".52" data-b=".78"><span class="pill">۲ / ۳</span><h2>هوش مصنوعی فارسی</h2><p>مقاله، کپشن اینستاگرام، سناریوی ریلز و رزومه؛ با پشتیبان‌گیری خودکار بین چند موتور AI.</p></div>
 <div class="ly" data-a=".78" data-b="1" data-l="1"><span class="pill">۳ / ۳</span><h2>۳ اعتبار رایگان</h2><p>با ورود Google شروع کن. ابزارهای غیر AI همیشه رایگانند.</p><div class="cta"><button class="btn pri lg" id="c1">ورود و شروع</button><button class="btn lg" id="c2">مشاهده ابزارها ↓</button></div></div>
 <div class="pbar"><i id="pb"></i></div></div></section>
 <section class="stats"><div class="st sr"><b data-n="36">۰</b><small>ابزار واقعی</small></div><div class="st sr" style="--d:1"><b data-n="16">۰</b><small>ابزار هوش مصنوعی</small></div><div class="st sr" style="--d:2"><b data-n="8">۰</b><small>دسته‌بندی</small></div><div class="st sr" style="--d:3"><b data-n="3">۰</b><small>اعتبار رایگان</small></div></section>
 <div class="band sr" style="margin:50px 0 0"><h2>💬 چت‌بات هوشمند</h2><p>با هوش مصنوعی فارسی گفتگو کن؛ ۵ پیام رایگان برای هر کاربر.</p><a class="btn pri lg" href="#/chat">شروع گفتگو</a></div>
 <h2 class="h2 sr" id="catsec">دسته‌بندی ابزارها</h2><p class="sub sr">یک دسته را انتخاب کن تا ابزارهایش را ببینی</p>
 <div class="cgrid">${Object.entries(CD).map(([c,[i,d]],k)=>`<div class="cc sr" style="--d:${k%4}" data-cc="${c}"><span class="ci">${i}</span><h3>${c}</h3><p>${d}</p><small>${fa(cc(c),0)} ابزار ←</small></div>`).join("")}</div>
 <h2 class="h2 sr" id="tools">همه ابزارهای هوشمند</h2><p class="sub sr">دنبال چی می‌گردی؟</p>
 <input class="srch sr" id="q" placeholder="جستجوی ابزار…" value="${esc(q)}"><div class="cats" id="cats"></div><div class="grid" id="grid"></div>
 <h2 class="h2 sr">چطور کار می‌کند؟</h2><div class="steps"><div class="sp sr"><em>۱</em><h3>ورود با Google</h3><p>با یک کلیک وارد شو و ۳ اعتبار رایگان دریافت کن.</p></div><div class="sp sr" style="--d:1"><em>۲</em><h3>انتخاب ابزار</h3><p>از بین ۳۶ ابزار محاسباتی، ساخت و هوش مصنوعی انتخاب کن.</p></div><div class="sp sr" style="--d:2"><em>۳</em><h3>نتیجه آماده</h3><p>خروجی را کپی کن، چاپ کن یا به‌صورت PDF ذخیره کن.</p></div></div>
 ${plansHTML()}<div class="band sr"><h2>آماده‌ای شروع کنی؟</h2><p>ابزارهای غیر AI همیشه رایگان و بدون ورود قابل استفاده‌اند.</p><button class="btn pri lg" id="c3">ورود و دریافت ۳ اعتبار</button></div>`;
 $("#q").oninput=e=>{q=e.target.value;renderGrid()};
 const to=id=>document.getElementById(id).scrollIntoView({behavior:"smooth"});
 $("#c1").onclick=()=>user?to("catsec"):login();$("#c3").onclick=()=>user?to("tools"):login();$("#c2").onclick=()=>to("catsec");
 document.querySelectorAll("[data-cc]").forEach(e=>e.onclick=()=>{cat=e.dataset.cc;renderGrid();to("tools")});
 if(matchMedia("(hover:hover) and (min-width:769px)").matches)$("#grid").onmousemove=e=>{const c=e.target.closest(".tc");if(c){const r=c.getBoundingClientRect();c.style.setProperty("--mx",e.clientX-r.left+"px");c.style.setProperty("--my",e.clientY-r.top+"px")}};
 renderGrid();scrolly();observe()}
function field(f){const id="f_"+f.k;let el;if(f.t=="select")el=`<select id="${id}">${f.o.map(o=>Array.isArray(o)?`<option value="${o[0]}">${o[1]}</option>`:`<option>${o}</option>`).join("")}</select>`;
 else if(f.t=="textarea")el=`<textarea id="${id}">${esc(f.d??"")}</textarea>`;else el=`<input id="${id}" type="${f.t=="date"?"date":"text"}" inputmode="${f.t=="number"?"decimal":"text"}" value="${esc(f.d??"")}" ${f.k=="from"||f.k=="to"?'list="ul"':""}>`;
 return `<label class="${f.w?"w":""}">${f.l}${el}</label>`}
function tool(id){const t=T.find(x=>x.id==id);if(!t)return location.hash="#/";document.title=t.n+" | SR5 Tools";
 $("#view").innerHTML=`<div class="panel"><a href="#/">← همه ابزارها</a>${IMG[t.id]?`<img class="banner" src="${IMG[t.id]}" alt="">`:""}<h2 style="margin:10px 0 4px">${t.i} ${t.n}</h2><p style="color:var(--mu);margin-bottom:18px">${t.d}${t.ai?" — هر اجرای موفق ۱ اعتبار مصرف می‌کند.":""}</p><div class="f">${t.f.map(field).join("")}${t.unit?`<datalist id="ul">${Object.keys(UNITS[Object.keys(UNITS)[0]]).map(u=>`<option>${u}</option>`).join("")}</datalist>`:""}</div><div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn pri" id="go">${t.ai?"تولید با هوش مصنوعی":"محاسبه"}</button>${t.pr?'<button class="btn" id="pr">چاپ / ذخیره PDF</button>':""}</div><div class="out" id="out"></div></div>`;
 const vals=()=>Object.fromEntries(t.f.map(f=>[f.k,$("#f_"+f.k).value]));const out=$("#out");
 if(t.unit){const c=$("#f_c");c.onchange=()=>{$("#ul").innerHTML=Object.keys(UNITS[c.value]).map(u=>`<option>${u}</option>`).join("");const k=Object.keys(UNITS[c.value]);$("#f_from").value=k[0];$("#f_to").value=k[1]}}
 const show=r=>{out.innerHTML="";typeof r=="string"?out.innerHTML=r:out.append(r)};
 const exec=async()=>{try{if(t.ai){if(!user)return(toast("برای استفاده از ابزارهای AI وارد شوید"),login());if(!profile)throw"پروفایل هنوز ساخته نشده؛ یک‌بار خروج و ورود دوباره بزنید.";if(profile.role!="admin"&&profile.credits<1)throw"اعتبار شما تمام شده است.";
   const v=vals();if(!Object.values(v)[0].trim())throw"فیلد اول را پر کنید";$("#go").disabled=true;out.innerHTML='<div class="txt">⏳ در حال تولید…</div>';
   const{data,error}=await Promise.race([sb.functions.invoke("ai",{body:{tool:t.id,fields:v}}),new Promise((_,rj)=>setTimeout(()=>rj("پاسخی از سرور نیامد (۷۰ ثانیه). اینترنت را چک کن و دوباره تلاش کن؛ اعتباری کم نشد."),70000))]);$("#go").disabled=false;if(error||data?.error){let m=data?.error;try{if(!m&&error.context)m=(await error.context.json()).error}catch(_){}throw m||"خطا در ارتباط با سرور"}
   out.innerHTML=`<div class="txt" id="aiout">${esc(data.text)}</div><div style="grid-column:1/-1;display:flex;gap:8px"><button class="btn" onclick="navigator.clipboard.writeText($('#aiout').textContent);toast('کپی شد')">کپی</button></div>`;profile.credits=data.credits;nav()}
  else show(t.run(vals()))}catch(e){$("#go").disabled=false;out.innerHTML=`<div class="err">${esc(e)}</div>`}};
 $("#go").onclick=exec;$("#pr")&&($("#pr").onclick=async()=>{await exec();setTimeout(()=>print(),200)});if(t.live)$("#f_t").oninput=exec;reveal(1)}

function plansHTML(buy){const fc=sn("free_credits",3),fh=sn("free_chat",5),pc=sn("pro_credits",12),ph=sn("pro_chat",12),pr=sn("price_toman",30000);const b=buy?`href="${buy}" target="_blank" rel="noopener"`:'href="#/pricing"';
 return `<h2 class="h2 sr">اشتراک ویژه</h2><p class="sub sr">اعتبار و پیام چت هر روز شارژ می‌شود (ساعت ۱۲ شب به وقت ایران)</p><div class="plans"><div class="plan sr"><h3>رایگان</h3><div class="pp">۰ <small>تومان</small></div><ul><li>${fa(fc,0)} اعتبار هوش مصنوعی در روز</li><li>${fa(fh,0)} پیام چت‌بات در روز</li><li>۲۰ ابزار غیر AI نامحدود</li></ul><a class="btn" href="#/">شروع کن</a></div><div class="plan pro sr" style="--d:1"><span class="tag">پیشنهادی</span><h3>ویژه ۱ ماهه</h3><div class="pp">${fa(pr,0)} <small>تومان / ماه</small></div><ul><li>${fa(pc,0)} اعتبار هوش مصنوعی در روز</li><li>${fa(ph,0)} پیام چت‌بات در روز</li><li>۲۰ ابزار غیر AI نامحدود</li></ul><a class="btn pri" ${b}>${buy?"خرید از طریق تلگرام":"خرید اشتراک"}</a></div></div>`}
function pricing(){document.title="اشتراک ویژه | SR5 Tools";const pu=profile?.is_pro&&profile?.pro_until?new Date(profile.pro_until).toLocaleDateString("fa-IR"):"";
 $("#view").innerHTML=`<div class="panel"><h2>💎 اشتراک ویژه</h2>${pu?`<p style="color:var(--b)">اشتراک ویژه شما تا ${pu} فعال است.</p>`:""}${plansHTML(TG)}<div class="kv" style="margin-top:18px"><small>پرداخت آنلاین</small><p style="line-height:2;color:var(--mu)">درگاه پرداخت آنلاین به‌زودی فعال می‌شود. تا آن زمان، برای خرید اشتراک در تلگرام به <a href="${TG}" target="_blank" rel="noopener">@sr5_admin</a> پیام بده؛ بعد از پرداخت، اشتراکت همان لحظه فعال می‌شود.</p></div></div>`;observe()}
function about(){document.title="درباره ما | SR5 Tools";
 $("#view").innerHTML=`<div class="panel about"><img src="logo.png" alt="SR5 Tools" class="al"><h2>درباره ما</h2><p>سلام! من <b>امیرحسین سرافراز</b> هستم، سازنده SR5 Tools. این پروژه را ساختم تا مجموعه‌ای سریع، ساده و کاربردی از ابزارهای آنلاین فارسی، از ماشین‌حساب‌های روزمره تا ابزارهای هوش مصنوعی برای تولید محتوا، یک‌جا در دسترس باشد. اگر پیشنهاد، انتقاد یا ایده‌ای برای ابزار جدید داری، خوشحال می‌شوم بشنوم.</p><div class="out"><a class="kv" href="tel:+989037241969"><small>📞 شماره تماس</small><b dir="ltr">0903 724 1969</b></a><a class="kv" href="mailto:info@amirhooseinsarafraz.ir"><small>✉️ ایمیل</small><b dir="ltr" style="font-size:15px">info@amirhooseinsarafraz.ir</b></a><a class="kv" href="${TG}" target="_blank" rel="noopener"><small>💬 تلگرام</small><b dir="ltr">@sr5_admin</b></a><a class="kv" href="https://amirhooseinsarafraz.ir" target="_blank" rel="noopener"><small>🌐 وب‌سایت من</small><b dir="ltr" style="font-size:15px">amirhooseinsarafraz.ir</b></a></div></div>`}
async function dash(){if(!user){location.hash="#/";return login()}
 let log=[];try{const{data}=await sb.from("usage_log").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30);log=data||[]}catch(_){}
 const p=profile||{},adm=p.role=="admin";
 $("#view").innerHTML=`<div class="panel"><h2>⚡ حساب من</h2><p style="color:var(--mu);font-size:13px;margin:4px 0 14px" dir="ltr">${esc(user.email||"")}</p><div class="stat"><div class="kv"><small>اعتبار AI امروز</small><b>${adm?"∞":fa(p.credits??0,0)+" / "+fa(p.credits_limit??3,0)}</b></div><div class="kv"><small>پیام چت امروز</small><b>${adm?"∞":fa(p.chat_left??0,0)+" / "+fa(p.chat_limit??5,0)}</b></div><div class="kv"><small>پلن</small><b style="font-size:16px">${p.is_pro?"💎 ویژه تا "+new Date(p.pro_until).toLocaleDateString("fa-IR"):"رایگان"}</b></div></div><p style="color:var(--mu);font-size:13px;margin:12px 0">اعتبار و پیام‌ها هر شب ساعت ۱۲ (به وقت ایران) دوباره شارژ می‌شوند.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px"><a class="btn pri" href="#/pricing">💎 ارتقا به اشتراک ویژه</a><button class="btn" id="lo3">خروج از حساب</button></div><h3>تاریخچه استفاده</h3><table>${log.map(l=>`<tr><td>${T.find(t=>t.id==l.tool)?.n||l.tool}</td><td>${l.provider||""}</td><td>${new Date(l.created_at).toLocaleString("fa-IR")}</td></tr>`).join("")||"<tr><td>هنوز استفاده‌ای نداشته‌اید</td></tr>"}</table></div>`;
 $("#lo3").onclick=logout}
/* ====== admin ====== */
let atab="users";
/* ====== image crop / resize dialog ====== */
async function loadImg(src){try{if(src instanceof Blob)return await createImageBitmap(src)}catch(_){}
 return await new Promise((ok,no)=>{const i=new Image(),u=src instanceof Blob?URL.createObjectURL(src):src;i.onload=()=>ok(i);i.onerror=()=>no("این فرمت تصویر پشتیبانی نمی‌شود (JPG یا PNG بفرست)");i.src=u})}
function cropDialog(file){return new Promise(async res=>{
 let img;try{img=await loadImg(file)}catch(e){toast(String(e));return res(null)}
 const iw=img.width||img.naturalWidth,ih=img.height||img.naturalHeight,W=1000,H=500,fit=Math.min(W/iw,H/ih),cover=Math.max(W/iw,H/ih),MAX=cover*4;
 let s=cover,cx=W/2,cy=H/2;
 const m=document.createElement("div");m.className="md";
 m.innerHTML=`<div class="crop"><h3>تنظیم تصویر</h3><p style="color:var(--mu);font-size:13px;line-height:1.9">تصویر را بکش تا جابه‌جا شود. با اسلایدر (یا دو انگشت / چرخ ماوس) بزرگ و کوچک کن. کادر، نسبت ۲ به ۱ است؛ همان چیزی که روی کارت ابزار دیده می‌شود.</p><div class="cw"><canvas id="cc" width="${W}" height="${H}"></canvas></div><input type="range" id="cz" min="0" max="100" step="0.5"><div class="ub"><button class="btn" id="cfit">همه تصویر در کادر</button><button class="btn" id="cfill">پر کردن کادر</button></div><div class="ub"><button class="btn pri" id="cok">ثبت و آپلود</button><button class="btn" id="cno">انصراف</button></div></div>`;
 document.body.append(m);const cv=m.querySelector("#cc"),ctx=cv.getContext("2d"),z=m.querySelector("#cz");
 const clamp=()=>{const w=iw*s,h=ih*s;cx=w>=W?Math.min(w/2,Math.max(W-w/2,cx)):W/2;cy=h>=H?Math.min(h/2,Math.max(H-h/2,cy)):H/2};
 const draw=()=>{clamp();ctx.fillStyle="#0a121d";ctx.fillRect(0,0,W,H);ctx.drawImage(img,cx-iw*s/2,cy-ih*s/2,iw*s,ih*s);z.value=MAX>fit?(s-fit)/(MAX-fit)*100:0};
 const setS=n=>{s=Math.min(MAX,Math.max(fit,n));draw()};
 z.oninput=()=>setS(fit+(MAX-fit)*z.value/100);
 m.querySelector("#cfit").onclick=()=>{cx=W/2;cy=H/2;setS(fit)};m.querySelector("#cfill").onclick=()=>{cx=W/2;cy=H/2;setS(cover)};
 const P=new Map();let pd=0;const k=()=>cv.width/cv.getBoundingClientRect().width;
 cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);pd=0;cv.style.cursor="grabbing"};
 cv.onpointermove=e=>{if(!P.has(e.pointerId))return;const o=P.get(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);
  if(P.size==1){cx+=(e.clientX-o[0])*k();cy+=(e.clientY-o[1])*k();draw()}
  else if(P.size==2){const[a,b]=[...P.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd)setS(s*d/pd);pd=d}};
 cv.onpointerup=cv.onpointercancel=e=>{P.delete(e.pointerId);pd=0;cv.style.cursor="grab"};
 cv.onwheel=e=>{e.preventDefault();setS(s*(e.deltaY<0?1.08:.92))};
 const done=v=>{m.remove();res(v)};
 m.querySelector("#cno").onclick=()=>done(null);
 m.querySelector("#cok").onclick=()=>cv.toBlob(b=>done(b),"image/jpeg",.86);
 draw()})}
async function upBlob(id,blob){const path=`${id}-${Date.now()}.jpg`;const{error}=await sb.storage.from("tool-images").upload(path,blob,{contentType:"image/jpeg"});if(error)throw error;const{data}=sb.storage.from("tool-images").getPublicUrl(path);const r=await sb.from("tool_images").upsert({tool:id,url:data.publicUrl,updated_at:new Date().toISOString()});if(r.error)throw r.error;IMG[id]=data.publicUrl}
async function admin(){if(profile?.role!="admin"){location.hash="#/";return}
 const tabs=[["users","👥 کاربران"],["images","🖼️ تصاویر ابزارها"],["settings","⚙️ تنظیمات"],["usage","📊 استفاده"]];
 $("#view").innerHTML=`<div class="panel"><h2>🛡️ پنل ادمین</h2><div class="cats tabs">${tabs.map(([k,l])=>`<button class="btn ${k==atab?"on":""}" data-t="${k}">${l}</button>`).join("")}</div><div id="at">⏳</div></div>`;
 document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{atab=b.dataset.t;admin()});
 try{await({users:aUsers,images:aImages,settings:aSettings,usage:aUsage})[atab]()}catch(e){$("#at").innerHTML=`<div class="err">${esc(e.message||e)}</div>`}}
async function aUsers(){const{data:us,error}=await sb.from("profiles").select("*").order("created_at",{ascending:false});if(error)throw error;const now=Date.now(),isP=u=>u.pro_until&&new Date(u.pro_until)>now;
 $("#at").innerHTML=`<div class="stat"><div class="kv"><small>کاربران</small><b>${fa(us.length,0)}</b></div><div class="kv"><small>اشتراک فعال</small><b>${fa(us.filter(isP).length,0)}</b></div></div><div class="ulist">${us.map(u=>`<div class="uc"><div dir="ltr" class="ue">${esc(u.email||"")}</div><small>${isP(u)?"💎 ویژه تا "+new Date(u.pro_until).toLocaleDateString("fa-IR"):"رایگان"}</small><div class="ur"><label>اعتبار امروز<input type="number" min="0" value="${u.credits}" data-cr="${u.id}"></label><label>نقش<select data-ro="${u.id}"><option ${u.role=="user"?"selected":""}>user</option><option ${u.role=="admin"?"selected":""}>admin</option></select></label></div><div class="ub"><button class="btn" data-sv="${u.id}">ذخیره</button><button class="btn pri" data-p30="${u.id}">+۳۰ روز ویژه</button>${isP(u)?`<button class="btn" data-pc="${u.id}">لغو اشتراک</button>`:""}</div></div>`).join("")}</div>`;
 const upd=async(id,o,m)=>{const r=await sb.from("profiles").update(o).eq("id",id);toast(r.error?"خطا: "+r.error.message:m);if(!r.error)aUsers()};
 document.querySelectorAll("[data-sv]").forEach(b=>b.onclick=()=>{const id=b.dataset.sv;upd(id,{credits:parseInt($(`[data-cr="${id}"]`).value)||0,role:$(`[data-ro="${id}"]`).value},"ذخیره شد")});
 document.querySelectorAll("[data-p30]").forEach(b=>b.onclick=()=>{const id=b.dataset.p30,u=us.find(x=>x.id==id),base=isP(u)?new Date(u.pro_until).getTime():Date.now();upd(id,{pro_until:new Date(base+30*864e5).toISOString(),credits_day:null},"اشتراک ۳۰ روزه فعال شد")});
 document.querySelectorAll("[data-pc]").forEach(b=>b.onclick=()=>upd(b.dataset.pc,{pro_until:null,credits_day:null},"اشتراک لغو شد"))}
async function aImages(){$("#at").innerHTML=`<p class="sub" style="text-align:right">برای هر ابزار یک تصویر شاخص آپلود کن؛ خودکار کوچک و بهینه می‌شود.</p><div class="igrid">${T.map(t=>`<div class="ic2"><div class="ph">${IMG[t.id]?`<img src="${IMG[t.id]}" alt="">`:`<span>${t.i}</span>`}</div><small>${t.n}</small><div class="ub"><label class="btn">آپلود<input type="file" accept="image/*" hidden data-up="${t.id}"></label>${IMG[t.id]?`<button class="btn" data-ed="${t.id}">ویرایش</button><button class="btn" data-del="${t.id}">حذف</button>`:""}</div></div>`).join("")}</div>`;
 const sendImg=async(id,src)=>{try{const blob=await cropDialog(src);if(!blob)return;toast("در حال آپلود…");await upBlob(id,blob);toast("آپلود شد ✅");aImages()}catch(e){toast("خطا: "+(e.message||e))}};
 document.querySelectorAll("[data-up]").forEach(i=>i.onchange=()=>{const f=i.files[0];i.value="";if(f)sendImg(i.dataset.up,f)});
 document.querySelectorAll("[data-ed]").forEach(b=>b.onclick=async()=>{try{const r=await fetch(IMG[b.dataset.ed]);sendImg(b.dataset.ed,await r.blob())}catch(e){toast("باز کردن تصویر ممکن نشد؛ یک تصویر جدید آپلود کن")}});
 document.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{const r=await sb.from("tool_images").delete().eq("tool",b.dataset.del);if(r.error)return toast("خطا: "+r.error.message);delete IMG[b.dataset.del];aImages()})}
async function aSettings(){const SF=[["free_credits","اعتبار AI روزانه (رایگان)"],["free_chat","پیام چت روزانه (رایگان)"],["pro_credits","اعتبار AI روزانه (ویژه)"],["pro_chat","پیام چت روزانه (ویژه)"],["price_toman","قیمت اشتراک یک‌ماهه (تومان)"]];
 $("#at").innerHTML=`<div class="f">${SF.map(([k,l])=>`<label>${l}<input type="number" min="0" id="s_${k}" value="${esc(SET[k]??"")}"></label>`).join("")}<label class="w">کد نماد اعتماد (اینماد) — بعد از دریافت اینجا بچسبان تا در فوتر نمایش داده شود<textarea id="s_enamad_html" dir="ltr">${esc(SET.enamad_html||"")}</textarea></label></div><button class="btn pri" id="ssv" style="margin-top:14px">ذخیره تنظیمات</button>`;
 $("#ssv").onclick=async()=>{const rows=[...SF.map(([k])=>({key:k,value:String($("#s_"+k).value||"0")})),{key:"enamad_html",value:$("#s_enamad_html").value}];const r=await sb.from("settings").upsert(rows);toast(r.error?"خطا: "+r.error.message:"ذخیره شد");await loadMeta()}}
async function aUsage(){const[a,b]=await Promise.all([sb.from("usage_log").select("*").order("created_at",{ascending:false}).limit(60),sb.from("profiles").select("id,email")]);if(a.error)throw a.error;const em=Object.fromEntries((b.data||[]).map(u=>[u.id,u.email]));
 $("#at").innerHTML=`<div style="overflow:auto"><table>${(a.data||[]).map(l=>`<tr><td dir="ltr">${esc(em[l.user_id]||"")}</td><td>${T.find(t=>t.id==l.tool)?.n||l.tool}</td><td>${l.provider||""}</td><td>${new Date(l.created_at).toLocaleString("fa-IR")}</td></tr>`).join("")||"<tr><td>موردی نیست</td></tr>"}</table></div>`}
/* ====== chatbot ====== */
let chatMsgs=[];
function chat(){document.title="چت‌بات هوشمند | SR5 Tools";
 if(!user){$("#view").innerHTML='<div class="panel"><h2>💬 چت‌بات هوشمند</h2><p style="color:var(--mu);margin:10px 0 18px">برای استفاده از چت‌بات وارد شوید.</p><button class="btn pri lg" id="lc">ورود با Google</button></div>';$("#lc").onclick=login;return}
 const adm=profile?.role=="admin",left=()=>adm?"نامحدود (ادمین)":`${fa(profile?.chat_left??Math.max(0,5-(profile?.chat_used??0)),0)} پیام برای امروز باقی مانده`;
 $("#view").innerHTML=`<div class="panel chatp"><div class="chh"><h2>💬 چت‌بات هوشمند</h2><span id="cl"></span></div><div class="cm" id="cm"></div><div class="cin"><textarea id="ci" rows="1" placeholder="پیامت را بنویس…"></textarea><button class="btn pri" id="cs">ارسال</button></div></div>`;
 const draw=pend=>{$("#cl").textContent=left();$("#cm").innerHTML=(chatMsgs.length?"":'<div class="b a">سلام! 👋 هر سوالی داری بپرس.</div>')+chatMsgs.map(m=>`<div class="b ${m.role=="user"?"u":"a"}">${esc(m.content)}</div>`).join("")+(pend?'<div class="b a">⏳ در حال نوشتن…</div>':"");$("#cm").scrollTop=1e9};
 const send=async()=>{const el=$("#ci"),txt=el.value.trim();if(!txt)return;if(!adm&&(profile.chat_left??1)<1)return toast("سهمیه پیام امروز تمام شده؛ فردا شارژ می‌شود یا اشتراک ویژه بگیر");
  chatMsgs.push({role:"user",content:txt});el.value="";draw(true);$("#cs").disabled=true;
  try{const{data,error}=await Promise.race([sb.functions.invoke("ai",{body:{tool:"chat",messages:chatMsgs}}),new Promise((_,rj)=>setTimeout(()=>rj("پاسخی از سرور نیامد؛ دوباره تلاش کن."),70000))]);
   if(error||data?.error){let m=data?.error;try{if(!m&&error.context)m=(await error.context.json()).error}catch(_){}throw m||"خطا در ارتباط با سرور"}
   chatMsgs.push({role:"assistant",content:data.text});if(data.chat_left>=0)profile.chat_left=data.chat_left}
  catch(e){chatMsgs.pop();el.value=txt;toast(String(e).slice(0,140))}
  $("#cs").disabled=false;draw(false)};
 $("#cs").onclick=send;$("#ci").onkeydown=e=>{if(e.key=="Enter"&&!e.shiftKey&&!matchMedia("(pointer:coarse)").matches){e.preventDefault();send()}};draw(false)}
/* ====== touch / hover effect ====== */
document.addEventListener("pointerdown",e=>{const c=e.target.closest(".tc,.cc,.sp,.st,.btn,.plan,.kv");if(!c)return;const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty("--mx",x+"px");c.style.setProperty("--my",y+"px");const s=document.createElement("span");s.className="rp";s.style.left=x+"px";s.style.top=y+"px";c.append(s);setTimeout(()=>s.remove(),750);c.classList.add("tch");setTimeout(()=>c.classList.remove("tch"),550)},{passive:true});
function route(){const h=location.hash||"#/";scrollTo(0,0);nav();{const s=$("#seo");if(s){const t=window.SR5_TOOL;s.style.display=(t?h=="#/t/"+t:(h=="#/"||h==""))?"":"none"}}if(h.startsWith("#/t/"))tool(h.slice(4));else if(h=="#/dash")dash();else if(h=="#/admin")admin();else if(h=="#/chat")chat();else if(h=="#/about")about();else if(h=="#/pricing")pricing();else home()}

/* ====== scroll effects ====== */
const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
let io;
function count(el){if(el.dataset.c)return;el.dataset.c=1;const n=+el.dataset.n,t0=performance.now();(function s(t){const k=ease((t-t0)/1100);el.textContent=fa(Math.round(n*k),0);if(k<1)requestAnimationFrame(s)})(t0)}
function observe(){if(!io)io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add("on");io.unobserve(e.target);e.target.querySelectorAll("[data-n]").forEach(count)}),{threshold:.1});document.querySelectorAll(".sr:not(.on)").forEach(e=>io.observe(e))}
const reveal=()=>observe();
/* ====== boot ====== */
const needAuth=h=>/^#\/(dash|admin|chat)$/.test(h||"");
let loaded=false,readyP=Promise.resolve();
addEventListener("hashchange",async()=>{if(needAuth(location.hash)&&!loaded){$("#view").innerHTML='<div class="panel">⏳ در حال بارگذاری…</div>';await readyP}route()});
(async()=>{if(window.SR5_TOOL&&!location.hash)history.replaceState(null,"","#/t/"+window.SR5_TOOL);nav();
 readyP=Promise.all([loadProfile(),loadMeta()]).then(()=>{loaded=true});
 if(needAuth(location.hash))$("#view").innerHTML='<div class="panel">⏳ در حال بارگذاری…</div>';else route();
 await readyP;
 const h=location.hash||"#/";
 if(needAuth(h)||h=="#/about"||h=="#/pricing")route();
 else if(h=="#/"){if(scrollY<80)route();else $("#grid")&&renderGrid()}
 sb&&sb.auth.onAuthStateChange(async()=>{await loadProfile()})})();

$("#bk").onclick=()=>history.length>1?history.back():(location.hash="#/");

/* ====== PWA install ====== */
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
let dip=null;const standalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform=="MacIntel"&&navigator.maxTouchPoints>1);
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e});
function installHelp(){const m=document.createElement("div");m.className="md";const steps=isIOS?"۱) در Safari دکمه <b>Share</b> (مربع با فلش رو به بالا) را بزن.<br>۲) پایین بیا و <b>Add to Home Screen</b> را انتخاب کن.<br>۳) روی <b>Add</b> بزن؛ آیکون SR5 Tools روی صفحه اصلی ساخته می‌شود.":/android/i.test(navigator.userAgent)?"۱) منوی سه‌نقطه ⋮ مرورگر را بزن.<br>۲) <b>Install app</b> یا <b>Add to Home screen</b> را انتخاب کن.":"۱) در Chrome یا Edge، آیکون نصب (📲 یا ⊕) سمت راست نوار آدرس را بزن.<br>۲) اگر نبود: منوی ⋮ ← <b>Cast, save and share</b> ← <b>Install page as app</b> (در Edge: Apps ← Install this site as an app).<br>۳) <b>Install</b> را بزن؛ برنامه در منوی Start و دسکتاپ ساخته می‌شود.";
 m.innerHTML=`<div><h3>📲 نصب SR5 Tools</h3><p style="color:#c9d8ea;font-size:14px">${steps}</p><button class="btn pri" style="margin-top:10px;width:100%">متوجه شدم</button></div>`;m.onclick=e=>{if(e.target==m||e.target.tagName=="BUTTON")m.remove()};document.body.append(m)}
async function installApp(){if(dip){dip.prompt();try{await dip.userChoice}catch(_){}dip=null}else installHelp()}
(function(){const b=$("#inst");if(!b)return;if(standalone()){b.style.display="none";return}b.onclick=installApp;
 if(localStorage.getItem("sr5_ib"))return;setTimeout(()=>{if(document.getElementById("ib"))return;const d=document.createElement("div");d.id="ib";d.innerHTML='<img src="icon-192.png" alt="" width="44" height="44" style="border-radius:12px"><div style="flex:1;font-size:14px;line-height:1.7"><b>نصب اپلیکیشن SR5 Tools</b><br><small style="color:var(--mu)">دسترسی سریع از صفحه اصلی گوشی یا ویندوز</small></div><button class="btn pri" id="ibi">نصب</button><button class="btn" id="ibx" aria-label="بستن">✕</button>';document.body.append(d);$("#ibi").onclick=()=>{installApp();d.remove()};$("#ibx").onclick=()=>{localStorage.setItem("sr5_ib","1");d.remove()}},7000)})();
