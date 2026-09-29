import type { Component } from 'vue'
import { lazySheet } from '~/deck/hydration'

/**
 * Names used in sheets.config.ts map to these components. Each is loaded and hydrated only when
 * the deck asks for it (app/deck/hydration.ts), so a first visit loads the code of one sheet.
 */
export const sheetComponents: Record<string, Component> = {
  IntroSheet: lazySheet(() => import('./IntroSheet.vue')),
  FlagshipSheet: lazySheet(() => import('./FlagshipSheet.vue')),
  ProjectListSlide: lazySheet(() => import('./ProjectListSlide.vue')),
  ReadmeSlide: lazySheet(() => import('./ReadmeSlide.vue')),
  PostFeedSheet: lazySheet(() => import('./PostFeedSheet.vue')),
  PostSlide: lazySheet(() => import('./PostSlide.vue')),
  TimelineSheet: lazySheet(() => import('./TimelineSheet.vue')),
  SkillsSheet: lazySheet(() => import('./SkillsSheet.vue')),
  ContactSheet: lazySheet(() => import('./ContactSheet.vue')),
}
