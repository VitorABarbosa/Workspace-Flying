// src/components/agents/lumen/LeadScoreBadge.tsx

function getScoreConfig(score: number): { classes: string } {
  if (score >= 70)
    return { classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
  if (score >= 40)
    return { classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
  return { classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
}

export function LeadScoreBadge({ score }: { score: number }) {
  const { classes } = getScoreConfig(score)
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${classes}`}
      aria-label={`Score: ${score}`}
    >
      {score}
    </span>
  )
}
