/**
 * Monochrome logos for skills.yml entries. Brand logos come from Simple Icons (Font Awesome has
 * no Kotlin, TypeScript, Nuxt, ...); the few Simple Icons lacks fall back to Font Awesome.
 * The Simple Icons ones are symbols in one file, /skill-icons.svg (server/routes/skill-icons.svg.ts),
 * named by their slug: the page links to them instead of carrying every logo's outline.
 */
export type SkillIcon = { si: string } | { fa: [string, string] }

const si = (slug: string): SkillIcon => ({ si: slug })

export const skillIcons: Record<string, SkillIcon> = {
  'Kotlin': si('kotlin'),
  'Java': si('openjdk'),
  'JavaScript': si('javascript'),
  'TypeScript': si('typescript'),
  'Go': si('go'),
  'C': si('c'),
  'C#': { fa: ['fas', 'hashtag'] },
  'Python': si('python'),
  'Shell': si('gnubash'),
  'Oracle': { fa: ['fas', 'database'] },
  'MySQL': si('mysql'),
  'SQLite': si('sqlite'),
  'MongoDB': si('mongodb'),
  'Postgres': si('postgresql'),
  'Kotlin Multiplatform': si('kotlin'),
  'Android Jetpack': si('android'),
  'JavaFX': si('openjdk'),
  'Vue': si('vuedotjs'),
  'Nuxt': si('nuxt'),
  'Tailwind CSS': si('tailwindcss'),
  'Spring Boot': si('springboot'),
  'Spring Security': si('springsecurity'),
  'JPA / Hibernate': si('hibernate'),
  'Express': si('express'),
  'Fabric': { fa: ['fas', 'cube'] },
  'Spigot': si('spigotmc'),
  'Quarkus': si('quarkus'),
  'React': si('react'),
  'Git': si('git'),
  'GitHub': si('github'),
  'GitHub Actions': si('githubactions'),
  'Docker': si('docker'),
  'Kubernetes': si('kubernetes'),
  'Vite': si('vite'),
  'Gradle': si('gradle'),
  'Maven': si('apachemaven'),
  'Flyway': si('flyway'),
  'Swagger': si('swagger'),
  'Jest': si('jest'),
  'JUnit': si('junit5'),
  'xUnit': si('dotnet'),
  'Playwright': { fa: ['fas', 'masks-theater'] },
  'Selenium': si('selenium'),
}

export const fallbackIcon: SkillIcon = { fa: ['fas', 'code'] }
