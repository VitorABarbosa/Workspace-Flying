import type { BlocoDoRoll, Roll, TipoDeBloco } from './types'

/** Como cada seção se chama na tela e no documento. */
export const ROTULO_DA_SECAO: Record<TipoDeBloco, string> = {
  externas: 'Ilustrações Externas',
  internas: 'Ilustrações Internas',
  plantas: 'Plantas Baixas',
  servico: 'Serviço',
  '': 'A confirmar',
}

/** Para onde um item pode ser movido. Serviço fica de fora: tem nome próprio. */
export const SECOES_DE_IMAGEM: TipoDeBloco[] = ['externas', 'internas', 'plantas']

export function tituloDoBloco(bloco: BlocoDoRoll): string {
  return bloco.titulo || ROTULO_DA_SECAO[bloco.tipo]
}

export function totalDeImagens(blocos: BlocoDoRoll[]): number {
  return blocos
    .filter((b) => SECOES_DE_IMAGEM.includes(b.tipo))
    .reduce((soma, b) => soma + b.itens.length, 0)
}

function comBlocos(roll: Roll, blocos: BlocoDoRoll[]): Roll {
  return { ...roll, blocos }
}

export function trocarItem(roll: Roll, bloco: number, idx: number, texto: string): Roll {
  return comBlocos(roll, roll.blocos.map((b, i) =>
    i !== bloco ? b : { ...b, itens: b.itens.map((it, j) => (j === idx ? texto : it)) }))
}

export function removerItem(roll: Roll, bloco: number, idx: number): Roll {
  return comBlocos(roll, roll.blocos.map((b, i) =>
    i !== bloco ? b : { ...b, itens: b.itens.filter((_, j) => j !== idx) }))
}

export function adicionarItem(roll: Roll, bloco: number): Roll {
  return comBlocos(roll, roll.blocos.map((b, i) =>
    i !== bloco ? b : { ...b, itens: [...b.itens, ''] }))
}

export function trocarTitulo(roll: Roll, bloco: number, titulo: string): Roll {
  return comBlocos(roll, roll.blocos.map((b, i) => (i === bloco ? { ...b, titulo } : b)))
}

/**
 * Leva um item para outra seção — que é o conserto mais comum depois da
 * leitura: a sauna que foi para dentro, o "Tipo 4" que foi para as plantas.
 * A seção de destino é criada se ainda não existir.
 */
export function moverItem(roll: Roll, bloco: number, idx: number, destino: TipoDeBloco): Roll {
  const item = roll.blocos[bloco]?.itens[idx]
  if (item === undefined || roll.blocos[bloco].tipo === destino) return roll
  const semItem = roll.blocos.map((b, i) =>
    i !== bloco ? b : { ...b, itens: b.itens.filter((_, j) => j !== idx) })
  const alvo = semItem.findIndex((b) => b.tipo === destino)
  if (alvo < 0) {
    return comBlocos(roll, [...semItem, { tipo: destino, titulo: '', itens: [item] }])
  }
  return comBlocos(roll, semItem.map((b, i) =>
    i === alvo ? { ...b, itens: [...b.itens, item] } : b))
}

/** Seção vazia não vai para o documento — some assim que o último item sai. */
export function semSecoesVazias(roll: Roll): Roll {
  return comBlocos(roll, roll.blocos.filter((b) => b.itens.some((i) => i.trim()) || b.tipo === 'servico'))
}
