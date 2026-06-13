/** @jest-environment node */

import { createProject } from '@/lib/projects'

const newProject = {
  title: 'Mijn Nieuwe Project',
  description: 'Korte beschrijving van het project.',
  technologies: ['Next.js', 'TypeScript'],
  year: 2025,
  sort_order: 10,

  // Optioneel:
  // problem: 'Welk probleem lost dit op?',
  // approach: 'Hoe heb je het aangepakt?',
  // role: 'Lead developer',
  // slug: 'mijn-eigen-slug',          // wordt automatisch gegenereerd als leeg
  // thumbnail_url: 'https://...',
  // demo_url: 'https://...',
  // repo_url: 'https://github.com/...',
  // images: [
  //   { url: 'https://...', alt_text: 'Screenshot 1', sort_order: 0 },
  // ],
}

test('Voeg nieuw project toe aan de database', async () => {
  const project = await createProject(newProject)

  console.log('Project aangemaakt:', project)

  expect(project.id).toBeDefined()
  expect(project.title).toBe(newProject.title)
})
