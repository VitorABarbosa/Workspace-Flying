/**
 * Terminal states where polling must stop.
 */
export type JobTerminalState = 'completed' | 'failed'

/**
 * All possible states a job can be in.
 * Matches the status field returned by the FastAPI backend.
 * Non-terminal states: 'pending' | 'processing' | 'awaiting_input'
 */
export type JobState =
  | 'pending'
  | 'processing'
  | 'awaiting_input'
  | 'completed'
  | 'failed'

/**
 * Response shape from GET /api/agents/[slug]/jobs/[id]
 * The `result` field is present only when state === 'completed'.
 * The `error` field is present only when state === 'failed'.
 * The `progress` field is optional metadata the backend may include.
 */
export interface JobStatus {
  id: string
  state: JobState
  result?: unknown       // agent-specific; Pesquisador returns { markdown: string }
  error?: string
  progress?: string      // optional stage label: "Analisando documento..."
}

/**
 * Typed result shape for the Pesquisador agent.
 * Phase 3 uses this as: const result = jobStatus.result as PesquisadorResult
 */
export interface PesquisadorResult {
  markdown: string
}
