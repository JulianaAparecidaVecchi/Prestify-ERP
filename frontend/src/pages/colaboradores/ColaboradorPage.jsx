import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'

import TopoPagina from '../../components/layout/TopoPagina'
import { colaboradorService } from '../../services/colaboradorService'
import { extrairMensagemErro } from '../../services/api'

import './ColaboradorPage.css'

const ORGANIZACAO_ID_TEMPORARIO = 1
const ITENS_POR_PAGINA = 4

function formatarDocumento(colaborador) {
  const documento = colaborador.documento || ''
  const tipo = colaborador.tipoPessoa

  if (tipo === 'FISICA' && documento.length === 11) {
    return documento.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    )
  }

  if (tipo === 'JURIDICA' && documento.length === 14) {
    return documento.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    )
  }

  return documento || '—'
}

function formatarFuncao(funcao) {
  if (!funcao) return 'Colaborador'

  return funcao
    .toLowerCase()
    .split('_')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ')
}

function formatarSalario(salario) {
  if (salario == null) return '—'

  return Number(salario).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function ColaboradorPage() {
  const navegar = useNavigate()

  const [colaboradores, setColaboradores] = useState([])
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(null)

  const carregarColaboradores = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const dados = await colaboradorService.listar(
        ORGANIZACAO_ID_TEMPORARIO
      )

      setColaboradores(Array.isArray(dados) ? dados : [])
    } catch (falha) {
      setErro(extrairMensagemErro(falha))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarColaboradores()
  }, [carregarColaboradores])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return colaboradores.filter((colaborador) => {
      const texto = [
        colaborador.nome,
        colaborador.razaoSocial,
        colaborador.documento,
        colaborador.email,
        colaborador.funcao,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return texto.includes(termo)
    })
  }, [colaboradores, busca])

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / ITENS_POR_PAGINA)
  )

  const paginaAtual = Math.min(pagina, totalPaginas)

  const colaboradoresPagina = filtrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  )

  function alterarBusca(valor) {
    setBusca(valor)
    setPagina(1)
  }

  async function excluirColaborador(colaborador) {
    const nome =
      colaborador.nome || colaborador.razaoSocial || 'este colaborador'

    const confirmar = window.confirm(
      `Deseja realmente excluir ${nome}?`
    )

    if (!confirmar) return

    setExcluindo(colaborador.id)
    setErro('')

    try {
      await colaboradorService.excluir(
        colaborador.id,
        ORGANIZACAO_ID_TEMPORARIO
      )

      setColaboradores((atuais) =>
        atuais.filter((item) => item.id !== colaborador.id)
      )
    } catch (falha) {
      setErro(extrairMensagemErro(falha))
    } finally {
      setExcluindo(null)
    }
  }

  const primeiroResultado =
    filtrados.length === 0
      ? 0
      : (paginaAtual - 1) * ITENS_POR_PAGINA + 1

  const ultimoResultado = Math.min(
    paginaAtual * ITENS_POR_PAGINA,
    filtrados.length
  )

  return (
    <section className="colaborador-page">
      <TopoPagina
        titulo="RH - Colaboradores"
        subtitulo="Visualize e gerencie os colaboradores da empresa."
      />

      <section className="colaborador-page__painel">
        <header className="colaborador-page__painel-cabecalho">
          <div className="colaborador-page__identificacao">
            <div className="colaborador-page__icone">
              <Users size={20} />
            </div>

            <div>
              <h2>Colaboradores</h2>
              <p>Gerencie os colaboradores da organização</p>
            </div>
          </div>

          <div className="colaborador-page__acoes">
            <label className="colaborador-page__busca">
              <Search size={17} />

              <input
                type="search"
                placeholder="Buscar colaborador..."
                value={busca}
                onChange={(evento) =>
                  alterarBusca(evento.target.value)
                }
              />
            </label>

            <button
              type="button"
              className="colaborador-page__adicionar"
              onClick={() => navegar('/rh/novo')}
            >
              <Plus size={18} />
              Adicionar colaborador
            </button>
          </div>
        </header>

        {erro && (
          <div className="colaborador-page__erro" role="alert">
            <span>{erro}</span>

            <button
              type="button"
              onClick={carregarColaboradores}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="colaborador-page__tabela-wrapper">
          <table className="colaborador-page__tabela">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>CPF / CNPJ</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Salário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td
                    colSpan="7"
                    className="colaborador-page__vazio"
                  >
                    Carregando colaboradores...
                  </td>
                </tr>
              ) : colaboradoresPagina.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="colaborador-page__vazio"
                  >
                    {busca
                      ? 'Nenhum colaborador encontrado para essa busca.'
                      : 'Nenhum colaborador cadastrado.'}
                  </td>
                </tr>
              ) : (
                colaboradoresPagina.map((colaborador, indice) => {
                  const nome =
                    colaborador.nome ||
                    colaborador.razaoSocial ||
                    'Sem nome'

                  const ativo = colaborador.status === 'ATIVO'

                  return (
                    <tr key={colaborador.id}>
                      <td>
                        <div className="colaborador-page__pessoa">
                          <div
                            className={`colaborador-page__avatar colaborador-page__avatar--${indice % 5}`}
                          >
                            {nome
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((parte) => parte[0])
                              .join('')
                              .toUpperCase()}
                          </div>

                          <div className="colaborador-page__dados-pessoa">
                            <strong>{nome}</strong>

                            <span>
                              {colaborador.tipoPessoa === 'JURIDICA'
                                ? 'Pessoa jurídica'
                                : 'Pessoa física'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{formatarDocumento(colaborador)}</td>
                      <td>{colaborador.email || '—'}</td>
                      <td>{formatarFuncao(colaborador.funcao)}</td>
                      <td>{formatarSalario(colaborador.salario)}</td>

                      <td>
                        <span
                          className={`colaborador-page__status ${
                            ativo
                              ? 'colaborador-page__status--ativo'
                              : 'colaborador-page__status--inativo'
                          }`}
                        >
                          {ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td>
                        <div className="colaborador-page__botoes">
                          <button
                            type="button"
                            className="colaborador-page__botao colaborador-page__botao--editar"
                            title="Editar colaborador"
                            aria-label={`Editar ${nome}`}
                            onClick={() => navegar(`/rh/${colaborador.id}/editar`)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="colaborador-page__botao colaborador-page__botao--excluir"
                            title="Excluir colaborador"
                            aria-label={`Excluir ${nome}`}
                            disabled={excluindo === colaborador.id}
                            onClick={() =>
                              excluirColaborador(colaborador)
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <footer className="colaborador-page__rodape">
          <span>
            Mostrando {primeiroResultado} a {ultimoResultado} de{' '}
            {filtrados.length} colaboradores
          </span>

          <div className="colaborador-page__paginacao">
            <button
              type="button"
              aria-label="Página anterior"
              disabled={paginaAtual <= 1}
              onClick={() =>
                setPagina((atual) => atual - 1)
              }
            >
              <ChevronLeft size={18} />
            </button>

            <span>{paginaAtual}</span>

            <button
              type="button"
              aria-label="Próxima página"
              disabled={paginaAtual >= totalPaginas}
              onClick={() =>
                setPagina((atual) => atual + 1)
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </section>
    </section>
  )
}

export default ColaboradorPage