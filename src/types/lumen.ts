// Types for LUMEN lead data — Phase 5
// Do NOT import from job.ts here; these are independent domain types.

export interface ApolloContact {
  name: string
  title?: string
  email?: string
  email_confidence?: 'high' | 'medium' | 'low' | string
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
  apollo_contacts?: ApolloContact[]
  keywords?: string[]
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
