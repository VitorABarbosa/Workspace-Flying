import {
  adicionarItem,
  moverItem,
  removerItem,
  semSecoesVazias,
  tituloDoBloco,
  totalDeImagens,
  trocarItem,
  trocarTitulo,
} from '../rollSecoes'
import type { Roll } from '../types'

const ROLL: Roll = {
  cliente: { empresa: 'OUSY', ref: 'Vila Mariana' },
  aprovado_em: '2026-06-30',
  avisos: [],
  blocos: [
    { tipo: 'externas', titulo: '', itens: ['Fachada diurna', 'Piscina'] },
    { tipo: 'internas', titulo: '', itens: ['Lobby'] },
    { tipo: 'servico', titulo: 'Maquete Eletrônica', itens: ['Render 360°'] },
  ],
}

describe('rollSecoes', () => {
  it('serviço não conta como imagem', () => {
    expect(totalDeImagens(ROLL.blocos)).toBe(3)
  })

  it('imagem usa o rótulo fixo e serviço o nome próprio', () => {
    expect(tituloDoBloco(ROLL.blocos[0])).toBe('Ilustrações Externas')
    expect(tituloDoBloco(ROLL.blocos[2])).toBe('Maquete Eletrônica')
  })

  it('mover leva o item para a outra seção', () => {
    const depois = moverItem(ROLL, 0, 1, 'internas')
    expect(depois.blocos[0].itens).toEqual(['Fachada diurna'])
    expect(depois.blocos[1].itens).toEqual(['Lobby', 'Piscina'])
  })

  it('mover para seção que ainda não existe cria a seção', () => {
    const depois = moverItem(ROLL, 0, 0, 'plantas')
    const plantas = depois.blocos.find((b) => b.tipo === 'plantas')
    expect(plantas?.itens).toEqual(['Fachada diurna'])
  })

  it('mover para a própria seção não mexe em nada', () => {
    expect(moverItem(ROLL, 0, 0, 'externas')).toBe(ROLL)
  })

  it('seção vazia some do roll', () => {
    const vazia = semSecoesVazias(removerItem(ROLL, 1, 0))
    expect(vazia.blocos.map((b) => b.tipo)).toEqual(['externas', 'servico'])
  })

  it('serviço sem item continua no roll — o escopo vem do cadastro', () => {
    const semEscopo = semSecoesVazias(removerItem(ROLL, 2, 0))
    expect(semEscopo.blocos.map((b) => b.tipo)).toContain('servico')
  })

  it('trocar item e título não mexem nos vizinhos', () => {
    const t = trocarItem(ROLL, 0, 0, 'Fachada noturna')
    expect(t.blocos[0].itens).toEqual(['Fachada noturna', 'Piscina'])
    expect(t.blocos[1]).toBe(ROLL.blocos[1])
    expect(trocarTitulo(ROLL, 2, 'Vista Virtual').blocos[2].titulo).toBe('Vista Virtual')
  })

  it('adicionar abre uma linha em branco na seção', () => {
    expect(adicionarItem(ROLL, 1).blocos[1].itens).toEqual(['Lobby', ''])
  })
})
