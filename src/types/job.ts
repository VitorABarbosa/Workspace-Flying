/**
 * Terminal states where polling must stop.
 */
export type JobTerminalState = 'completed' | 'failed' | 'cancelled'

/**
 * All possible states a job can be in.
 * Matches the status field returned by the FastAPI backend.
 * Non-terminal states: 'pending' | 'processing' | 'awaiting_input'
 */
export type JobState =
  | 'pending'
  | 'running'
  | 'processing'
  | 'awaiting_input'
  | 'completed'
  | 'failed'
  | 'cancelled'

/**
 * Response shape from GET /api/agents/[slug]/jobs/[id]
 * The `result` field is present only when state === 'completed'.
 * The `error` field is present only when state === 'failed'.
 * The `progress` field is optional metadata the backend may include.
 * LUMEN-specific fields (progress_pct, found, new, duplicates, leads_saved) are
 * optional and only populated by the LUMEN backend — Pesquisador never sets them.
 */
export interface JobStatus {
  id: string
  state: JobState
  result?: unknown       // agent-specific; Pesquisador returns { markdown: string }
  error?: string
  progress?: string      // optional stage label: "Analisando documento..."
  requires_address?: boolean
  address_prompt?: string
  // LUMEN-specific fields — undefined for Pesquisador (backend never sends these)
  progress_pct?: number     // 0–100 deterministic progress
  found?: number            // total leads found in this search cycle
  new?: number              // leads not previously in the database
  duplicates?: number       // leads already in the database
  leads_saved?: number      // returned by POST /search/{job_id}/cancel
}

/**
 * Typed result shape for the Pesquisador agent.
 * Phase 3 uses this as: const result = jobStatus.result as PesquisadorResult
 */
export interface PesquisadorResult {
  markdown: string
}

/**
 * Typed progress shape for LUMEN's LumenJobProgress component.
 * Used to preserve finalCounts after a job reaches a terminal state.
 */
export interface LumenProgress {
  progress_pct: number
  found: number
  new: number
  duplicates: number
}
