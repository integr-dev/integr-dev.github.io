import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const link = z.object({ label: z.string(), href: z.string() })

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        tagline: z.string(),
        tier: z.enum(['flagship', 'featured', 'more']),
        order: z.number(),
        why: z.string().optional(),
        badge: z.object({ value: z.string(), label: z.string(), href: z.string() }).optional(),
        stats: z
          .object({
            asOf: z.string(),
            source: z.string(),
            items: z.array(z.object({ label: z.string(), value: z.string() })),
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

    // long form text shown on the page below each flagship
    readmes: defineCollection({
      type: 'page',
      source: 'readmes/*.md',
    }),

    posts: defineCollection({
      type: 'page',
      source: 'posts/*.md',
      schema: z.object({
        date: z.string(),
        tags: z.array(z.string()).default([]),
        summary: z.string(),
        draft: z.boolean().default(false),
      }),
    }),

    timeline: defineCollection({
      type: 'data',
      source: 'timeline.yml',
      schema: z.object({
        entries: z.array(z.object({ when: z.string(), title: z.string(), detail: z.string().optional() })),
      }),
    }),

    skills: defineCollection({
      type: 'data',
      source: 'skills.yml',
      schema: z.object({
        categories: z.array(z.object({ category: z.string(), items: z.array(z.string()) })),
      }),
    }),

    profile: defineCollection({
      type: 'data',
      source: 'profile.yml',
      schema: z.object({
        handle: z.string(),
        name: z.string(),
        fullName: z.string(),
        role: z.string(),
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
