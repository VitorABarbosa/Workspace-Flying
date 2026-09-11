import { comPreco, descricaoDe, lerPreco, precoInformadoDe } from '../itens'

describe('itens da estrutura', () => {
  it('descrição e preço saem tanto de string quanto de objeto', () => {
    expect(descricaoDe('Fachada')).toBe('Fachada')
    expect(descricaoDe({ descricao: 'Filme institucional de até 2:00', preco: 15000 })).toBe(
      'Filme institucional de até 2:00'
    )
    expect(precoInformadoDe('Fachada')).toBeNull()
    expect(precoInformadoDe({ descricao: 'x', preco: 15000 })).toBe(15000)
    expect(precoInformadoDe({ descricao: 'x' })).toBeNull()
  })

  it('comPreco fecha o valor e, com null, volta a ser só a descrição', () => {
    expect(comPreco('Fachada', 5000)).toEqual({ descricao: 'Fachada', preco: 5000 })
    expect(comPreco({ descricao: 'Fachada', preco: 5000 }, null)).toBe('Fachada')
  })

  it('lerPreco entende o jeito brasileiro de escrever', () => {
    expect(lerPreco('15.000')).toBe(15000)
    expect(lerPreco('15 mil')).toBe(15000)
    expect(lerPreco('R$ 4.500,00')).toBe(4500)
    expect(lerPreco('')).toBeNull()
    expect(lerPreco('abc')).toBeNull()
    expect(lerPreco('-3')).toBeNull()
  })
})
