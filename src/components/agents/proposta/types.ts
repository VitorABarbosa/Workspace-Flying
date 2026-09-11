import type { Emissor, TabelaPrecos } from './empresas'

// Categorias deixaram de ser fixas: vêm dinamicamente do backend (preco_categoria).
// Continua string simples — sem union — para aceitar qualquer categoria do catálogo.
// As da Rinno vêm prefixadas com `rinno_` e as da NID com `nid_`.
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
  // Qual das três empresas do grupo emite. Ausente em proposta antiga: Flying.
  emissor?: Emissor
  tabela_precos?: TabelaPrecos
  // Ajuste sobre a tabela, em %, no preço de cada item — invisível na proposta
  // (cliente novo costuma ser +10). Diferente do desconto, que é linha visível.
  ajuste_planilha_pct?: number
  // Preço único fechado para todas as perspectivas e plantas (ex.: 2400).
  preco_por_imagem?: number | null
  _avisos: string[]
  // Categorias dinâmicas (externas, internas, plantas, filmes, tecnologia, ...):
  // cada uma é uma lista de ItemEntrada — descrição em texto livre, ou
  // { descricao, preco } quando o valor daquele item foi fechado à parte.
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
  emissor?: Emissor
  avisos: string[]
  pendencias: string[]
}

export interface PropostaGerada {
  proposta_id: number
  docx_url: string | null
  download: string
  fechado: Fechado
  emissor?: Emissor
  avisos: string[]
}

export interface PropostaListada {
  id: number
  cliente: string
  emissor?: Emissor
  referencia: string | null
  data: string
  total: number
  docx_url: string | null
  download: string
  pdf: string
}

// Conteúdo em partes (formato da OpenAI), aceito pelo backend quando a
// mensagem leva print anexado.
export type ParteConteudo =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export interface MensagemChat {
  role: 'user' | 'assistant'
  content: string | ParteConteudo[]
}

export interface PropostaCitada {
  id: number
  cliente: string
  referencia: string | null
}

export interface RespostaChat {
  mensagem: string
  quick_replies: string[]
  levantamento: Levantamento | null
  propostas_citadas?: PropostaCitada[]
  // Leitura do print já em texto — exatamente o que o backend mandou ao
  // modelo. Substitui a imagem no histórico para o base64 não ser reenviado
  // nas rodadas seguintes (chat stateless: o front reenvia tudo a cada vez).
  transcricao?: string | null
}
