import { MAX_BYTES, PrintInvalido, prepararPrint } from '../prepararPrint'

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
