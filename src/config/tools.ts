// Tool registry — config-driven para o tools hub.
// Adicionar nova ferramenta: criar componente em components/agents/[slug]/ + uma entrada aqui + uma linha em AGENT_COMPONENTS em tools/[slug]/page.tsx

export interface Tool {
  id: string
  name: string
  description: string
  status: 'active' | 'coming-soon'
  href: string
  icon?: string  // Lucide icon name (optional): 'Search', 'FileText', etc.
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.id === slug)
}

export const tools: Tool[] = [
  {
    id: 'pesquisador',
    name: 'Pesquisador',
    description: 'Analisa documentação imobiliária e gera relatório de due diligence com base em PDF.',
    status: 'active',
    href: '/tools/pesquisador',
    icon: 'Search',
  },
]
