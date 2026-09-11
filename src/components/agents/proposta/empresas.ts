/**
 * As três empresas do grupo que emitem proposta.
 *
 * Espelha `app/empresas.py` do aut-proposta: a empresa decide quais tabelas de
 * preço valem, qual timbrado abre o .docx e qual gerador escreve o corpo.
 * Mandar uma tabela que não é da empresa escolhida o backend recusa com 422 —
 * por isso trocar de empresa aqui já troca a tabela junto.
 *
 * `emissor` é qual das NOSSAS empresas assina; `cliente.empresa` continua
 * sendo a construtora que recebe.
 */

export type Emissor = 'flying' | 'rinno' | 'nid'

export type TabelaPrecos = 'padrao' | 'mcmv' | 'rinno' | 'nid'

export interface Empresa {
  chave: Emissor
  rotulo: string
  /** Tabelas de preço válidas; a primeira é a padrão da empresa. */
  tabelas: { valor: TabelaPrecos; rotulo: string }[]
}

export const EMPRESAS: Empresa[] = [
  {
    chave: 'flying',
    rotulo: 'Flying Studio',
    tabelas: [
      { valor: 'padrao', rotulo: 'Padrão' },
      { valor: 'mcmv', rotulo: 'MCMV' },
    ],
  },
  { chave: 'rinno', rotulo: 'Rinno Films', tabelas: [{ valor: 'rinno', rotulo: 'Padrão' }] },
  { chave: 'nid', rotulo: 'NID Studio', tabelas: [{ valor: 'nid', rotulo: 'Padrão' }] },
]

export const EMISSOR_PADRAO: Emissor = 'flying'

/** Proposta gravada antes do multi-empresa não tem emissor: é da Flying. */
export function empresaDe(emissor: string | null | undefined): Empresa {
  return EMPRESAS.find((e) => e.chave === emissor) ?? EMPRESAS[0]
}

export function rotuloDaEmpresa(emissor: string | null | undefined): string {
  return empresaDe(emissor).rotulo
}

export function tabelaPadraoDe(emissor: string | null | undefined): TabelaPrecos {
  return empresaDe(emissor).tabelas[0].valor
}

/** A tabela continua valendo para a empresa? Senão, a padrão dela. */
export function tabelaValidaPara(
  emissor: string | null | undefined,
  tabela: string | null | undefined
): TabelaPrecos {
  const empresa = empresaDe(emissor)
  const encontrada = empresa.tabelas.find((t) => t.valor === tabela)
  return encontrada ? encontrada.valor : empresa.tabelas[0].valor
}
