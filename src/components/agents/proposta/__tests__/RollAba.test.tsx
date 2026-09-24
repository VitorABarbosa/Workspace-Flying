import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { RollAba } from '../RollAba'
import { RollResultado } from '../RollResultado'
import type { RollGerado } from '../types'

const ROLL_LIDO = {
  cliente: { empresa: 'OUSY', ref: 'Vila Mariana' },
  aprovado_em: '2026-06-30',
  avisos: ['"Sauna" está em externas e parece de internas — confira.'],
  blocos: [
    { tipo: 'externas', titulo: '', itens: ['Fachada diurna', 'Sauna'] },
    { tipo: 'internas', titulo: '', itens: ['Lobby'] },
  ],
}

function respostas(mapa: Record<string, unknown>) {
  return jest.fn((url: string) => {
    const chave = Object.keys(mapa).find((k) => String(url).includes(k))
    return Promise.resolve({ ok: true, json: async () => mapa[chave ?? ''] ?? {} })
  })
}

describe('RollAba', () => {
  beforeEach(() => {
    global.fetch = respostas({ '/rolls': { rolls: [] } }) as never
  })

  it('começa pedindo o roll, com a empresa escolhível', async () => {
    await act(async () => { render(<RollAba />) })
    expect(screen.getByLabelText('Anexar o roll (PDF ou print)')).toBeInTheDocument()
    expect(screen.getByLabelText('Empresa')).toHaveValue('flying')
    expect(screen.getByRole('button', { name: /Ler o roll/ })).toBeDisabled()
  })

  it('lê a lista colada e mostra as seções com a contagem de imagens', async () => {
    global.fetch = respostas({
      '/rolls/leitura': { roll: ROLL_LIDO },
      '/rolls': { rolls: [] },
    }) as never
    await act(async () => { render(<RollAba />) })

    fireEvent.change(screen.getByLabelText('Ou cole a lista'), {
      target: { value: 'OUSY - REF: VILA MARIANA\n2.1 – Ilustrações Externas\n1. Fachada diurna' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Ler o roll/ }))
    })

    await waitFor(() => expect(screen.getByText('2.1 Ilustrações Externas')).toBeInTheDocument())
    expect(screen.getByText('2.2 Ilustrações Internas')).toBeInTheDocument()
    expect(screen.getByText('3 imagens')).toBeInTheDocument()
    expect(screen.getByText(/parece de internas/)).toBeInTheDocument()
  })

  it('o item pode ser levado para outra seção ali mesmo', async () => {
    global.fetch = respostas({ '/rolls/leitura': { roll: ROLL_LIDO }, '/rolls': { rolls: [] } }) as never
    await act(async () => { render(<RollAba />) })
    fireEvent.change(screen.getByLabelText('Ou cole a lista'), { target: { value: 'x' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Ler o roll/ }))
    })

    await waitFor(() => expect(screen.getByLabelText('Seção de "Sauna"')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Seção de "Sauna"'), { target: { value: 'internas' } })
    expect(screen.getByLabelText('Item 2 de Ilustrações Internas')).toHaveValue('Sauna')
  })

  it('sem cliente o botão de gerar fica travado, e explica por quê', async () => {
    global.fetch = respostas({
      '/rolls/leitura': { roll: { ...ROLL_LIDO, cliente: { empresa: '', ref: '' } } },
      '/rolls': { rolls: [] },
    }) as never
    await act(async () => { render(<RollAba />) })
    fireEvent.change(screen.getByLabelText('Ou cole a lista'), { target: { value: 'x' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Ler o roll/ }))
    })

    await waitFor(() => expect(screen.getByRole('button', { name: /Gerar roll/ })).toBeDisabled())
    expect(screen.getByText(/Diga de quem é o empreendimento/)).toBeInTheDocument()
  })
})

describe('RollResultado — o que entrou e o que saiu', () => {
  const GERADO: RollGerado = {
    roll_id: 3, versao: 1, nome_arquivo: 'Roll_Flying_Atl', emissor: 'flying',
    imagens: 6, docx_url: null, download: '/rolls/3/docx', pdf: '/rolls/3/pdf',
    anterior: { id: 2, nome_arquivo: 'Roll_Flying' }, avisos: [],
    mudou: {
      entrou: [{ tipo: 'externas', item: 'Voo Rooftop' }],
      saiu: [{ tipo: 'internas', item: 'Delivery' }],
      imagens_antes: 6, imagens_depois: 6,
    },
  }

  it('mostra a versão, o arquivo e a diferença para a anterior', () => {
    render(<RollResultado gerado={GERADO} onNovo={jest.fn()} />)
    expect(screen.getByText('Roll_Flying_Atl.docx')).toBeInTheDocument()
    expect(screen.getByText(/a partir de Roll_Flying/)).toBeInTheDocument()
    expect(screen.getByText('Voo Rooftop')).toBeInTheDocument()
    expect(screen.getByText('Delivery')).toBeInTheDocument()
    expect(screen.getByText(/Ilustrações Externas/)).toBeInTheDocument()
  })

  it('primeira versão não tem com o que comparar', () => {
    render(<RollResultado
      gerado={{ ...GERADO, versao: 0, nome_arquivo: 'Roll_Flying', anterior: null, mudou: null }}
      onNovo={jest.fn()} />)
    expect(screen.getByText(/Primeira versão do roll/)).toBeInTheDocument()
    expect(screen.queryByText('O que mudou')).not.toBeInTheDocument()
  })
})
