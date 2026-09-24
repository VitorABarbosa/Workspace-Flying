'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Carregando } from './Carregando'
import type { AcaoProposta } from './useProposta'
import {
  EMPRESAS,
  type Emissor,
  empresaDe,
  tabelaPadraoDe,
  tabelaValidaPara,
} from './empresas'
import {
  comDescricao, comPreco, descricaoDe, lerPreco, precoInformadoDe, type ItemEntrada,
} from './itens'
import type { CategoriaMeta, CategoriaOrcada, Estrutura, Fechado, Levantamento } from './types'

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Fallback para respostas antigas do backend sem "_categorias" (as 3 categorias fixas
// de sempre). Assim que o backend emitir "_categorias" (dinâmico, ordenado), é essa
// lista que passa a mandar — inclusive com categorias novas (ex: "filmes").
const CATEGORIAS_FALLBACK: CategoriaMeta[] = [
  { nome: 'externas', rotulo: 'Ilustrações Externas' },
  { nome: 'internas', rotulo: 'Ilustrações Internas' },
  { nome: 'plantas', rotulo: 'Plantas Humanizadas' },
]

const categoriasDe = (orcamento: Fechado['orcamento']): CategoriaMeta[] =>
  orcamento._categorias ?? CATEGORIAS_FALLBACK

const categoriaOrcadaDe = (orcamento: Fechado['orcamento'], nome: string): CategoriaOrcada =>
  (orcamento[nome] as CategoriaOrcada | undefined) ?? { nome, qtd: 0, total: 0, itens: [] }


interface Props {
  levantamento: Levantamento
  onEditar: (estrutura: Estrutura) => void
  carregando: boolean
  acao?: AcaoProposta | null
}

const AJUDA_ESTRATEGIA: Record<Estrutura['estrategia'], string> = {
  auto: 'Usa o histórico do cliente se ele já tiver proposta; senão, a tabela de preços.',
  planilha: 'Preço da tabela oficial da empresa, ignorando o histórico do cliente.',
  historico: 'Repete o preço médio que o cliente pagou no último projeto.',
}

export function PreviewPainel({ levantamento, onEditar, carregando, acao }: Props) {
  const { estrutura, fechado, estrategia_usada, avisos, pendencias } = levantamento
  const reprecificando = carregando && acao === 'reprecificar'
  const empresa = empresaDe(estrutura.emissor)
  const categorias = categoriasDe(fechado.orcamento)
  // Estado do rascunho "novo item" derivado dinamicamente por categoria; chaves ausentes
  // (categoria nova que ainda não foi digitada) caem no fallback '' na leitura.
  const [novoItem, setNovoItem] = useState<Record<string, string>>({})
  // Rascunho local dos campos do cliente; commit no blur/Enter para não
  // reprecificar a cada tecla. Ressincroniza quando o backend responde.
  const [cliente, setCliente] = useState(estrutura.cliente)
  useEffect(() => {
    setCliente(estrutura.cliente)
  }, [estrutura.cliente])

  const commitCliente = () => {
    if (
      cliente.empresa !== estrutura.cliente.empresa ||
      cliente.ref !== estrutura.cliente.ref ||
      cliente.contato !== estrutura.cliente.contato
    ) {
      onEditar({ ...estrutura, cliente })
    }
  }

  // Mesmo padrão de rascunho para desconto (% e rótulo): commit no blur/Enter
  // para evitar POSTs de reprecificação a cada tecla (podem resolver fora de ordem).
  const [descontoPct, setDescontoPct] = useState(String(estrutura.desconto_pct))
  useEffect(() => {
    setDescontoPct(String(estrutura.desconto_pct))
  }, [estrutura.desconto_pct])

  const commitDesconto = () => {
    const pct = parseFloat(descontoPct)
    const valor = Number.isFinite(pct) ? pct : 0
    if (valor !== estrutura.desconto_pct) {
      onEditar({ ...estrutura, desconto_pct: valor })
    }
  }

  const [descontoLabel, setDescontoLabel] = useState(estrutura.desconto_label ?? '')
  useEffect(() => {
    setDescontoLabel(estrutura.desconto_label ?? '')
  }, [estrutura.desconto_label])

  const commitDescontoLabel = () => {
    const valor = descontoLabel.trim()
    if (valor !== (estrutura.desconto_label ?? '')) {
      onEditar({ ...estrutura, desconto_label: valor || null })
    }
  }

  // Valor fechado da proposta inteira: "fechamos por 100 mil". O desconto vira
  // a diferença até esse número, então quem digita aqui manda no percentual
  // acima — é o jeito de escrever o valor que o cliente vai ler.
  const [totalFechado, setTotalFechado] = useState(
    estrutura.total_fechado == null ? '' : String(estrutura.total_fechado)
  )
  useEffect(() => {
    setTotalFechado(estrutura.total_fechado == null ? '' : String(estrutura.total_fechado))
  }, [estrutura.total_fechado])
  const commitTotalFechado = () => {
    const valor = lerPreco(totalFechado)
    if (valor !== (estrutura.total_fechado ?? null)) {
      onEditar({ ...estrutura, total_fechado: valor })
    }
  }

  // Ajuste sobre a planilha e preço por imagem: mesmo rascunho com commit no
  // blur/Enter, porque cada commit reprecifica no backend.
  const [ajustePct, setAjustePct] = useState(String(estrutura.ajuste_planilha_pct ?? 0))
  useEffect(() => {
    setAjustePct(String(estrutura.ajuste_planilha_pct ?? 0))
  }, [estrutura.ajuste_planilha_pct])
  const commitAjuste = () => {
    const n = parseFloat(ajustePct)
    const valor = Number.isFinite(n) ? n : 0
    if (valor !== (estrutura.ajuste_planilha_pct ?? 0)) {
      onEditar({ ...estrutura, ajuste_planilha_pct: valor })
    }
  }

  const [precoImagem, setPrecoImagem] = useState(
    estrutura.preco_por_imagem == null ? '' : String(estrutura.preco_por_imagem)
  )
  useEffect(() => {
    setPrecoImagem(estrutura.preco_por_imagem == null ? '' : String(estrutura.preco_por_imagem))
  }, [estrutura.preco_por_imagem])
  const commitPrecoImagem = () => {
    const n = parseFloat(precoImagem.replace(/\./g, '').replace(',', '.'))
    const valor = precoImagem.trim() === '' || !Number.isFinite(n) ? null : Math.round(n)
    if (valor !== (estrutura.preco_por_imagem ?? null)) {
      onEditar({ ...estrutura, preco_por_imagem: valor })
    }
  }

  // Quantidade de áreas de lazer: o tour virtual é cobrado por ambiente, então
  // este número multiplica o preço de cada etapa. Fica vazio até alguém
  // informar — presumir 1 é o erro que faz a proposta sair sete vezes barata.
  const [ambientes, setAmbientes] = useState(
    estrutura.ambientes == null ? '' : String(estrutura.ambientes)
  )
  useEffect(() => {
    setAmbientes(estrutura.ambientes == null ? '' : String(estrutura.ambientes))
  }, [estrutura.ambientes])
  const commitAmbientes = () => {
    const n = parseInt(ambientes, 10)
    const valor = ambientes.trim() === '' || !Number.isFinite(n) || n < 1 ? null : n
    if (valor !== (estrutura.ambientes ?? null)) {
      onEditar({ ...estrutura, ambientes: valor })
    }
  }

  // Parcelamento: "pagamento em 4x". Vazio mantém o cronograma da empresa,
  // atrelado às etapas de entrega.
  const [parcelas, setParcelas] = useState(
    estrutura.parcelas == null ? '' : String(estrutura.parcelas)
  )
  useEffect(() => {
    setParcelas(estrutura.parcelas == null ? '' : String(estrutura.parcelas))
  }, [estrutura.parcelas])
  const commitParcelas = () => {
    const n = parseInt(parcelas, 10)
    const valor = parcelas.trim() === '' || !Number.isFinite(n) || n < 1 ? null : n
    if (valor !== (estrutura.parcelas ?? null)) onEditar({ ...estrutura, parcelas: valor })
  }

  const ESTRATEGIAS = [
    { valor: 'auto', rotulo: 'Automática' },
    { valor: 'planilha', rotulo: 'Planilha' },
    { valor: 'historico', rotulo: 'Histórico do cliente' },
  ] as const

  const CAMPOS_CLIENTE = [
    { chave: 'empresa', rotulo: 'Cliente', placeholder: 'construtora/incorporadora' },
    { chave: 'ref', rotulo: 'Empreendimento', placeholder: 'nome do projeto' },
    { chave: 'contato', rotulo: 'A/C', placeholder: 'quem recebe a proposta' },
  ] as const

  const listaDe = (cat: string): ItemEntrada[] => (estrutura[cat] as ItemEntrada[] | undefined) ?? []

  const remover = (cat: string, idx: number) =>
    onEditar({ ...estrutura, [cat]: listaDe(cat).filter((_, i) => i !== idx) })

  // Preço fechado de um item: clicar no valor abre o campo; Enter/blur grava,
  // vazio volta ao preço da tabela. É o único jeito de a proposta sair com
  // "institucional de 2:00 por 15.000" sem a tabela mandar 18.000.
  const [editandoPreco, setEditandoPreco] = useState<{ cat: string; idx: number } | null>(null)
  const [precoRascunho, setPrecoRascunho] = useState('')
  const abrirPreco = (cat: string, idx: number, atual: number) => {
    setEditandoPreco({ cat, idx })
    setPrecoRascunho(precoInformadoDe(listaDe(cat)[idx]) == null ? '' : String(atual))
  }
  const commitPreco = () => {
    if (!editandoPreco) return
    const { cat, idx } = editandoPreco
    setEditandoPreco(null)
    const novo = lerPreco(precoRascunho)
    const lista = listaDe(cat)
    if (novo === precoInformadoDe(lista[idx])) return
    onEditar({ ...estrutura, [cat]: lista.map((e, i) => (i === idx ? comPreco(e, novo) : e)) })
  }

  // Descrição do item: mesma ideia do preço — clicar abre o campo. Sem isto,
  // corrigir uma palavra obrigava a remover o item e digitar tudo de novo, e
  // a proposta sai com o texto que o cliente lê.
  const [editandoDesc, setEditandoDesc] = useState<{ cat: string; idx: number } | null>(null)
  const [descRascunho, setDescRascunho] = useState('')
  const abrirDesc = (cat: string, idx: number) => {
    setEditandoDesc({ cat, idx })
    setDescRascunho(descricaoDe(listaDe(cat)[idx]))
  }
  const commitDesc = () => {
    if (!editandoDesc) return
    const { cat, idx } = editandoDesc
    setEditandoDesc(null)
    const nova = descRascunho.trim()
    const lista = listaDe(cat)
    if (!nova || nova === descricaoDe(lista[idx])) return
    onEditar({ ...estrutura, [cat]: lista.map((e, i) => (i === idx ? comDescricao(e, nova) : e)) })
  }

  const adicionar = (cat: string) => {
    const desc = (novoItem[cat] ?? '').trim()
    if (!desc) return
    setNovoItem((s) => ({ ...s, [cat]: '' }))
    onEditar({ ...estrutura, [cat]: [...listaDe(cat), desc] })
  }

  return (
    <div
      aria-busy={carregando}
      className={cn(
        'relative rounded-xl border border-gray-200 bg-[#F1F1F1] p-6 dark:border-gray-700 dark:bg-[#1A1A1A]',
        carregando && 'pointer-events-none'
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A2E] dark:text-white">Preview da proposta</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tudo aqui é editável; cada mudança reprecifica na hora. Nada é gravado até você gerar.
          </p>
        </div>
        {reprecificando && <Carregando acao={acao} />}
      </div>
      <div className={cn('transition-opacity', carregando && 'opacity-60')}>
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {CAMPOS_CLIENTE.map(({ chave, rotulo, placeholder }) => (
          <label key={chave} className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{rotulo}</span>
            <input
              aria-label={rotulo}
              value={cliente[chave]}
              placeholder={placeholder}
              onChange={(e) => setCliente((c) => ({ ...c, [chave]: e.target.value }))}
              onBlur={commitCliente}
              onKeyDown={(e) => e.key === 'Enter' && commitCliente()}
              className="mt-0.5 w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
          </label>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Estratégia
          <select
            aria-label="Estratégia"
            value={estrutura.estrategia}
            onChange={(e) =>
              onEditar({ ...estrutura, estrategia: e.target.value as Estrutura['estrategia'] })
            }
            className="rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          >
            {ESTRATEGIAS.map(({ valor, rotulo }) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        <span className="text-gray-400" title={`Fonte dos preços desta rodada: ${estrategia_usada}`}>
          (usada: {estrategia_usada})
        </span>
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Empresa
          <select
            aria-label="Empresa"
            value={empresa.chave}
            onChange={(e) => {
              // Trocar de empresa troca a tabela junto: tabela que não é da
              // empresa escolhida o backend recusa com 422.
              const emissor = e.target.value as Emissor
              onEditar({ ...estrutura, emissor, tabela_precos: tabelaPadraoDe(emissor) })
            }}
            className="rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          >
            {EMPRESAS.map(({ chave, rotulo }) => (
              <option key={chave} value={chave}>{rotulo}</option>
            ))}
          </select>
        </label>
        {empresa.tabelas.length > 1 && (
          <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            Tabela
            <select
              aria-label="Tabela"
              value={tabelaValidaPara(empresa.chave, estrutura.tabela_precos)}
              onChange={(e) =>
                onEditar({
                  ...estrutura,
                  tabela_precos: e.target.value as Estrutura['tabela_precos'],
                })
              }
              className="rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            >
              {empresa.tabelas.map(({ valor, rotulo }) => (
                <option key={valor} value={valor}>{rotulo}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <p className="-mt-2 mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        {AJUDA_ESTRATEGIA[estrutura.estrategia]}
      </p>

      <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Planilha
          <input
            aria-label="Ajuste sobre a planilha (%)"
            type="number"
            step={1}
            value={ajustePct}
            onChange={(e) => setAjustePct(e.target.value)}
            onBlur={commitAjuste}
            onKeyDown={(e) => e.key === 'Enter' && commitAjuste()}
            className="w-16 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          />
          %
        </label>
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Preço fixo por imagem R$
          <input
            aria-label="Preço fixo por imagem (R$)"
            inputMode="numeric"
            placeholder="ex.: 2400"
            value={precoImagem}
            onChange={(e) => setPrecoImagem(e.target.value)}
            onBlur={commitPrecoImagem}
            onKeyDown={(e) => e.key === 'Enter' && commitPrecoImagem()}
            className="w-24 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          />
        </label>
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Pagamento em
          <input
            aria-label="Parcelamento (nº de vezes)"
            type="number"
            min={1}
            max={24}
            step={1}
            placeholder="ex.: 4"
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
            onBlur={commitParcelas}
            onKeyDown={(e) => e.key === 'Enter' && commitParcelas()}
            className="w-14 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          />
          x
        </label>
        <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          Áreas do empreendimento
          <input
            aria-label="Quantidade de áreas/ambientes"
            type="number"
            min={1}
            step={1}
            placeholder="ex.: 7"
            value={ambientes}
            onChange={(e) => setAmbientes(e.target.value)}
            onBlur={commitAmbientes}
            onKeyDown={(e) => e.key === 'Enter' && commitAmbientes()}
            className="w-16 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-[#1A1A2E] dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
          />
        </label>
        {estrutura.ambientes != null && (
          <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <input
              type="checkbox"
              aria-label="Mostrar a quantidade de áreas na proposta"
              checked={estrutura.mostrar_ambientes !== false}
              onChange={(e) => onEditar({ ...estrutura, mostrar_ambientes: e.target.checked })}
              className="accent-brand-purple"
            />
            mostrar na proposta
          </label>
        )}
      </div>
      <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500">
        Os dois primeiros entram no preço de cada item e não aparecem na proposta.
        &quot;Planilha +10%&quot; é o costume para cliente novo; o preço fixo vale para todas as
        perspectivas e plantas (filme e tecnologia ficam na tabela). As áreas do empreendimento
        multiplicam o tour virtual, que é cobrado por ambiente — e mostrar esse número no
        título da proposta é opcional. &quot;Pagamento em 4x&quot; troca o cronograma da
        empresa por parcelas iguais. Para fechar o valor de um item só, clique no preço dele
        na lista.
      </p>

      {pendencias.length > 0 && (
        <ul className="mb-4 space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
          <li className="text-xs font-semibold text-amber-800 dark:text-amber-200">
            Falta para gerar:
          </li>
          {pendencias.map((p, i) => (
            <li key={i} className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {p}
            </li>
          ))}
        </ul>
      )}

      {categorias.map(({ nome: cat, rotulo }) => {
        const bloco = categoriaOrcadaDe(fechado.orcamento, cat)
        return (
          <div key={cat} className="mb-4">
            <p className="mb-1 text-xs font-semibold uppercase text-brand-purple">
              {rotulo}
            </p>
            {bloco.itens.length === 0 && (
              <p className="text-xs text-gray-400">nenhum item</p>
            )}
            <ul>
              {bloco.itens.map((item, idx) => (
                <li
                  key={`${item.descricao}-${idx}`}
                  className="flex items-center justify-between border-b border-gray-200 py-1 text-sm dark:border-gray-700"
                >
                  {editandoDesc?.cat === cat && editandoDesc.idx === idx ? (
                    <input
                      autoFocus
                      aria-label={`Descrição de ${descricaoDe(listaDe(cat)[idx])}`}
                      value={descRascunho}
                      onChange={(e) => setDescRascunho(e.target.value)}
                      onBlur={commitDesc}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitDesc()
                        if (e.key === 'Escape') setEditandoDesc(null)
                      }}
                      className="mr-2 flex-1 rounded border border-brand-purple bg-white px-1 py-0.5 text-sm text-[#1A1A2E] dark:bg-[#0F0F0F] dark:text-white"
                    />
                  ) : (
                    <button
                      type="button"
                      title="Clique para editar a descrição"
                      onClick={() => abrirDesc(cat, idx)}
                      className="mr-2 flex-1 rounded px-1 text-left text-[#1A1A2E] hover:bg-brand-purple/10 dark:text-white"
                    >
                      {item.descricao}
                    </button>
                  )}
                  <span className="flex items-center gap-2">
                    {editandoPreco?.cat === cat && editandoPreco.idx === idx ? (
                      <input
                        autoFocus
                        aria-label={`Novo preço de ${descricaoDe(listaDe(cat)[idx])}`}
                        inputMode="numeric"
                        placeholder="tabela"
                        value={precoRascunho}
                        onChange={(e) => setPrecoRascunho(e.target.value)}
                        onBlur={commitPreco}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitPreco()
                          if (e.key === 'Escape') setEditandoPreco(null)
                        }}
                        className="w-24 rounded border border-brand-purple bg-white px-1 py-0.5 text-right text-xs text-[#1A1A2E] dark:bg-[#0F0F0F] dark:text-white"
                      />
                    ) : (
                      <button
                        type="button"
                        aria-label={`Preço de ${descricaoDe(listaDe(cat)[idx])}`}
                        title={
                          precoInformadoDe(listaDe(cat)[idx]) == null
                            ? 'Preço da tabela — clique para fechar outro valor'
                            : 'Valor fechado para este item — clique para alterar'
                        }
                        onClick={() => abrirPreco(cat, idx, item.preco)}
                        className={cn(
                          'rounded px-1 font-medium text-[#1A1A2E] hover:bg-brand-purple/10 dark:text-white',
                          precoInformadoDe(listaDe(cat)[idx]) != null &&
                            'underline decoration-brand-purple decoration-dotted underline-offset-2'
                        )}
                      >
                        {brl(item.preco)}
                      </button>
                    )}
                    <button
                      aria-label={`Remover ${descricaoDe(listaDe(cat)[idx])}`}
                      onClick={() => remover(cat, idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex gap-2">
              <input
                value={novoItem[cat] ?? ''}
                onChange={(e) => setNovoItem((s) => ({ ...s, [cat]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && adicionar(cat)}
                placeholder={`adicionar em ${rotulo.toLowerCase()}… (Enter)`}
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
              />
              <button
                aria-label={`Adicionar em ${rotulo}`}
                onClick={() => adicionar(cat)}
                className="text-brand-purple hover:opacity-70"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}

      <div className="mt-4 border-t border-gray-300 pt-3 text-sm dark:border-gray-600">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal ({fechado.orcamento.total_imagens} imagens)</span>
          <span>{brl(fechado.financeiro.subtotal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-2">
            Desconto
            <input
              aria-label="Desconto (%)"
              type="number"
              min={0}
              max={100}
              value={descontoPct}
              onChange={(e) => setDescontoPct(e.target.value)}
              onBlur={commitDesconto}
              onKeyDown={(e) => e.key === 'Enter' && commitDesconto()}
              className="w-16 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
            %
            <input
              aria-label="Rótulo do desconto"
              value={descontoLabel}
              placeholder="rótulo (ex: parceria)"
              onChange={(e) => setDescontoLabel(e.target.value)}
              onBlur={commitDescontoLabel}
              onKeyDown={(e) => e.key === 'Enter' && commitDescontoLabel()}
              className="w-32 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
          </span>
          <span>-{brl(fechado.financeiro.desconto_valor)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-base font-bold text-[#1A1A2E] dark:text-white">
          <span className="flex items-center gap-2">
            Investimento
            <input
              aria-label="Fechar o investimento em (R$)"
              inputMode="numeric"
              placeholder="fechar em R$…"
              value={totalFechado}
              onChange={(e) => setTotalFechado(e.target.value)}
              onBlur={commitTotalFechado}
              onKeyDown={(e) => e.key === 'Enter' && commitTotalFechado()}
              className="w-28 rounded border border-gray-200 bg-white px-1 py-0.5 text-xs font-normal dark:border-gray-700 dark:bg-[#0F0F0F] dark:text-white"
            />
          </span>
          <span className="text-brand-purple">{brl(fechado.financeiro.total)}</span>
        </div>
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
          Tudo aqui é negociável: clique na descrição ou no preço de um item para reescrever, e
          use &quot;fechar em R$&quot; para cravar o valor final — o desconto vira a diferença.
          Deixe vazio para voltar ao desconto por percentual.
        </p>
      </div>

      {avisos.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <li className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Avisos (não impedem de gerar)
          </li>
          {avisos.map((a, i) => (
            <li key={i} className="text-xs text-amber-600 dark:text-amber-400">
              {a}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  )
}
