# Deploy to Vercel

1. **Push your code to GitHub** (if not already).
   - From project root: `git init`, add remote, then `git push`.

2. **Go to [vercel.com](https://vercel.com)** and sign in (GitHub is easiest).

3. **Import the project**
   - Click **Add New… → Project**.
   - Import the repo that contains the **`my-app`** folder.
   - Set **Root Directory** to `my-app` (so Vercel builds from the Next.js app).
   - Click **Deploy**.

4. **Set the app URL for QR codes**
   - After deploy, open your project on Vercel → **Settings → Environment Variables**.
   - Add:
     - **Name:** `NEXT_PUBLIC_APP_URL`
     - **Value:** `https://your-project-name.vercel.app` (use your actual Vercel URL, no trailing slash)
   - Redeploy (Deployments → … → Redeploy) so the new variable is applied.

5. **Use the live URL for QR codes**
   - Open your app at the Vercel URL (e.g. `https://your-project-name.vercel.app`).
   - Generate or print QR codes from that page. Scans will open the correct card page for anyone.
