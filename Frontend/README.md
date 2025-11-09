# School Equipment Lending — Frontend (React + Vite + TypeScript)

This is a minimal frontend scaffold for the School Equipment Lending system. It contains the login (numeric ID) + mock OTP flow and a simple profile page. The OTP flow is a frontend-only mock useful for prototyping.

What is included
- Vite + React + TypeScript scaffold
- Tailwind CSS (configured)
- Mock OTP service in `src/services/authService.ts`
- Auth context in `src/hooks/useAuth.tsx`
- Pages: `Login` (login form + OTP verify) and `Profile`

Run locally
1. Install dependencies:

```powershell
npm install
```

2. Start dev server:

```powershell
npm run dev
```

Open http://localhost:5173 in your browser.

Environment
- Optionally set `VITE_API_BASE_URL` to point to your backend. If not set, the prototype will expose one demo user with ID `1`.

Next steps
- Implement full backend OTP endpoints and swap mock service for real endpoints
- Add equipments listing and request creation pages
