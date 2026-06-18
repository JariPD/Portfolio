# Portfolio — jaridijk.nl

Personal portfolio of Jari Dijk, a full-stack developer based in Den Haag. Built with
Next.js (App Router) and TypeScript, deployed on Vercel.

## Tech stack

- **Framework:** Next.js (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + plain component CSS (`app/globals.css`)
- **Email:** Resend (contact form API route)
- **Carousel:** Embla
- **Analytics:** Vercel Analytics + Speed Insights
- **Testing:** Jest + React Testing Library

## Getting started

```bash
npm install
npm run dev      # start the dev server at http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Jest test suite |
| `npm run test:watch` | Run tests in watch mode |

## Environment variables

The contact form (`app/api/contact/route.ts`) needs both of these set:

| Variable | Description |
| --- | --- |
| `RESEND_API_KEY` | API key for [Resend](https://resend.com) |
| `CONTACT_EMAIL` | Address that contact-form submissions are delivered to |

> Sending from `noreply@jaridijk.nl` also requires a domain verified in Resend.

## Project structure

```
app/        Routes, layouts, metadata, the contact API route
components/  React components (header, project cards/modal, contact form, media)
data/        Content as JSON (projects, skills, experience)
lib/         Data-access boundary and formatting/contact helpers
__tests__/   Jest + Testing Library tests
```

Content lives in `data/*.json` and is read through the repository boundary in
`lib/projects.ts`, so swapping the static JSON for a real API later only touches that layer.
