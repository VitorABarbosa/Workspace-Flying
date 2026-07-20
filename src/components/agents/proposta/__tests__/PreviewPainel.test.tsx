import { fireEvent, render, screen } from '@testing-library/react'
import { PreviewPainel } from '../PreviewPainel'
import type { Levantamento } from '../types'

const LEV: Levantamento = {
  estrutura: {
    cliente: { empresa: 'GALLI', ref: 'Aurora', contato: 'Daniel' },
    externas: ['Fachada'],
    internas: [],
    plantas: [],
    desconto_pct: 10,
    desconto_label: 'parceria',
    estrategia: 'planilha',
    mostrar_precos_individuais: false,
    _avisos: [],
  },
  fechado: {
    orcamento: {
      estrategia: 'planilha',
      subtotal: 3000,
      total_imagens: 1,
      externas: {
        nome: 'externas', qtd: 1, total: 3000,
        itens: [{ descricao: 'Perspectiva Fachada', preco: 3000, fonte: 'planilha:fachada' }],
      },
      internas: { nome: 'internas', qtd: 0, total: 0, itens: [] },
      plantas: { nome: 'plantas', qtd: 0, total: 0, itens: [] },
    },
    financeiro: { subtotal: 3000, desconto_pct: 10, desconto_valor: 300, total: 2700, rotulo: 'parceria' },
  },
  estrategia_usada: 'planilha',
  avisos: ['aviso de teste'],
  pendencias: [],
}

describe('PreviewPainel', () => {
  it('mostra pendências destacadas quando existem', () => {
    const comPendencia = { ...LEV, pendencias: ['Informe o A/C — responsável que recebe a proposta.'] }
    render(<PreviewPainel levantamento={comPendencia} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByText(/Informe o A\/C/)).toBeInTheDocument()
  })

  it('editar empresa do cliente devolve estrutura atualizada', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Cliente')
    fireEvent.change(campo, { target: { value: 'BRNPAR' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ cliente: expect.objectContaining({ empresa: 'BRNPAR' }) })
    )
  })

  it('mostra itens, totais e avisos', () => {
    render(<PreviewPainel levantamento={LEV} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByText('Perspectiva Fachada')).toBeInTheDocument()
    // O item único custa exatamente o subtotal (R$ 3.000,00 aparece 2x: no item e no
    // resumo financeiro) — usa getAllByText para não colidir com getByText (match único).
    expect(screen.getAllByText(/R\$\s?3\.000,00/).length).toBeGreaterThan(0)
    expect(screen.getByText(/R\$\s?2\.700,00/)).toBeInTheDocument()
    expect(screen.getByText('aviso de teste')).toBeInTheDocument()
  })

  it('remover item devolve estrutura sem ele', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.click(screen.getByLabelText('Remover Fachada'))
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ externas: [] })
    )
  })

  it('mudar estratégia no select dispara onEditar imediatamente', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.change(screen.getByLabelText('Estratégia'), { target: { value: 'historico' } })
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ estrategia: 'historico' })
    )
  })

  it('editar desconto (%) só dispara onEditar no blur, não a cada tecla', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Desconto (%)')
    fireEvent.change(campo, { target: { value: '15' } })
    expect(onEditar).not.toHaveBeenCalled()
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ desconto_pct: 15 })
    )
  })

  it('renderiza categoria extra vinda de _categorias (ex: Filmes e Takes 3D)', () => {
    const comFilmes: Levantamento = {
      ...LEV,
      estrutura: { ...LEV.estrutura, filmes: ['Filme 3D 60s'] },
      fechado: {
        ...LEV.fechado,
        orcamento: {
          ...LEV.fechado.orcamento,
          _categorias: [
            { nome: 'externas', rotulo: 'Ilustrações Externas' },
            { nome: 'internas', rotulo: 'Ilustrações Internas' },
            { nome: 'plantas', rotulo: 'Plantas Humanizadas' },
            { nome: 'filmes', rotulo: 'Filmes e Takes 3D' },
          ],
          filmes: {
            nome: 'filmes', qtd: 1, total: 15000,
            itens: [{ descricao: 'Filme 3D — 60 segundos', preco: 15000, fonte: 'planilha:filme_3d_60s' }],
          },
        },
      },
    }
    render(<PreviewPainel levantamento={comFilmes} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByText('Filmes e Takes 3D')).toBeInTheDocument()
    expect(screen.getByText('Filme 3D — 60 segundos')).toBeInTheDocument()
  })

  it('mudar tabela no select dispara onEditar com tabela_precos', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.change(screen.getByLabelText('Tabela'), { target: { value: 'mcmv' } })
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ tabela_precos: 'mcmv' })
    )
  })
})
