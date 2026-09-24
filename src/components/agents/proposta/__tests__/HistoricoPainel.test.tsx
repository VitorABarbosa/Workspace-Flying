import { fireEvent, render, screen } from '@testing-library/react'
import { HistoricoPainel } from '../HistoricoPainel'

const LISTA = [
  { id: 7, cliente: 'GALLI', referencia: 'Aurora', data: '2026-07-19',
    total: 5085, docx_url: null, download: '/propostas/7/docx', pdf: '/propostas/7/pdf' },
]

const LISTA_TRES_EMPRESAS = [
  { ...LISTA[0], id: 7, emissor: 'flying' as const },
  { ...LISTA[0], id: 8, emissor: 'rinno' as const, total: 39400 },
  { ...LISTA[0], id: 9, emissor: 'nid' as const, total: 80000 },
]

describe('HistoricoPainel', () => {
  it('lista propostas com links de download', () => {
    render(<HistoricoPainel propostas={LISTA} onExcluir={jest.fn()} onFiltrar={jest.fn()} carregando={false} />)
    expect(screen.getByText('GALLI')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s?5\.085,00/)).toBeInTheDocument()
    expect(screen.getByLabelText('Baixar PDF da proposta 7'))
      .toHaveAttribute('href', '/api/tools/proposta/propostas/7/pdf')
  })

  it('exclusão exige confirmação', () => {
    const onExcluir = jest.fn()
    render(<HistoricoPainel propostas={LISTA} onExcluir={onExcluir} onFiltrar={jest.fn()} carregando={false} />)
    fireEvent.click(screen.getByLabelText('Excluir proposta 7'))
    expect(onExcluir).not.toHaveBeenCalled()          // ainda não!
    fireEvent.click(screen.getByText('Confirmar exclusão'))
    expect(onExcluir).toHaveBeenCalledWith(7)
  })

  it('cada proposta mostra a empresa que a emitiu', () => {
    // Mesmo cliente e mesmo projeto podem ter proposta das três.
    render(
      <HistoricoPainel propostas={LISTA_TRES_EMPRESAS} onExcluir={jest.fn()}
                       onFiltrar={jest.fn()} carregando={false} />
    )
    expect(screen.getByText('Flying Studio')).toBeInTheDocument()
    expect(screen.getByText('Rinno Films')).toBeInTheDocument()
    expect(screen.getByText('NID Studio')).toBeInTheDocument()
  })

  it('proposta antiga, sem emissor, aparece como Flying', () => {
    render(<HistoricoPainel propostas={LISTA} onExcluir={jest.fn()} onFiltrar={jest.fn()} carregando={false} />)
    expect(screen.getByText('Flying Studio')).toBeInTheDocument()
  })
})

describe('HistoricoPainel — editar proposta já gerada', () => {
  const LISTA = [
    { id: 7, cliente: 'FACTUS', referencia: 'Baronesa', data: '2026-09-23',
      total: 45000, docx_url: null, emissor: 'flying' as const,
      download: '/propostas/7/docx', pdf: '/propostas/7/pdf' },
  ]

  it('o botão Editar chama onEditar com o id da proposta', () => {
    const onEditar = jest.fn()
    render(<HistoricoPainel propostas={LISTA} onExcluir={jest.fn()} onEditar={onEditar}
                            onFiltrar={jest.fn()} carregando={false} />)
    fireEvent.click(screen.getByLabelText('Editar proposta 7'))
    expect(onEditar).toHaveBeenCalledWith(7)
  })

  it('sem onEditar o botão não aparece', () => {
    render(<HistoricoPainel propostas={LISTA} onExcluir={jest.fn()}
                            onFiltrar={jest.fn()} carregando={false} />)
    expect(screen.queryByLabelText('Editar proposta 7')).not.toBeInTheDocument()
  })
})

describe('HistoricoPainel — nome do arquivo', () => {
  it('mostra como o arquivo daquela proposta se chama', () => {
    const lista = [{
      id: 7, cliente: 'FACTUS', referencia: 'Upside', data: '2026-09-24',
      total: 45000, docx_url: null, emissor: 'flying' as const,
      nome_arquivo: 'Flying_Factus_Upside_Vista_AnexoI_R00',
      download: '/propostas/7/docx', pdf: '/propostas/7/pdf',
    }]
    render(<HistoricoPainel propostas={lista} onExcluir={jest.fn()}
                            onFiltrar={jest.fn()} carregando={false} />)
    expect(screen.getByText('Flying_Factus_Upside_Vista_AnexoI_R00.docx')).toBeInTheDocument()
  })
})
