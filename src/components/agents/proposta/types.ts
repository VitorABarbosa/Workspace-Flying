export type CategoriaKey = 'externas' | 'internas' | 'plantas'

export interface Cliente {
  empresa: string
  ref: string
  contato: string
}

export interface Estrutura {
  cliente: Cliente
  externas: string[]
  internas: string[]
  plantas: string[]
  desconto_pct: number
  desconto_label: string | null
  estrategia: 'auto' | 'planilha' | 'historico'
  mostrar_precos_individuais: boolean
  _avisos: string[]
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
    externas: CategoriaOrcada
    internas: CategoriaOrcada
    plantas: CategoriaOrcada
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
