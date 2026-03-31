// Tool registry — config-driven para o tools hub.
// Adicionar nova ferramenta: criar componente em components/agents/[slug]/ + uma entrada aqui + uma linha em AGENT_COMPONENTS em tools/[slug]/page.tsx

export type AreaSlug =
  | 'producao'
  | 'rh'
  | 'animacao'
  | 'marketing'
  | 'comercial'
  | 'operacional'

export interface Area {
  slug: AreaSlug
  name: string
  icon?: string
}

export interface Tool {
  id: string
  name: string
  description: string
  status: 'active' | 'coming-soon'
  href: string
  icon?: string  // Lucide icon name (optional): 'Search', 'FileText', etc.
  areas: AreaSlug[]   // required — tool must declare its areas
}

export const AREAS: Area[] = [
  { slug: 'producao',    name: 'PRODUÇÃO' },
  { slug: 'rh',          name: 'RH' },
  { slug: 'animacao',    name: 'ANIMAÇÃO' },
  { slug: 'marketing',   name: 'MARKETING' },
  { slug: 'comercial',   name: 'COMERCIAL' },
  { slug: 'operacional', name: 'OPERACIONAL' },
]

export function getAreaBySlug(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug)
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.id === slug)
}

export function getToolsByArea(areaSlug: AreaSlug): Tool[] {
  return tools.filter((t) => t.areas.includes(areaSlug))
}

export const tools: Tool[] = [
  {
    id: 'pesquisador',
    name: 'Pesquisador',
    description: 'Analisa documentação imobiliária e gera relatório de due diligence com base em PDF.',
    status: 'active',
    href: '/tools/pesquisador',
    icon: 'Search',
    areas: ['comercial'],
  },
  {
    id: 'lumen',
    name: 'LUMEN',
    description: 'Busca empresas do setor imobiliário por cidade e segmento. Gera uma lista de leads qualificados com contatos Apollo.',
    status: 'active',
    href: '/tools/lumen',
    icon: 'Building2',
    areas: ['comercial', 'marketing'],
  },
]
