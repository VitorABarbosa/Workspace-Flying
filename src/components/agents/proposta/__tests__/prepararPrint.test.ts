import {
  imagensDaTransferencia, MAX_BYTES, PrintInvalido, prepararPrint } from '../prepararPrint'

function arquivo(nome: string, tipo: string, tamanho = 1024, conteudo = 'x'): File {
  const f = new File([conteudo], nome, { type: tipo })
  Object.defineProperty(f, 'size', { value: tamanho })
  return f
}

/** Print "pesado": o data URL original precisa ser maior que o encolhido. */
const printGrande = () => arquivo('print.png', 'image/png', 1024, 'x'.repeat(4000))

describe('prepararPrint', () => {
  it('recusa arquivo que não é imagem', async () => {
    await expect(prepararPrint(arquivo('contrato.pdf', 'application/pdf'))).rejects.toThrow(
      PrintInvalido
    )
    await expect(prepararPrint(arquivo('contrato.pdf', 'application/pdf'))).rejects.toThrow(
      /não é uma imagem/
    )
  })

  it('recusa print acima do limite de tamanho antes de subir', async () => {
    await expect(
      prepararPrint(arquivo('foto.jpg', 'image/jpeg', MAX_BYTES + 1))
    ).rejects.toThrow(/5 MB/)
  })

  it('devolve data URL e o nome do arquivo aceito', async () => {
    const print = await prepararPrint(arquivo('print.png', 'image/png'))
    expect(print.nome).toBe('print.png')
    expect(print.dataUrl.startsWith('data:')).toBe(true)
  })
})

describe('prepararPrint com canvas disponível', () => {
  const ImageOriginal = global.Image
  let desenhado: { w: number; h: number } | null = null

  beforeEach(() => {
    desenhado = null
    // jsdom não decodifica imagem nem desenha: fingimos um print de 2800x1400.
    // @ts-expect-error — Image de mentira só com o que prepararPrint usa.
    global.Image = class {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 2800
      height = 1400
      set src(_valor: string) {
        setTimeout(() => this.onload?.(), 0)
      }
    }
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: jest.fn() } as unknown as CanvasRenderingContext2D)
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockImplementation(function (this: HTMLCanvasElement) {
        desenhado = { w: this.width, h: this.height }
        return 'data:image/jpeg;base64,menor'
      })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    global.Image = ImageOriginal
  })

  it('encolhe o print para o lado máximo antes de subir', async () => {
    const print = await prepararPrint(printGrande())
    expect(desenhado).toEqual({ w: 1400, h: 700 })
    expect(print.dataUrl).toBe('data:image/jpeg;base64,menor')
  })

  it('mantém o original quando o JPEG sai maior que ele', async () => {
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/jpeg;base64,' + 'a'.repeat(9000))
    const print = await prepararPrint(printGrande())
    expect(print.dataUrl).not.toContain('aaaa')
  })
})


describe('imagensDaTransferencia', () => {
  const imagem = () => new File(['x'], '', { type: 'image/png' })

  function transferencia(itens: unknown[], arquivos: File[] = []) {
    return { items: itens, files: arquivos } as unknown as DataTransfer
  }

  it('pega o print colado e lhe dá um nome (Ctrl+V vem sem nome)', () => {
    const colado = imagem()
    const achados = imagensDaTransferencia(
      transferencia([{ kind: 'file', type: 'image/png', getAsFile: () => colado }])
    )
    expect(achados).toHaveLength(1)
    expect(achados[0].name).toBe('print-colado.png')
    expect(achados[0].type).toBe('image/png')
  })

  it('ignora o texto que vem junto com o print', () => {
    const achados = imagensDaTransferencia(
      transferencia([
        { kind: 'string', type: 'text/plain', getAsFile: () => null },
        { kind: 'file', type: 'image/png', getAsFile: () => imagem() },
      ])
    )
    expect(achados).toHaveLength(1)
  })

  it('cai em files quando o browser não preenche items (arrastar e soltar)', () => {
    const arquivo = new File(['x'], 'email.png', { type: 'image/png' })
    const achados = imagensDaTransferencia(transferencia([], [arquivo]))
    expect(achados.map((a) => a.name)).toEqual(['email.png'])
  })

  it('sem imagem nenhuma, devolve lista vazia — o paste de texto segue normal', () => {
    expect(imagensDaTransferencia(transferencia([{ kind: 'string', type: 'text/plain' }]))).toEqual([])
    expect(imagensDaTransferencia(null)).toEqual([])
  })
})
