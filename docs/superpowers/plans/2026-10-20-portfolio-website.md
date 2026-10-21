# Portfolio Website Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build the responsive portfolio website described by the supplied UI prompt and v1 specification in the current workspace.

**Architecture:** Create a Next.js 15 App Router application with strict TypeScript and Tailwind. Keep site copy and seed data in `data/`, expose project and tech access only through `lib/projects.ts`, and compose routes from small server components with client components limited to the mobile menu, view toggle, and contact form.

**Tech Stack:** Next.js 15, React, TypeScript strict, Tailwind CSS, next/font/google, next/image, next/link, react-icons.

**Spec:** `C:/Local Disk (E)/studing/projects/portfolio-ui-spec.md`; implementation prompt: `C:/Local Disk (E)/studing/projects/portfolio-ui-prompt.md`.

## Global Constraints

- Keep all color values in CSS variables mapped into the Tailwind theme; use the exact tokens in the spec.
- Use Bricolage Grotesque for headings and Instrument Sans for body text; do not use Inter, Poppins, or Roboto.
- Use server components by default; client components only for the mobile menu, view toggle, and contact form.
- Components obtain projects and techs only through `lib/projects.ts`.
- Use `next/image`, `next/link`, and `react-icons`; do not add another UI library.
- Do not add gradients, purple/indigo/violet/neon, scroll or entrance animations, search, filters, video playback, database, or email integration.
- Keep picture placeholders flat, frameless, and fixed in size; keep all placeholder copy in data files.
- Implement the specified routes: `/`, `/projects`, `/projects/[slug]`, `/api/contact`, and not-found.

## Review Focus

- Invalid or missing project slug: show the not-found page.
- Invalid `view` query parameter: render grid as the default and keep the URL toggle valid.
- Contact payload with missing fields, malformed email, or honeypot content: return an error or safe success according to the stub contract without sending email.
- Empty projects or optional project fields: show the empty state and hide optional sections cleanly.
- Narrow mobile viewport and keyboard navigation: preserve layout without horizontal overflow and retain visible focus and accessible menu state.

---

### Task 1: App foundation and shared layout

**Files:**
- Create: `package.json`, Next.js/TypeScript/Tailwind configuration, `app/globals.css`, `app/layout.tsx`
- Create: `components/layout/Navbar.tsx`, `components/layout/MobileMenu.tsx`, `components/layout/Footer.tsx`
- Create: `components/ui/Container.tsx`, `components/ui/Button.tsx`, `components/ui/SectionHeading.tsx`
- Create: `data/site.ts`

**Interfaces:**
- Shared site metadata and placeholders come from `data/site.ts`.
- Shared layout provides fonts, navigation, footer, color tokens, and common UI primitives.

- [ ] Scaffold Next.js 15 with strict TypeScript and Tailwind.
- [ ] Add the specified font setup, metadata, CSS variables, and Tailwind theme mapping.
- [ ] Build responsive shared navigation, mobile menu, footer, container, button, and section-heading primitives.
- [ ] Run `npm run build`; resolve build errors before proceeding.

### Task 2: Typed project and tech data layer

**Files:**
- Create: `types/index.ts`, `data/projects.ts`, `data/techs.ts`, `lib/projects.ts`
- Create: `public/images/projects/*.svg` (six flat-color covers)

**Interfaces:**
- Export `Tech`, `ProjectVideo`, and `Project` types with the exact spec fields.
- Export async `getProjects`, `getFeaturedProjects`, `getProjectBySlug`, `getTechs`, `getTechBySlug`, and `getFeaturedSkills`.

- [ ] Add six typed project placeholders, four featured, and approximately ten tech entries.
- [ ] Add six flat-color SVG cover assets and no gradients.
- [ ] Implement the access functions and keep direct data imports out of components.
- [ ] Run `npm run build).

### Task 3: Project listing and detail routes

**Files:**
- Create: `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`
- Create: `components/projects/ProjectCard.tsx`, `ViewToggle.tsx`, `ProjectVideo.tsx`, `TechBadge.tsx`

**Interfaces:**
- Routes consume project and tech data through `lib/projects.ts`.
- `ProjectCard` accepts `variant: "grid" | "list"`; `ProjectVideo` accepts `video: ProjectVideo` and `cover: string`; `TechBadge` accepts a tech and optional `href`.

- [ ] Implement grid/list listing with server-read `searchParams`, URL-persisted toggle, invalid-view fallback, and empty state.
- [ ] Implement static project params, metadata including cover Open Graph image, missing-slug handling, optional sections, and the non-playing video placeholder.
- [ ] Run `npm run build).

### Task 4: Landing page sections

**Files:**
- Create: `app/page.tsx`
- Create: `components/landing/Hero.tsx`, `Skills.tsx`, `About.tsx`, `FeaturedProjects.tsx`, `Contact.tsx`
- Create: `components/ui/PictureSlot.tsx`

**Interfaces:**
- Landing sections use `site` data and the project/tech access functions.
- `PictureSlot` accepts an optional source and fixed aspect/size; null renders the plain surface block.

- [ ] Compose the hero, skills, about, featured projects, and contact sections with the required section IDs and alternating image/text layout.
- [ ] Keep hero and About picture slots empty by default and stable when images are added later.
- [ ] Run `npm run build`.

### Task 5: Contact stub, not-found, and final verification

**Files:**
- Create: `app/api/contact/route.ts`, `app/not-found.tsx`
- Modify: responsive styles and UI files as needed.

- [ ] Implement contact validation, inline messages, submit/success/error states, and honeypot; return the specified stub response without sending email.
- [ ] Implement friendly 404 navigation.
- [ ] Check the supplied acceptance criteria: all routes, query toggle, mobile layout from 360px, keyboard focus, contrast, no gradients/restricted colors, and successful production build.
- [ ] Report run command, created files, assumptions, and any spec items that could not be completed.
 
