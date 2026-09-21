/**
 * Um item da estrutura é a descrição ("Filme institucional de até 2:00") ou
 * `{ descricao, preco }` quando a pessoa fechou o valor daquele item. Filme
 * tem muitas variáveis — duração, locução, 4K — e a tabela é referência por
 * tipo, não regra. O número vem de quem negociou; a IA nunca inventa.
 */
export type ItemEntrada = string | { descricao: string; preco?: number | null }

export function descricaoDe(item: ItemEntrada): string {
  return typeof item === 'string' ? item : item.descricao
}

export function precoInformadoDe(item: ItemEntrada): number | null {
  return typeof item === 'string' ? null : (item.preco ?? null)
}

/** Devolve a entrada com o preço fechado, ou só a descrição quando limpa. */
export function comPreco(item: ItemEntrada, preco: number | null): ItemEntrada {
  const descricao = descricaoDe(item)
  return preco == null ? descricao : { descricao, preco }
}

/** Devolve a entrada com outra descrição, sem perder o preço fechado. */
export function comDescricao(item: ItemEntrada, descricao: string): ItemEntrada {
  const preco = precoInformadoDe(item)
  return preco == null ? descricao : { descricao, preco }
}

/** "15.000" → 15000; "15 mil" → 15000; vazio ou lixo → null. */
export function lerPreco(texto: string): number | null {
  const t = texto.trim().toLowerCase()
  if (!t) return null
  const mil = /\bmil\b|k$/.test(t)
  const n = parseFloat(t.replace(/mil|k|r\$|\s/g, '').replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(mil ? n * 1000 : n)
}
