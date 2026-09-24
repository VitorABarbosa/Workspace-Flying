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
  /** Áreas do empreendimento: multiplica o tour virtual, cobrado por ambiente. */
  ambientes?: number | null
  /** Valor final negociado da proposta inteira; o desconto vira a diferença. */
  total_fechado?: number | null
  /** Em quantas vezes o cliente paga; ausente = cronograma da empresa. */
  parcelas?: number | null
  /** Mostrar "(N ambientes)" no título do serviço cobrado por ambiente. */
  mostrar_ambientes?: boolean
  /** Nome do arquivo entregue (Flying_Factus_Upside_Vista_AnexoI_R00). */
  nome_arquivo?: string | null
  /** Revisão da proposta: sobe sozinha ao reabrir uma já gerada. */
  revisao?: number | null
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
  /** Como o .docx vai se chamar ao ser baixado. */
  nome_arquivo?: string
  avisos: string[]
  pendencias: string[]
}

export interface PropostaGerada {
  proposta_id: number
  docx_url: string | null
  download: string
  nome_arquivo?: string
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
  nome_arquivo?: string | null
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

// ---------------------------------------------------------------- roll
//
// O roll é a lista do que entra em produção — cada perspectiva, cada planta,
// cada serviço — e não tem preço. Ele se mexe ao longo do projeto, e cada
// versão vira um arquivo: Roll_Flying, Roll_Flying_Atl, Roll_Flying_Atl_1.

/** Seção do roll. "" é o que a regra não soube dizer e alguém precisa confirmar. */
export type TipoDeBloco = 'externas' | 'internas' | 'plantas' | 'servico' | ''

export interface BlocoDoRoll {
  tipo: TipoDeBloco
  /** Nome próprio da seção. Serviço sempre tem; imagem herda o rótulo fixo. */
  titulo: string
  itens: string[]
}

export interface Roll {
  cliente: { empresa: string; ref: string }
  aprovado_em: string | null
  blocos: BlocoDoRoll[]
  avisos: string[]
  emissor?: Emissor
  nome_arquivo?: string | null
  versao?: number
}

export interface MudancaDoRoll {
  entrou: { tipo: string; item: string }[]
  saiu: { tipo: string; item: string }[]
  imagens_antes: number
  imagens_depois: number
}

export interface RollGerado {
  roll_id: number
  versao: number
  nome_arquivo: string
  emissor: Emissor
  imagens: number
  docx_url: string | null
  download: string
  pdf: string
  anterior: { id: number; nome_arquivo: string } | null
  mudou: MudancaDoRoll | null
  avisos: string[]
}

export interface RollListado {
  id: number
  cliente: string
  referencia: string | null
  emissor: Emissor
  versao: number
  nome_arquivo: string | null
  imagens: number
  data: string
  docx_url: string | null
  download: string
  pdf: string
}
