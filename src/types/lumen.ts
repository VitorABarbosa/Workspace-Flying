// Types for LUMEN lead data — Phase 5
// Phase 7 intentionally imports JobState from job.ts for SearchHistoryItem.
import type { JobState } from '@/types/job'

export interface ApolloContact {
  id?: string
  lead_id?: string
  name?: string
  role?: string
  email?: string
  /** 0–100 integer from backend */
  email_confidence?: number
  linkedin_url?: string
  phone?: string
}

export interface ScoreBreakdown {
  website_score?: number
  apollo_score?: number
  keyword_score?: number
  [key: string]: number | undefined
}

export interface Lead {
  id: string
  job_id: string
  name: string
  city?: string
  segment?: string
  website?: string
  phone?: string
  score: number
  scraping_status?: string
  score_breakdown?: ScoreBreakdown
  created_at?: string
}

export interface LeadsResponse {
  data: Lead[]
  total: number
  page: number
  pages: number
  per_page: number
}

/** Full lead detail returned by GET /leads/{id} */
export interface LeadDetail extends Lead {
  contacts: ApolloContact[]
  keywords: string[]
}

// Phase 7 — Search History types
export interface SearchHistoryItem {
  id: string
  city: string
  segments: string[]
  state: JobState
  found?: number
  new?: number
  duplicates?: number
  created_at: string
}

export interface SearchHistoryResponse {
  data: SearchHistoryItem[]
}
