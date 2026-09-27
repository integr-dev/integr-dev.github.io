import {
  siApachemaven,
  siC,
  siDocker,
  siGit,
  siGithub,
  siGo,
  siGradle,
  siJavascript,
  siKotlin,
  siKubernetes,
  siLinux,
  siMongodb,
  siMysql,
  siNuxt,
  siOpenjdk,
  siPodman,
  siPostgresql,
  siPython,
  siQuarkus,
  siReact,
  siSpring,
  siSqlite,
  siTypescript,
  siVite,
  siVuedotjs,
} from 'simple-icons'

/**
 * Monochrome logos for skills.yml entries. Brand logos come from Simple Icons (Font Awesome has
 * no Kotlin, TypeScript, Nuxt, ...); the few Simple Icons lacks fall back to Font Awesome.
 */
export type SkillIcon = { path: string } | { fa: [string, string] }

const si = (i: { path: string }): SkillIcon => ({ path: i.path })

export const skillIcons: Record<string, SkillIcon> = {
  'Kotlin': si(siKotlin),
  'Java': si(siOpenjdk),
  'JavaScript': si(siJavascript),
  'TypeScript': si(siTypescript),
  'Go': si(siGo),
  'C': si(siC),
  'C#': { fa: ['fas', 'hashtag'] },
  'Python': si(siPython),
  'Oracle': { fa: ['fas', 'database'] },
  'MySQL': si(siMysql),
  'SQLite': si(siSqlite),
  'MongoDB': si(siMongodb),
  'Postgres': si(siPostgresql),
  'Kotlin Multiplatform': si(siKotlin),
  'JavaFX': si(siOpenjdk),
  'Vue': si(siVuedotjs),
  'Nuxt': si(siNuxt),
  'Spring': si(siSpring),
  'Quarkus': si(siQuarkus),
  'React': si(siReact),
  'Git': si(siGit),
  'GitHub': si(siGithub),
  'Docker': si(siDocker),
  'Podman': si(siPodman),
  'Kubernetes': si(siKubernetes),
  'Linux': si(siLinux),
  'Windows': { fa: ['fab', 'windows'] },
  'Vite': si(siVite),
  'Gradle': si(siGradle),
  'Maven': si(siApachemaven),
}

export const fallbackIcon: SkillIcon = { fa: ['fas', 'code'] }
