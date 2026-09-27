import type { Component } from 'vue'
import IntroSheet from './IntroSheet.vue'
import FlagshipSheet from './FlagshipSheet.vue'
import ProjectListSlide from './ProjectListSlide.vue'
import ReadmeSlide from './ReadmeSlide.vue'
import PostFeedSheet from './PostFeedSheet.vue'
import PostSlide from './PostSlide.vue'
import TimelineSheet from './TimelineSheet.vue'
import SkillsSheet from './SkillsSheet.vue'
import ContactSheet from './ContactSheet.vue'

/** Names used in sheets.config.ts map to these components. */
export const sheetComponents: Record<string, Component> = {
  IntroSheet,
  FlagshipSheet,
  ProjectListSlide,
  ReadmeSlide,
  PostFeedSheet,
  PostSlide,
  TimelineSheet,
  SkillsSheet,
  ContactSheet,
}
