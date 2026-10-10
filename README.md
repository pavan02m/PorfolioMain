# Pavan Metkari — Complete Portfolio

A responsive React + Vite portfolio inspired by a minimal notebook aesthetic, with handwritten typography used throughout the interface (not only in the main headline).

## Run locally
1. Install Node.js 18+.
2. Extract this ZIP and open the project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the local URL shown by Vite.

## Included
- Home / hero
- About and quick facts
- Filterable skills
- Filterable project cards with custom visual previews and case-study modal
- Experience and education timeline
- Contact links and mailto contact form
- Responsive mobile navigation
- Light/dark theme toggle
- Copy-email interaction
- Pencil-style custom cursor on mouse devices (automatically disabled on touch/reduced-motion devices)
- Scroll-triggered section reveals and project/timeline entrances
- CSS-illustrated miniature developer workspace hero visual (no photo required)
- Reduced-motion support

## Before publishing
- The hero uses a CSS-illustrated miniature developer workspace, so no personal photo or external 3D model is required. If you later want true real-time 3D, this scene can be replaced with a lightweight GLB model using React Three Fiber.
- Check all personal information and project descriptions.
- Replace the placeholder GitHub project links with actual repositories and demos.
- Add your real resume PDF at `public/Pavan-Metkari-Resume.pdf` for the Resume button to work.
- Update LinkedIn and email links if needed.
- This is a frontend prototype; the contact form opens the visitor's email app and does not send/store form data on a server.

## Build for production
Run `npm run build`; Vite outputs the production build to `dist/`.


## Latest interaction refinements
- Pencil nib is aligned to the pointer hotspot rather than the icon center.
- The hero workspace has subtle mouse-position tracking with CSS 3D perspective; tracking resets when the pointer leaves the hero.
- Scroll reveals now use a slower, eased entrance and staggered content/card animations.
- Mobile sizing avoids pointer effects and keeps the workspace illustration contained.
