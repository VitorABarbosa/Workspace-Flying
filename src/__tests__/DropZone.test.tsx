import { render, screen, fireEvent } from '@testing-library/react'
import { DropZone } from '@/components/agents/pesquisador/DropZone'

const makePdf = (name = 'test.pdf', sizeBytes = 1024) => {
  const file = new File(['x'.repeat(sizeBytes)], name, { type: 'application/pdf' })
  return file
}

describe('DropZone', () => {
  it('aceita arquivo PDF válido via input e chama onFileAccepted', () => {
    const onFileAccepted = jest.fn()
    const onSubmit = jest.fn()
    render(<DropZone onFileAccepted={onFileAccepted} onSubmit={onSubmit} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [makePdf()] } })
    expect(onFileAccepted).toHaveBeenCalledWith(expect.any(File))
  })

  it('rejeita arquivo não-PDF e exibe mensagem de erro', () => {
    render(<DropZone onFileAccepted={jest.fn()} onSubmit={jest.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const notPdf = new File(['abc'], 'document.docx', { type: 'application/vnd.openxmlformats' })
    fireEvent.change(input, { target: { files: [notPdf] } })
    expect(screen.getByText('Apenas arquivos PDF são aceitos.')).toBeInTheDocument()
  })

  it('rejeita arquivo PDF acima de 20MB e exibe mensagem de erro', () => {
    render(<DropZone onFileAccepted={jest.fn()} onSubmit={jest.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const bigFile = new File(['x'], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(bigFile, 'size', { value: 21 * 1024 * 1024 })
    fireEvent.change(input, { target: { files: [bigFile] } })
    expect(screen.getByText('O arquivo deve ter no máximo 20 MB.')).toBeInTheDocument()
  })

  it('exibe FilePreview com nome do arquivo após seleção válida', () => {
    render(<DropZone onFileAccepted={jest.fn()} onSubmit={jest.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [makePdf('relatorio.pdf')] } })
    expect(screen.getByText('relatorio.pdf')).toBeInTheDocument()
  })

  it('botão X remove arquivo e reverte para estado idle (texto inicial visível)', () => {
    render(<DropZone onFileAccepted={jest.fn()} onSubmit={jest.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [makePdf()] } })
    const removeBtn = screen.getByLabelText('Remover arquivo')
    fireEvent.click(removeBtn)
    expect(screen.getByText('Arraste o PDF aqui')).toBeInTheDocument()
  })

  it('botão "Enviar PDF" aparece apenas após arquivo válido selecionado', () => {
    render(<DropZone onFileAccepted={jest.fn()} onSubmit={jest.fn()} />)
    expect(screen.queryByText('Enviar PDF')).not.toBeInTheDocument()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [makePdf()] } })
    expect(screen.getByText('Enviar PDF')).toBeInTheDocument()
  })

  it('botão "Enviar PDF" chama onSubmit com o arquivo selecionado', () => {
    const onSubmit = jest.fn()
    render(<DropZone onFileAccepted={jest.fn()} onSubmit={onSubmit} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = makePdf()
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByText('Enviar PDF'))
    expect(onSubmit).toHaveBeenCalledWith(file)
  })
})
