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

describe('PreviewPainel — empresa emissora', () => {
  it('sem emissor na estrutura, mostra Flying (proposta antiga)', () => {
    render(<PreviewPainel levantamento={LEV} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByLabelText('Empresa')).toHaveValue('flying')
  })

  it('trocar de empresa leva a tabela da empresa junto', () => {
    // Mandar a tabela da Flying com emissor da Rinno o backend recusa com 422.
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.change(screen.getByLabelText('Empresa'), { target: { value: 'rinno' } })
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ emissor: 'rinno', tabela_precos: 'rinno' })
    )
  })

  it('só a Flying mostra o seletor de tabela (padrão/MCMV)', () => {
    const { rerender } = render(
      <PreviewPainel levantamento={LEV} onEditar={jest.fn()} carregando={false} />
    )
    expect(screen.getByLabelText('Tabela')).toBeInTheDocument()

    const naNid = { ...LEV, estrutura: { ...LEV.estrutura, emissor: 'nid' as const } }
    rerender(<PreviewPainel levantamento={naNid} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByLabelText('Empresa')).toHaveValue('nid')
    expect(screen.queryByLabelText('Tabela')).not.toBeInTheDocument()
  })

  it('tabela inválida para a empresa não fica presa no select', () => {
    const inconsistente = {
      ...LEV,
      estrutura: { ...LEV.estrutura, emissor: 'flying' as const, tabela_precos: 'nid' as const },
    }
    render(<PreviewPainel levantamento={inconsistente} onEditar={jest.fn()} carregando={false} />)
    expect(screen.getByLabelText('Tabela')).toHaveValue('padrao')
  })
})

describe('PreviewPainel — ajuste sobre a planilha e preço por imagem', () => {
  it('commit do ajuste manda ajuste_planilha_pct', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Ajuste sobre a planilha (%)')
    fireEvent.change(campo, { target: { value: '10' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ ajuste_planilha_pct: 10 }))
  })

  it('preço por imagem aceita "2.400" e vazio volta a null', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Preço fixo por imagem (R$)')
    fireEvent.change(campo, { target: { value: '2.400' } })
    fireEvent.keyDown(campo, { key: 'Enter' })
    expect(onEditar).toHaveBeenLastCalledWith(expect.objectContaining({ preco_por_imagem: 2400 }))

    const comPreco = { ...LEV, estrutura: { ...LEV.estrutura, preco_por_imagem: 2400 } }
    const { unmount } = render(<PreviewPainel levantamento={comPreco} onEditar={onEditar} carregando={false} />)
    const campos = screen.getAllByLabelText('Preço fixo por imagem (R$)')
    const ultimo = campos[campos.length - 1]
    expect(ultimo).toHaveValue('2400')
    fireEvent.change(ultimo, { target: { value: '' } })
    fireEvent.blur(ultimo)
    expect(onEditar).toHaveBeenLastCalledWith(expect.objectContaining({ preco_por_imagem: null }))
    unmount()
  })

  it('valor igual ao atual não reprecifica à toa', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.blur(screen.getByLabelText('Ajuste sobre a planilha (%)'))
    fireEvent.blur(screen.getByLabelText('Preço fixo por imagem (R$)'))
    expect(onEditar).not.toHaveBeenCalled()
  })
})

describe('PreviewPainel — preço fechado por item', () => {
  it('clicar no preço abre o campo; Enter grava o item como {descricao, preco}', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.click(screen.getByLabelText('Preço de Fachada'))
    const campo = screen.getByLabelText('Novo preço de Fachada')
    fireEvent.change(campo, { target: { value: '15 mil' } })
    fireEvent.keyDown(campo, { key: 'Enter' })
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ externas: [{ descricao: 'Fachada', preco: 15000 }] })
    )
  })

  it('item já fechado mostra o preço marcado e vazio devolve à tabela', () => {
    const onEditar = jest.fn()
    const lev = { ...LEV, estrutura: { ...LEV.estrutura, externas: [{ descricao: 'Fachada', preco: 15000 }] } }
    render(<PreviewPainel levantamento={lev} onEditar={onEditar} carregando={false} />)
    const botao = screen.getByLabelText('Preço de Fachada')
    expect(botao).toHaveAttribute('title', expect.stringMatching(/Valor fechado/))
    fireEvent.click(botao)
    const campo = screen.getByLabelText('Novo preço de Fachada')
    expect(campo).toHaveValue('3000')
    fireEvent.change(campo, { target: { value: '' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ externas: ['Fachada'] }))
  })

  it('Escape fecha sem gravar; remover item-objeto funciona pelo nome', () => {
    const onEditar = jest.fn()
    const lev = { ...LEV, estrutura: { ...LEV.estrutura, externas: [{ descricao: 'Fachada', preco: 15000 }] } }
    render(<PreviewPainel levantamento={lev} onEditar={onEditar} carregando={false} />)
    fireEvent.click(screen.getByLabelText('Preço de Fachada'))
    fireEvent.keyDown(screen.getByLabelText('Novo preço de Fachada'), { key: 'Escape' })
    expect(onEditar).not.toHaveBeenCalled()
    fireEvent.click(screen.getByLabelText('Remover Fachada'))
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ externas: [] }))
  })
})

describe('PreviewPainel — áreas do empreendimento', () => {
  it('o número de áreas volta na estrutura, porque multiplica o tour', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Quantidade de áreas/ambientes')
    expect(campo).toHaveValue(null)          // vazio até alguém informar
    fireEvent.change(campo, { target: { value: '7' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ ambientes: 7 }))
  })

  it('campo vazio volta a null, e não a 1', () => {
    const onEditar = jest.fn()
    const com = { ...LEV, estrutura: { ...LEV.estrutura, ambientes: 7 } }
    render(<PreviewPainel levantamento={com} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Quantidade de áreas/ambientes')
    fireEvent.change(campo, { target: { value: '' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ ambientes: null }))
  })
})

describe('PreviewPainel — tudo é alterável à mão', () => {
  it('a descrição do item se reescreve clicando nela', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.click(screen.getByText('Perspectiva Fachada'))
    const campo = screen.getByLabelText('Descrição de Fachada')
    fireEvent.change(campo, { target: { value: 'Fachada noturna vista da calçada' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ externas: ['Fachada noturna vista da calçada'] })
    )
  })

  it('reescrever a descrição não perde o preço já fechado', () => {
    const onEditar = jest.fn()
    const comPrecoFechado = {
      ...LEV,
      estrutura: { ...LEV.estrutura, externas: [{ descricao: 'Fachada', preco: 5000 }] },
    }
    render(<PreviewPainel levantamento={comPrecoFechado} onEditar={onEditar} carregando={false} />)
    fireEvent.click(screen.getByText('Perspectiva Fachada'))
    const campo = screen.getByLabelText('Descrição de Fachada')
    fireEvent.change(campo, { target: { value: 'Fachada noturna' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(
      expect.objectContaining({ externas: [{ descricao: 'Fachada noturna', preco: 5000 }] })
    )
  })

  it('descrição vazia não apaga o item', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    fireEvent.click(screen.getByText('Perspectiva Fachada'))
    const campo = screen.getByLabelText('Descrição de Fachada')
    fireEvent.change(campo, { target: { value: '   ' } })
    fireEvent.blur(campo)
    expect(onEditar).not.toHaveBeenCalled()
  })

  it('o investimento pode ser cravado num valor', () => {
    const onEditar = jest.fn()
    render(<PreviewPainel levantamento={LEV} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Fechar o investimento em (R$)')
    fireEvent.change(campo, { target: { value: '100 mil' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ total_fechado: 100000 }))
  })

  it('campo vazio volta ao desconto por percentual', () => {
    const onEditar = jest.fn()
    const fechado = { ...LEV, estrutura: { ...LEV.estrutura, total_fechado: 100000 } }
    render(<PreviewPainel levantamento={fechado} onEditar={onEditar} carregando={false} />)
    const campo = screen.getByLabelText('Fechar o investimento em (R$)')
    fireEvent.change(campo, { target: { value: '' } })
    fireEvent.blur(campo)
    expect(onEditar).toHaveBeenCalledWith(expect.objectContaining({ total_fechado: null }))
  })
})
