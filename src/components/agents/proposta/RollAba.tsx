'use client'

import { useEffect, useState } from 'react'
import { FileText, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SpinnerBotao } from './Carregando'
import { EMISSOR_PADRAO, type Emissor } from './empresas'
import { RollEntrada } from './RollEntrada'
import { RollHistorico } from './RollHistorico'
import { RollPainel } from './RollPainel'
import { RollResultado } from './RollResultado'
import { semSecoesVazias, totalDeImagens } from './rollSecoes'
import { useRoll } from './useRoll'

/**
 * A aba do roll: ler o que chegou, conferir a lista, gerar a versão seguinte.
 *
 * O roll não é a proposta — não tem preço e muda depois de vendido —, então
 * tem o seu próprio estado e as suas próprias rotas.
 */
export function RollAba() {
  const {
    carregando, acao, erro, roll, gerado, lista,
    ler, gerar, listar, abrir, excluir, reiniciar, editar, limparErro,
  } = useRoll()
  const [emissor, setEmissor] = useState<Emissor>(EMISSOR_PADRAO)

  useEffect(() => {
    listar()
  }, [listar, gerado])

  const semCliente = !(roll?.cliente.empresa ?? '').trim()
  const semItem = !roll?.blocos.some((b) => b.itens.some((i) => i.trim()))

  return (
    <div>
      {erro && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
        >
          <div>
            <p className="font-semibold">Não deu certo</p>
            <p className="mt-0.5 break-words">{erro}</p>
          </div>
          <button onClick={limparErro} aria-label="Fechar erro" className="shrink-0 rounded p-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {gerado ? (
        <RollResultado gerado={gerado} onNovo={reiniciar} />
      ) : roll ? (
        <div>
          <RollPainel roll={roll} onEditar={editar} />
          <button
            onClick={() => gerar(semSecoesVazias(roll), emissor)}
            disabled={carregando || semCliente || semItem}
            className={cn(
              'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg',
              'bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white',
              'hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {acao === 'gerando' ? <SpinnerBotao /> : <FileText className="h-4 w-4" />}
            {acao === 'gerando' ? 'Gerando o roll…' : 'Gerar roll'}
          </button>
          <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            {semCliente
              ? 'Diga de quem é o empreendimento para liberar o botão.'
              : semItem
                ? 'O roll está vazio — acrescente pelo menos um item.'
                : `Grava a versão, escreve o .docx no timbrado e diz o que mudou desde a ` +
                  `anterior. ${totalDeImagens(roll.blocos)} imagens.`}
          </p>
          <button
            onClick={reiniciar}
            className="mt-3 text-xs font-medium text-brand-purple hover:opacity-80"
          >
            Ler outro roll
          </button>
        </div>
      ) : (
        <RollEntrada
          onLer={ler}
          emissor={emissor}
          onEmissor={setEmissor}
          carregando={acao === 'lendo'}
        />
      )}

      <RollHistorico rolls={lista ?? []} onAbrir={abrir} onExcluir={excluir} />
    </div>
  )
}
