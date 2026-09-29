import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const link = z.object({ label: z.string(), href: z.string() })
// one skill: what it is, a rating from 0 to 5 and why, and whether it is a favourite; the German file gives
// only the text, the rest comes from the English entry with the same name
const skill = z.object({ name: z.string(), what: z.string(), rating: z.number().min(0).max(5).optional(), favorite: z.boolean().optional(), why: z.string().optional() })

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      // English in content/en/, German in content/de/; the prefix keeps the paths free of the language
      source: { include: 'en/projects/*.md', prefix: '/projects' },
      schema: z.object({
        tagline: z.string(),
        tier: z.enum(['flagship', 'featured', 'more']),
        order: z.number(),
        why: z.string().optional(),
        // one problem the project had to solve and how it was solved, for the project page and readme
        built: z.object({ problem: z.string(), solution: z.string() }).optional(),
        // `live`: where the build fetches a fresh number from (modules/live-stats.ts); value and
        // asOf are what shows when it can't
        badge: z.object({ value: z.string(), label: z.string(), href: z.string(), live: z.string().optional() }).optional(),
        stats: z
          .object({
            asOf: z.string(),
            source: z.string(),
            items: z.array(z.object({ label: z.string(), value: z.string(), live: z.string().optional() })),
          })
          .optional(),
        stack: z.array(z.string()),
        links: z.array(link),
        // one or more visuals; with several, the flagship sheet shows a switcher
        visuals: z
          .array(z.object({
            kind: z.enum(['images', 'code', 'diagram', 'chart']),
            label: z.string().optional(),
            images: z.array(z.object({ src: z.string(), alt: z.string(), width: z.number().optional(), height: z.number().optional() })).optional(),
            diagram: z.string().optional(),
            chart: z.object({
              title: z.string(),
              note: z.string().optional(),
              source: z.string().optional(),
              bars: z.array(z.object({ label: z.string(), value: z.number() })),
            }).optional(),
          }))
          .optional(),
      }),
    }),

    // German overrides (content/de/): only the translated text; everything else comes from the
    // English entry with the same file name, merged in useSiteContent
    projects_de: defineCollection({
      type: 'page',
      source: 'de/projects/*.md',
      schema: z.object({
        tagline: z.string().optional(),
        why: z.string().optional(),
        built: z.object({ problem: z.string(), solution: z.string() }).optional(),
        badgeLabel: z.string().optional(),
        chart: z.object({ title: z.string(), note: z.string().optional() }).optional(),
        // image alt texts, in the order the images appear across all visuals
        alts: z.array(z.string()).optional(),
      }),
    }),

    // long form text shown on the page below each flagship
    readmes: defineCollection({
      type: 'page',
      source: { include: 'en/readmes/*.md', prefix: '/readmes' },
    }),

    posts: defineCollection({
      type: 'page',
      source: { include: 'en/posts/*.md', prefix: '/posts' },
      schema: z.object({
        date: z.string(),
        tags: z.array(z.string()).default([]),
        summary: z.string(),
        draft: z.boolean().default(false),
      }),
    }),

    timeline: defineCollection({
      type: 'data',
      source: 'en/timeline.yml',
      schema: z.object({
        entries: z.array(z.object({ when: z.string(), title: z.string(), detail: z.string().optional() })),
      }),
    }),

    // same entries in the same order as timeline.yml
    timeline_de: defineCollection({
      type: 'data',
      source: 'de/timeline.yml',
      schema: z.object({
        entries: z.array(z.object({ when: z.string(), title: z.string(), detail: z.string().optional() })),
      }),
    }),

    // shown by category on the Skills sheet; a click on a skill shows what it is, its rating and why,
    // favorite: true puts a star next to it
    skills: defineCollection({
      type: 'data',
      source: 'en/skills.yml',
      schema: z.object({ categories: z.array(z.object({ category: z.string(), items: z.array(skill) })) }),
    }),

    // German skills: category names and the text of each skill; names, order and ratings come from the
    // English file (matched by name)
    skills_de: defineCollection({
      type: 'data',
      source: 'de/skills.yml',
      schema: z.object({ categories: z.array(z.object({ category: z.string(), items: z.array(skill) })) }),
    }),

    // German profile: only the translated text; everything else comes from profile.yml
    profile_de: defineCollection({
      type: 'data',
      source: 'de/profile.yml',
      schema: z.object({
        role: z.string().optional(),
        location: z.string().optional(),
        lookingFor: z.string().optional(),
        pitch: z.string().optional(),
        cvNote: z.string().optional(),
      }),
    }),

    profile: defineCollection({
      type: 'data',
      source: 'en/profile.yml',
      schema: z.object({
        handle: z.string(),
        name: z.string(),
        fullName: z.string(),
        role: z.string(),
        // what I am looking for, shown on the first screen
        lookingFor: z.string(),
        birth: z.object({ year: z.number(), month: z.number() }),
        location: z.string(),
        pitch: z.string(),
        email: z.string(),
        cvNote: z.string(),
        links: z.array(z.object({ label: z.string(), href: z.string(), icon: z.string() })),
      }),
    }),
  },
})
