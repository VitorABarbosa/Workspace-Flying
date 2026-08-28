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
export const LADO_MAXIMO = 1400
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
 * Encolhe para `LADO_MAXIMO` no maior lado e reencoda em JPEG.
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
  const maior = Math.max(img.width, img.height)
  const escala = maior > LADO_MAXIMO ? LADO_MAXIMO / maior : 1
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
