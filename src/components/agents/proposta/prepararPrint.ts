/**
 * Preparo do print antes de subir: valida, encolhe e devolve data URL.
 *
 * O backend tem as mesmas guardas (ele não confia no cliente), mas fazer isso
 * aqui evita subir 8 MB de foto para receber um "grande demais" de volta, e o
 * downscale corta o custo de leitura na origem — print de celular em resolução
 * cheia é desperdício puro.
 */

export const MAX_BYTES = 5 * 1024 * 1024
export const MAX_PRINTS = 4
export const LARGURA_MAXIMA = 1600
export const ALTURA_MAXIMA = 3600
export const QUALIDADE_JPEG = 0.85

export interface PrintPreparado {
  nome: string
  dataUrl: string
}

export class PrintInvalido extends Error {}

function lerComoDataUrl(arquivo: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result))
    leitor.onerror = () => reject(new PrintInvalido('Não consegui ler esse arquivo.'))
    leitor.readAsDataURL(arquivo)
  })
}

function carregarImagem(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new PrintInvalido('Esse arquivo não abre como imagem.'))
    img.src = dataUrl
  })
}

/**
 * Encolhe para caber em `LARGURA_MAXIMA` x `ALTURA_MAXIMA` e reencoda em JPEG.
 *
 * Os dois lados são limitados SEPARADAMENTE, e não o maior lado: print de
 * e-mail é alto e estreito, e com um teto único de 1400px uma captura de
 * 1200x3000 virava 560x1400 — a letra miúda sumia antes mesmo de sair daqui.
 * Não se ganhava nada com isso: a API de visão normaliza o menor lado para
 * 768px de qualquer jeito, então as duas versões custam os mesmos tiles.
 *
 * O canvas é conferido ANTES de carregar a imagem: onde ele não existe (jsdom,
 * browser antigo) nem chegamos a esperar um `onload` que nunca vem — devolve o
 * original e quem encolhe é o backend, só sai mais caro.
 */
async function encolher(dataUrl: string): Promise<string> {
  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D | null = null
  try {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  } catch {
    return dataUrl
  }
  if (!ctx || typeof canvas.toDataURL !== 'function') return dataUrl

  const img = await carregarImagem(dataUrl)
  const escala = Math.min(1, LARGURA_MAXIMA / img.width, ALTURA_MAXIMA / img.height)
  canvas.width = Math.max(1, Math.round(img.width * escala))
  canvas.height = Math.max(1, Math.round(img.height * escala))
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const encolhido = canvas.toDataURL('image/jpeg', QUALIDADE_JPEG)
  // Print de tela com pouca cor às vezes fica maior em JPEG que o PNG original.
  return encolhido.length < dataUrl.length ? encolhido : dataUrl
}

export async function prepararPrint(arquivo: File): Promise<PrintPreparado> {
  if (!arquivo.type.startsWith('image/')) {
    throw new PrintInvalido(`"${arquivo.name}" não é uma imagem. Manda o print em PNG ou JPG.`)
  }
  if (arquivo.size > MAX_BYTES) {
    throw new PrintInvalido(
      `"${arquivo.name}" tem mais de ${Math.round(MAX_BYTES / (1024 * 1024))} MB. ` +
        'Manda uma captura da tela em vez da foto em resolução cheia.'
    )
  }
  const original = await lerComoDataUrl(arquivo)
  return { nome: arquivo.name, dataUrl: await encolher(original) }
}

/**
 * Imagens dentro de um Ctrl+V ou de um arrastar-e-soltar, na ordem em que vieram.
 *
 * Print colado é o caminho mais curto entre o pedido do cliente e a proposta:
 * a pessoa dá print no e-mail, cola e pronto — sem salvar arquivo no disco só
 * para depois procurá-lo no seletor.
 */
export function imagensDaTransferencia(dados: DataTransfer | null | undefined): File[] {
  if (!dados) return []
  const achados: File[] = []
  // `items` é o que traz o print colado; `files`, o arquivo arrastado. Alguns
  // browsers preenchem só um dos dois, então olhamos os dois — sem duplicar.
  for (const item of Array.from(dados.items ?? [])) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) continue
    const arquivo = item.getAsFile()
    if (arquivo) achados.push(comNome(arquivo))
  }
  if (achados.length) return achados
  for (const arquivo of Array.from(dados.files ?? [])) {
    if (arquivo.type.startsWith('image/')) achados.push(comNome(arquivo))
  }
  return achados
}

/** Print colado chega sem nome (ou como "image.png") — e a miniatura mostra o nome. */
function comNome(arquivo: File): File {
  if (arquivo.name && arquivo.name !== 'image.png') return arquivo
  const extensao = (arquivo.type.split('/')[1] || 'png').replace('jpeg', 'jpg')
  try {
    return new File([arquivo], `print-colado.${extensao}`, { type: arquivo.type })
  } catch {
    return arquivo
  }
}
