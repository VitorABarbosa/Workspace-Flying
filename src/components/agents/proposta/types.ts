// Categorias deixaram de ser fixas: vêm dinamicamente do backend (preco_categoria).
// Continua string simples — sem union — para aceitar qualquer categoria do catálogo.
export type CategoriaKey = string

export interface Cliente {
  empresa: string
  ref: string
  contato: string
}

export interface CategoriaMeta {
  nome: string
  rotulo: string
}

export interface Estrutura {
  cliente: Cliente
  desconto_pct: number
  desconto_label: string | null
  estrategia: 'auto' | 'planilha' | 'historico'
  mostrar_precos_individuais: boolean
  tabela_precos?: 'padrao' | 'mcmv'
  _avisos: string[]
  // Categorias dinâmicas (externas, internas, plantas, filmes, tecnologia, ...):
  // cada uma é uma lista de descrições em texto livre.
  [categoria: string]: unknown
}

export interface ItemOrcado {
  descricao: string
  preco: number
  fonte: string
}

export interface CategoriaOrcada {
  nome: string
  qtd: number
  total: number
  itens: ItemOrcado[]
}

export interface Fechado {
  orcamento: {
    estrategia: string
    subtotal: number
    total_imagens: number
    // Metadados ordenados das categorias presentes no orçamento (nome + rótulo de exibição).
    // Ausente em respostas antigas do backend — usar fallback fixo nesse caso.
    _categorias?: CategoriaMeta[]
    // Categorias dinâmicas como chaves planas (compatibilidade), cada uma um CategoriaOrcada.
    [categoria: string]: unknown
  }
  financeiro: {
    subtotal: number
    desconto_pct: number
    desconto_valor: number
    total: number
    rotulo: string
  }
}

export interface Levantamento {
  estrutura: Estrutura
  fechado: Fechado
  estrategia_usada: string
  avisos: string[]
  pendencias: string[]
}

export interface PropostaGerada {
  proposta_id: number
  docx_url: string | null
  download: string
  fechado: Fechado
  avisos: string[]
}

export interface PropostaListada {
  id: number
  cliente: string
  referencia: string | null
  data: string
  total: number
  docx_url: string | null
  download: string
  pdf: string
}

export interface MensagemChat {
  role: 'user' | 'assistant'
  content: string
}

export interface RespostaChat {
  mensagem: string
  quick_replies: string[]
  levantamento: Levantamento | null
}
