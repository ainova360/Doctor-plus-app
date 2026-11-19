# Doctor Plus app prototype

## Product scope

- Keep this project as a mobile-first healthcare prototype with patient, doctor, and admin workspaces.
- Keep Arabic and English available from the app header. Arabic screens must be RTL; English screens must be LTR.
- Preserve the Product Design mobile runtime and its iPhone / Pixel 10 device selection. Put app changes in `src/Prototype.tsx` and `src/prototype.css`; runtime files are protected by the template.
- Data is mock data. Do not present the prototype as connected to real patient records, clinics, payments, or emergency services.

## Visual QA before handoff

- Run `npm run check:runtime` and `npm run build` after app changes.
- Keep the app in the phone runtime and inspect both iPhone and Pixel 10.
- Run `npm run dev`, then `npm run qa:visual`. The Playwright command captures mobile, narrow/short mobile, tablet, desktop, a short desktop window, and effective 125%/150% zoom layouts. It also checks Arabic/English direction and chat, role switching, doctor schedule, admin dashboard, patient message sending, clinic/voice/video booking, booking confirmation, Pixel selection, bottom navigation safe-area clearance and 44 px touch targets, overflow, and browser console errors.
- Inspect the generated images in `qa/screenshots/`. Fix clipped controls, overlap, broken assets, or non-scrollable content before handoff.
- Keep screenshot evidence and update `design-qa.md` with findings and the final result.

## GitHub readiness

- Keep `package-lock.json` committed and `.gitignore` current.
- Do not commit credentials, real patient data, or production secrets.
- Update the README when commands or product scope change.
