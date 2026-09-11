import {
  EMISSOR_PADRAO,
  EMPRESAS,
  empresaDe,
  rotuloDaEmpresa,
  tabelaPadraoDe,
  tabelaValidaPara,
} from '../empresas'

describe('empresas do grupo', () => {
  it('registra as três, com a Flying primeiro', () => {
    expect(EMPRESAS.map((e) => e.chave)).toEqual(['flying', 'rinno', 'nid'])
    expect(EMISSOR_PADRAO).toBe('flying')
  })

  it('só a Flying tem mais de uma tabela', () => {
    expect(empresaDe('flying').tabelas.map((t) => t.valor)).toEqual(['padrao', 'mcmv'])
    expect(empresaDe('rinno').tabelas).toHaveLength(1)
    expect(empresaDe('nid').tabelas).toHaveLength(1)
  })

  it('proposta antiga, sem emissor, é da Flying', () => {
    // O backend grava 'flying' por DEFAULT, mas a resposta pode vir sem o campo.
    expect(empresaDe(undefined).chave).toBe('flying')
    expect(empresaDe(null).chave).toBe('flying')
    expect(rotuloDaEmpresa(undefined)).toBe('Flying Studio')
  })

  it('emissor desconhecido não quebra a tela', () => {
    expect(empresaDe('disney').chave).toBe('flying')
  })

  it('tabela padrão é a primeira da empresa', () => {
    expect(tabelaPadraoDe('flying')).toBe('padrao')
    expect(tabelaPadraoDe('rinno')).toBe('rinno')
    expect(tabelaPadraoDe('nid')).toBe('nid')
  })

  it('tabela de outra empresa cai na padrão da escolhida', () => {
    // Mandar mcmv com emissor rinno o backend recusa com 422.
    expect(tabelaValidaPara('rinno', 'mcmv')).toBe('rinno')
    expect(tabelaValidaPara('nid', 'padrao')).toBe('nid')
    expect(tabelaValidaPara('flying', 'mcmv')).toBe('mcmv')
  })
})
