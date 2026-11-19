# Doctor Plus visual QA

## Evidence

- Generated browser captures under `qa/screenshots/` are local-only and excluded from Git to keep the repository lean. Regenerate them with `npm run qa:visual`.
- The GitHub Pages project-path check runs with `npm run qa:pages`; it rebuilds for `/Doctor-plus-app/`, opens the built site in Chromium, checks Arabic and English direction and branding assets, and checks tablet and short desktop widths. It saves `github-pages-login-ar.png` and `github-pages-login-en.png` locally.
- Source visual truth: `qa/reference-doctor-plus-board.png` (405 × 845 px) and `qa/reference-doctor-plus-roles-board.png` (711 × 840 px), the supplied reference boards. Focused patient home crop: `qa/reference-home-screen.png` (53 × 112 px); focused doctor crop: `qa/reference-doctor-screen.png` (58 × 114 px).
- Implementation: `http://127.0.0.1:4174/`.
- Main implementation capture: `qa/screenshots/iphone-home-ar-1x.png` (393 × 852 px CSS, device scale 1).
- Full-view combined comparison: `qa/screenshots/home-source-comparison.png`. It places the reference thumbnail and implementation side by side, normalized to an 852 px displayed height. The source is a very small thumbnail from a larger board, so typography, exact spacing, image detail, and pixel-level color matching cannot be judged reliably.
- Viewport QA captures: `qa/screenshots/mobile-patient-ar.png`, `small-mobile-short-patient-ar.png`, `tablet-patient-ar.png`, `desktop-short-patient-ar.png`, `desktop-125-patient-ar.png`, and `desktop-150-patient-ar.png`.
- Additional implementation states: Arabic and English patient home and chat; Arabic and English health-service catalog; Arabic and English doctor workspace; doctor schedule; admin dashboard; pharmacy options; favorites, editable profile and health data; voice/video appointment selection and confirmation; onboarding and login; iPhone and Pixel 10 frames.
- e-Nabız-inspired states: expanded services list, health measurements action, blood pressure/glucose/pulse/weight editor, and health-record entries.

## Comparison

- Information architecture: the reference includes patient, doctor, and utility screens; this prototype covers patient booking and health records plus doctor and admin workspaces, with broader service entry points.
- Typography: Arabic uses the system Segoe UI/Tahoma stack and English uses bundled Roboto. The reference board is too small to infer the precise source font or compare small labels. Arabic and English wrap cleanly on the captured home and role screens.
- Spacing and layout: home sections, cards, bottom navigation, and role dashboards use a consistent compact mobile rhythm. The reference is a thumbnail; exact spacing is not measurable. Browser QA found no horizontal content overflow and kept the device frame inside six viewport sizes, including short heights and effective 125%/150% layouts.
- Bottom navigation: updated to a translucent blue glass dock with white icons and labels, a soft active state, a dedicated patient favorites tab, localized accessible name, and larger touch targets. Verified that the dock stays within iPhone and Pixel 10 system safe areas; all patient and staff tab targets are at least 44 CSS px in each dimension.
- Color and tokens: the implementation uses a light blue, white, and cool gray palette with blue actions and restrained semantic accents, consistent with the reference's visible blue-and-white direction. Exact token matching is not verifiable from the low-resolution source.
- Imagery and icons: the prototype uses demo doctor portraits from Unsplash and a curated Radix outline icon set. Added the reference-inspired Doctor Plus medical cross/stethoscope mark and reused it as a low-contrast watermark. Added distinct video, voice, activity, eye, and accessibility iconography. The source includes other custom medical illustrations not legible enough to identify individually; these were not recreated. Portraits are explicitly demo content and are not matched to the names shown.
- Copy and content: Arabic and English labels are present, with RTL and LTR direction verified. The app uses fictional profile, appointment, and dashboard data.

## Findings

- No actionable P0/P1/P2 visual findings remain in the inspected implementation captures.
- The first onboarding capture appeared displaced with the keyboard graphic visible. Playwright had scrolled the simulated device frame to reach the sign-out button, and the preview runtime left a hidden keyboard illustration visible. Updated QA to scroll the app viewport before tapping sign-out and reset the simulated frame; the app hides the keyboard illustration when its state is closed.
- P3: the supplied reference is a tiny screen thumbnail inside a larger board, so precise font, spacing, color, and asset fidelity cannot be verified. The implementation uses original demo portraits and Radix icons rather than the reference's custom illustrations.

## Interactions checked

- Language toggle and RTL/LTR direction.
- Branded login as the startup screen, with patient/doctor/admin account selection and local demo sign-in; onboarding remains available from the login screen.
- Patient, doctor, and admin role switching.
- Doctor schedule navigation.
- Pharmacy and lab quick actions open distinct Arabic and English option sheets; selecting an option shows a local demo confirmation and returns home.
- Appointment booking, confirmation, and appointments navigation.
- Appointment type selection for clinic, voice call, and video call, including confirmation/details.
- Arabic and English doctor chat, local message sending, and launching video-call booking from chat.
- Arabic and English e-Nabız-inspired service catalogs and measurement actions.
- Editable blood type, blood pressure, blood sugar, pulse, weight, and allergy values.
- Saving and removing favorite doctors, and navigating to the favorites list.
- Editing and saving the patient's profile and health summary fields in local demo storage.
- Adding, editing, deleting, and retaining family members; editing insurance policy details.
- Changing patient app language from account settings, saving patient preferences, toggling notification categories, and saving a categorized support request.
- Uploading and retaining resized profile photos for the patient and doctor workspaces.
- Back-arrow direction on Arabic and English doctor chat and subpages.
- Pixel 10 device selection and frame dimensions.
- Bottom navigation active state, safe-area clearance, and touch target size on iPhone and Pixel 10.
- Bottom-navigation active bubble: the blue-rimmed white circle slides to the selected tab, and its icon lifts into the bubble; patient Home stays centered and Health uses a custom heart-pulse icon.
- Onboarding slides, login form, and local demo sign-in.
- Image loading and browser console errors.

## Comparison history

- First review showed onboarding shifted after the automation clicked a deep sign-out control. Fixed the automation to scroll within the app viewport before clicking and reset the simulated frame, then hid the keyboard illustration while closed. Recaptured the same 393 × 852 px screen on iPhone and the 427 × 952 px screen on Pixel 10; both show the full home/onboarding layouts without a keyboard graphic.
- Updated the bottom bar to a floating dock, then rechecked its active state, dimensions, system inset clearance, RTL/LTR layout, and navigation actions on both device presets. Updated iPhone, Pixel, and English screenshots are in `qa/screenshots/`.
- Replaced repetitive service/specialty symbols with more specific icons and added contact actions. Added a bilingual local chat flow and selectable clinic/voice/video booking cards; Playwright verified both message submission flows and video booking confirmation. Chat and call experiences remain demo-only with no backend connection.
- Added the supplied reference's medical cross/stethoscope identity as the app logo and watermark. Redesigned the dock as translucent blue with white navigation and a patient favorites tab; verified five patient tabs still meet touch sizing on narrow and regular phones.
- Added favorite state persistence and editable profile and health-summary forms using local demo storage. Playwright verified save/remove, form updates, language-aware direction of back arrows, and captured `iphone-favorites-ar-1x.png`, `iphone-health-edit-ar-1x.png`, and `iphone-profile-edit-ar-1x.png`.
- Reviewed the official e-Nabız help guide and the Turkish Ministry of Health user guide. Added bilingual mock flows for visit history, diagnoses, radiology, reports, prescriptions, vaccination, allergies, emergency notes, health metrics, documents, sharing permissions, access history, donations, connected devices, health assistant, visit feedback, optical prescriptions, and family health profiles. These are independent local prototype screens, not connected to e-Nabız or Ministry records. Playwright verified the expanded catalog and health-measurement actions; captures: `iphone-e-nabiz-services-ar-1x.png`, `iphone-e-nabiz-services-mid-ar-1x.png`, and `iphone-e-nabiz-services-en-1x.png`.
- Changed app startup to the branded login form, added an explicit patient/doctor/admin selector there, and kept onboarding accessible through the login header. Pharmacy and lab shortcuts now open their own bilingual choices; Playwright verifies each service and its selection behavior. Captures: `iphone-login-ar-1x.png`, `iphone-pharmacy-options-ar-1x.png`, `iphone-lab-options-ar-1x.png`, and English counterparts.
- Reworked the navigation interaction to match the supplied example: a raised white circular indicator slides along the blue dock to the active tab while its icon lifts into the circle. Playwright checks alignment after switching tabs and the existing touch targets.
- Centered the patient Home tab, added a custom heart-pulse Health icon, and added a blue outline to the raised active circle per the latest reference.
- Replaced the profile menu's placeholder notices with separate family, insurance, account settings, notifications, and support screens. Family records support add/edit/delete; insurance details are editable; preference switches and support requests persist locally.
- Added patient and doctor photo pickers. Selected images are scaled down to 512 px JPEGs before preview and local persistence. Expanded Playwright coverage for both roles and profile edit/save flows.
- Added a medical cross and very faint Doctor Plus watermark to the login backdrop, confined to the background layers so controls remain unobstructed. Profile-page captures: `iphone-profile-family-ar-1x.png`, `iphone-profile-insurance-ar-1x.png`, `iphone-profile-settings-ar-1x.png`, `iphone-profile-notifications-ar-1x.png`, and `iphone-profile-support-ar-1x.png`.
- Replaced the health overview's plain backdrop with a custom medical-record illustration. Split prescriptions, lab results, medical records, and allergies into their own bilingual pages with local add/edit/delete flows; added a daily wellness checklist and practical health guidance. Allergy entries also update the health summary. Captures: `iphone-health-records-ar-1x.png`, `iphone-health-records-en-1x.png`, `iphone-prescriptions-ar-1x.png`, `iphone-allergies-ar-1x.png`, `iphone-wellness-ar-1x.png`, and `iphone-wellness-en-1x.png`.
- Redesigned the login backdrop with a soft clinical gradient and very light blue/teal corner glows. Removed the watermark from the login state so it cannot pass behind fields or controls; decorative layers ignore pointer input and remain behind content.
- Restored the admin reports screen so dashboard reports links have a valid destination and production build completes.
- Redesigned login with a more engaging healthcare welcome card, doctor portrait, privacy reassurance, and clear icon-led patient/doctor/admin choices. Tightened spacing around the welcome copy and form so the visual treatment stays mobile friendly. Added Arabic and English login captures and LTR/RTL assertions.
- Prepared GitHub Pages deployment with a project-path build and static asset path rewriting. The base-path browser QA command verifies the bundled site at `/Doctor-plus-app/` in Arabic and English; deployment remains gated on the repository's Pages eligibility and a push of the prepared workflow.

## Final result

passed
