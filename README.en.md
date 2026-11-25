> **Language / Idioma:** [Português (Portugal)](README.md) · [English](README.en.md)

# CUTTING CREW Barbershop — website

A one-page React + TypeScript + Vite website for **CUTTING CREW Barbershop** in Cucujães, Aveiro, Portugal.

Bookings continue to be handled through **Fresha**: every “Book now” button opens the barbershop's official profile. The website has no built-in booking or payment system and can be hosted at no cost.

> **Status:** ready for deployment to **Netlify** (free plan). Nothing has been published yet. Permissions for the logo, photos, team and publication were confirmed by the developer in person with the owner and team (27 October 2026). There are two builds: <code>npm run build</code> (demo, not indexable) and <code>npm run build:oficial</code> (official, indexable; used by Netlify).

## Requirements

- [Node.js](https://nodejs.org) 20.19 or newer (recommended: 22 LTS)

## Install and run

~~~bash
npm install
npm run dev
~~~

The development server runs at http://localhost:5173.

## Production build

~~~bash
npm run build
npm run build:oficial
npm run preview
~~~

The default build creates the demo version (not indexable) in <code>dist/</code>. The official build creates the indexable version. The preview server runs at http://localhost:4173.

The build checks TypeScript types, generates the website and pre-renders HTML so that content is available on the first load, supporting SEO and performance.

## Checks

After <code>npm install</code> (or <code>npm ci</code> for a clean, reproducible installation):

~~~bash
npm run lint
npm run build
npx playwright install chromium
npm run build && npm run test:e2e
~~~

The tests in <code>tests/e2e.mjs</code> use Playwright and axe-core. They cover console errors, horizontal scrolling at 320/390/768/1440 px, exact Fresha booking URLs, external links, anchors, image alt/width/height and loading failures, mobile navigation, keyboard use, <code>prefers-reduced-motion</code>, operation without JavaScript and accessibility (axe).

Playwright is included in the dependencies; Chromium only needs to be downloaded once. To test the official build, run <code>npm run build:oficial && npm run test:e2e:oficial</code>. The script exits with an error if port 4179 is already occupied, preventing tests from accidentally hitting an old server.

## Logo

The barbershop logo is stored in <code>public/images/logo-240.webp</code> and <code>logo-480.webp</code> (white on transparent, derived from the low-resolution source at <code>brand/logo-original-fornecido.jpg</code>). To replace it with a better version, replace both files while preserving their proportions (or update the image in <code>src/components/Header.tsx</code>) and regenerate <code>public/og-image.jpg</code> (1200 × 630).

## Where to edit content

All text and data are kept in <code>src/data/</code>, separate from presentation:

| File | Contents |
| --- | --- |
| <code>business.ts</code> | Address, opening hours, links (Fresha, WhatsApp, Instagram, TikTok) and map |
| <code>services.ts</code> | Services, durations and prices |
| <code>team.ts</code> | Team names, roles and photos when available |
| <code>gallery.ts</code> | Gallery images |
| <code>hero.ts</code> | Hero image (barbershop window) |
| <code>seo.ts</code> | Search and social-sharing titles and descriptions |

Items still requiring owner confirmation are listed in <code>CONTEUDOS_POR_CONFIRMAR.md</code>.

## Photos

The gallery currently uses five work photos (<code>public/images/fotos/foto-1…5</code>) and a barbershop window photo for the booking section (<code>janela-*</code>). They were taken from the barbershop's Instagram profile; permission was confirmed by the developer on 27 October 2026.

To replace or add photos:

1. Put the <code>.jpg</code>/<code>.png</code> files in <code>photos/</code> (this folder is not committed).
2. Run <code>npm run imagens</code> to create WebP versions at three sizes in <code>public/images/fotos/</code> and print the line to add to <code>src/data/gallery.ts</code>.
3. Add that line to <code>gallery.ts</code> and write an <code>alt</code> description without identifying people.

## Team

In <code>src/data/team.ts</code>, each barber has a name, role, direct booking link (Fresha, using their <code>employeeId</code>) and Fresha profile link (portfolio and reviews). Only Cutting Gu has a biography, written by him on Fresha.

Reviews are **not** copied to the website: Fresha has no public API for this, and copying reviews would be fragile and would lack customer consent. The website links to each Fresha profile instead.

## Optional barber dashboard (free)

Each barber can sign in at <code>/painel</code>, personalise their profile (name, role, biography, Instagram and portrait), publish photos (like a small Instagram gallery) and download a portfolio. Published content appears in the website's Team section. **Fresha booking links remain in the code and cannot be changed by barbers.**

The website is static; the dashboard requires a database. It uses **Supabase** (free plan: accounts, database and 1 GB of photo storage). Without Supabase, the website continues to work with the content in <code>src/data/team.ts</code>, while <code>/painel</code> displays a notice.

### One-time setup (approximately 15 minutes)

1. Create a Supabase account and a new project (EU region, for example Frankfurt). Save the database password.
2. In **SQL Editor → New query**, paste <code>supabase/schema.sql</code> and run it. This creates the tables, security policies and photo bucket.
3. In **Authentication → Users → Add user**, create one account per barber (email + password, with “Auto Confirm User”). Under **Authentication → Sign In / Providers → Email**, disable “Allow new users to sign up” so only accounts you create can sign in.
4. Link each account to the correct barber in SQL Editor. Replace the email and member name (<code>almeida</code>, <code>ruben</code>, <code>hiago</code> or <code>cutting-gu</code>):
   <code>insert into public.profiles (id, member_id) select id, 'hiago' from auth.users where email = 'email@example.com';</code>
5. Under **Project Settings → API**, copy the **Project URL** and **anon public** key. In Netlify, create <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> environment variables and redeploy. For local testing, copy <code>.env.example</code> to <code>.env.local</code> and fill it in. The anon key may be included in the site; security comes from the policies created in step 2. **Never** use the <code>service_role</code> key.
6. Under **Authentication → URL Configuration**, set the site address as “Site URL” and <code>https://SITE-ADDRESS/painel</code> as a “Redirect URL” (used for password reset).
7. Open <code>https://SITE-ADDRESS/painel</code>, test with an account and confirm that the profile appears in the Team section.

**Security model:** each barber can only read and update their own profile, photos and file folder (RLS policies in <code>supabase/schema.sql</code>). Limit: 24 photos per barber, 2 MB per image. Photos are resized and location metadata is removed before upload. The uploader confirms they have permission to publish photos of the people shown.

**Owner administration:** to hide a photo from the website, set <code>visivel</code> to false in **Table Editor → photos**. To remove a barber, delete their user in Authentication; their photos will disappear from the website.

**Portfolio export:** “Download portfolio” creates a standalone HTML file (profile + photos) that the barber can save and print to PDF.

**Dashboard tests:** <code>npm run test:painel</code> tests the dashboard and website read flow against a simulated Supabase instance (21 checks). Security policies require a real Supabase project: after step 7, sign in with two accounts and confirm that one cannot modify the other.

**Privacy:** once enabled, Supabase stores barber email addresses, text and photos. The website privacy policy must describe this processing when the dashboard is activated.

## Demo and official modes

- **Demo** (<code>npm run build</code>, default): <code>noindex</code>, <code>robots.txt</code> with <code>Disallow: /</code> and a “demonstration website” notice in the footer.
- **Official** (<code>npm run build:oficial</code>): allows indexing, generates <code>sitemap.xml</code> and <code>canonical</code> when the site address is known, and removes the demo notice.

Set the address with <code>SITE_URL</code> (for example, <code>SITE_URL=https://your-site.pt npm run build:oficial</code>), or let it be detected automatically on Netlify and Cloudflare Pages.

**Before publishing the official build, confirm every item in <code>CONTEUDOS_POR_CONFIRMAR.md</code> with the owner in writing.**

## Deploy to Netlify (free)

Netlify allows commercial use on its free plan. The project already includes the configuration in <code>netlify.toml</code>: <code>npm run build:oficial</code>, output folder <code>dist</code> and Node 22.

**Option 1 — from GitHub (recommended; deploys on each push):**

1. Push the project to the private repository (see the repository section below).
2. On netlify.com, sign in (GitHub is supported) → **Add new site → Import an existing project → GitHub** → select <code>cutting-crew-website</code> and grant access to the private repository when requested.
3. Keep the settings from <code>netlify.toml</code> and deploy.
4. The site receives a <code>*.netlify.app</code> address. Rename it in Site configuration → Change site name. The address is detected automatically for <code>canonical</code> and <code>sitemap.xml</code>.
5. Add a custom domain later under Domain management → Add a domain.

**Option 2 — without GitHub:** run <code>npm run build:oficial</code> and drag the <code>dist</code> folder to https://app.netlify.com/drop. Without <code>SITE_URL</code>, no <code>canonical</code> or <code>sitemap.xml</code> is generated.

**Free alternative:** Cloudflare Pages (build command <code>npm run build:oficial</code>, output <code>dist</code>, environment variable <code>NODE_VERSION=22</code>).

The <code>_headers</code> file (Netlify and Cloudflare) defines security and cache headers; <code>404.html</code> is used automatically.

## Launch audit

See <code>AUDITORIA_LANCAMENTO.md</code> for the final 20-point audit and outstanding actions.

## Colours

The website uses the barbershop's navy logo colour (<code>--navy: #233154</code>, in <code>src/styles/tokens.css</code>), white and blue-grey tones. No generated illustrations are used: the hero uses a photo of the storefront and the gallery uses real photos.

## Fonts

Sofia Sans Extra Condensed and Instrument Sans (OFL licence) are included in <code>src/assets/fonts/</code>, with no external font-server requests. See <code>LICENCAS-DOS-TIPOS-DE-LETRA.txt</code> in that folder.

## Privacy

The website does not use cookies, tracking or analytics. The Google map only loads after the visitor selects “Show map” (a notice appears next to the button), so a cookie-consent banner is not required for the current implementation.

If analytics, advertising, embedded videos or forms are added, reassess this and add a privacy policy.

When the dashboard is enabled, the website requests barber profiles from Supabase as visitors open the page; Supabase receives the request IP address, as any server does. The website still has no cookies or local storage; only barbers who sign in to <code>/painel</code> have a browser session stored.

## 404 page

<code>public/404.html</code> is automatically recognised by Netlify and Cloudflare Pages.