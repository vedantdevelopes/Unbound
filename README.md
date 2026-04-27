# 🖋️ Unbound

**Unbound** is a hyper-premium, immersive digital storytelling engine built with Next.js and Supabase. It transforms simple text entries into cinematic, physically responsive "Digital Books". Rather than forcing users to create accounts, Unbound relies on cryptographically secure invite links—allowing anyone to curate a private library and share it with breathtaking physical realism.

## ✨ Features

- **3D Page Physics:** Built upon intense CSS transformations and `react-pageflip`, dragging a page curls the "paper" flawlessly just like a hardcover novel, complete with real-time shadow casting.
- **Ambient Page Audio:** Interlocked seamlessly with the HTML5 Audio API—flipping a page triggers an authentic acoustic paper-turn sound effect.
- **Dynamic Background Envrionments:** Authors can choose between `Mahogany`, `Marble`, or `Dark Café` desk textures which dynamically alter the cinematic ambiance the reader experiences.
- **"Page 0" Cursive Dedication:** The engine automatically generates a faintly glowing, handwritten dedication page directed exclusively at the recipient before Chapter 1 begins.
- **TipTap Rich Text Editing:** Go beyond raw text with a deeply customized WYSIWYG editor that injects beautiful typographic scaling and drop-caps on the fly.
- **Floating Polaroids:** Authors can upload direct snap-shots that elegantly render as slightly rotated Polaroid photographs inside the stories.
- **Printable Admission Tickets:** Sharing a book generates an interactive "Library Access Ticket" UI with a scannable QR Code. When hitting `Print`, the app utilizes `@media print` CSS injections to clear the screen entirely and print purely the ticket on cardstock.

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Database / Auth:** Supabase (PostgreSQL, Storage)
- **Styling:** Pure Vanilla CSS (Utility variables, natively written typography tokens)
- **Editor:** TipTap
- **Motion Engine:** react-pageflip & Framer Motion

## 🚀 Getting Started

Deploying Unbound locally requires an active Supabase project.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vedantdevelopes/Unbound.git
   cd Unbound
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ENCRYPTION_MASTER_SECRET=<generate with: openssl rand -base64 32>
   MIGRATION_SECRET=<any random string for one-time migration auth>
   ```
   > **Note:** `ENCRYPTION_MASTER_SECRET` enables AES-256-GCM encryption of all user content at rest. If omitted, the app still works but data is stored as plaintext.

4. **Initialize Database Schema:**
   Go to your Supabase project's SQL editor and execute the raw contents of `database.sql`. This will automatically build all required tables, Row Level Security rules, and configure the Public Storage Buckets needed for Polaroids and Book Covers!

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.*
