/**
 * O que a aba do roll aceita: o PDF, um print dele, ou a lista colada.
 *
 * O PDF vai inteiro para o backend em base64 — roll é documento de texto, tem
 * duas páginas, e ler a camada de texto lá é exato e não gasta visão. Print
 * segue o mesmo caminho da proposta (encolhido aqui antes de subir).
 */
import { MAX_BYTES, MAX_PRINTS, PrintInvalido, prepararPrint, type PrintPreparado } from './prepararPrint'

export const MAX_PDFS = 4

export interface RollAnexado {
  pdfs: { nome: string; base64: string }[]
  prints: PrintPreparado[]
}

function lerComoBase64(arquivo: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result).split(',', 2)[1] ?? '')
    leitor.onerror = () => reject(new PrintInvalido('Não consegui ler esse arquivo.'))
    leitor.readAsDataURL(arquivo)
  })
}

const ehPdf = (f: File) =>
  f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')

/** Separa PDFs de imagens e prepara cada um do seu jeito. */
export async function prepararRoll(arquivos: File[]): Promise<RollAnexado> {
  const pdfs: { nome: string; base64: string }[] = []
  for (const arquivo of arquivos.filter(ehPdf).slice(0, MAX_PDFS)) {
    if (arquivo.size > MAX_BYTES) {
      throw new PrintInvalido(
        `"${arquivo.name}" passa de ${Math.round(MAX_BYTES / (1024 * 1024))} MB. ` +
        'Manda o PDF do roll, que é leve — não o material de apresentação.'
      )
    }
    pdfs.push({ nome: arquivo.name, base64: await lerComoBase64(arquivo) })
  }
  const imagens = arquivos.filter((f) => !ehPdf(f) && f.type.startsWith('image/'))
  const prints = await Promise.all(imagens.slice(0, MAX_PRINTS).map(prepararPrint))
  return { pdfs, prints }
}
