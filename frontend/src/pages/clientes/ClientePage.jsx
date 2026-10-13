import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Pencil,
    Plus,
    Power,
    Search,
    SlidersHorizontal,
} from 'lucide-react'

import {
    listarClientes,
    alterarStatusCliente,
    exportarClientesCsv,
    exportarClientesPdf,
} from '../../api/clienteApi'

import Botao from '../../components/ui/Botao'
import ModalConfirmacao from '../../components/ui/ModalConfirmacao'
import TopoPagina from '../../components/layout/TopoPagina'

const ESTADOS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
const TAMANHO = 5

function enderecoCliente(endereco) {
    if (!endereco) return 'Não informado'

    return [
        [endereco.logradouro, endereco.numero].filter(Boolean).join(', '),
        endereco.complemento,
        endereco.bairro,
        [endereco.cidade, endereco.estado].filter(Boolean).join(' / '),
    ].filter(Boolean).join(' • ')
}

function ClientePage() {
    const navegar = useNavigate()
    const [busca, setBusca] = useState('')
    const [filtros, setFiltros] = useState({
        busca: '',
        tipoPessoa: '',
        ativo: '',
        estado: '',
    })
    const [mostrarFiltros, setMostrarFiltros] = useState(false)
    const [pagina, setPagina] = useState(0)
    const [clientes, setClientes] = useState([])
    const [total, setTotal] = useState(0)
    const [totalPaginas, setTotalPaginas] = useState(0)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [revisao, setRevisao] = useState(0)
    const [selecionado, setSelecionado] = useState(null)
    const [alterando, setAlterando] = useState(false)
    const [erroStatus, setErroStatus] = useState('')
    const [exportando, setExportando] = useState('')

    useEffect(() => {
        let vigente = true

        setCarregando(true)
        setErro('')

        async function carregar() {
            try {
                const dados = await listarClientes({
                    ...filtros,
                    pagina,
                    tamanho: TAMANHO,
                })

                if (!vigente) return

                // Uma alteração de status pode esvaziar a última página filtrada.
                if (pagina > 0 && pagina >= dados.page.totalPages) {
                    setPagina(Math.max(0, dados.page.totalPages - 1))
                    return
                }

                setClientes(dados.content)
                setTotal(dados.page.totalElements)
                setTotalPaginas(dados.page.totalPages)
            } catch (falha) {
                if (vigente) {
                    setClientes([])
                    setTotal(0)
                    setTotalPaginas(0)
                    setErro(
                        falha.message || 'Não foi possível carregar os clientes.'
                    )
                }
            } finally {
                if (vigente) setCarregando(false)
            }
        }

        carregar()

        return () => {
            vigente = false
        }
    }, [filtros, pagina, revisao])

    function pesquisar(evento) {
        evento.preventDefault()
        setPagina(0)
        setFiltros((atual) => ({ ...atual, busca: busca.trim() }))
    }

    function filtrar(campo, valor) {
        setPagina(0)
        setFiltros((atual) => ({ ...atual, [campo]: valor }))
    }

    async function confirmarStatus() {
        if (!selecionado || alterando) return

        setAlterando(true)
        setErroStatus('')
        setSucesso('')

        try {
            await alterarStatusCliente(selecionado.id, !selecionado.ativo)

            setSucesso(
                `Cliente ${selecionado.ativo ? 'desativado' : 'ativado'} com sucesso.`
            )

            setSelecionado(null)
            setRevisao((atual) => atual + 1)
        } catch (falha) {
            setErroStatus(falha.message || 'Não foi possível alterar o status.')
        } finally {
            setAlterando(false)
        }
    }

    async function exportar(formato) {
        if (exportando) return

        setExportando(formato)
        setSucesso('')
        setErro('')

        try {
            const baixar = formato === 'csv'
                ? exportarClientesCsv
                : exportarClientesPdf

            await baixar(filtros)
            setSucesso('Download solicitado com sucesso.')
        } catch (falha) {
            setErro(falha.message || 'Não foi possível exportar os clientes.')
        } finally {
            setExportando('')
        }
    }

    return (
        <section className="pagina-cliente">
            <TopoPagina
                titulo="Clientes"
                subtitulo="Consulte e gerencie os clientes da sua empresa."
            />

            <div className="pagina-cliente__barra">
                <form className="pagina-cliente__busca" onSubmit={pesquisar}>
                    <Search size={18} />

                    <input
                        aria-label="Buscar por nome, CPF, CNPJ ou e-mail"
                        placeholder="Buscar por nome, CPF, CNPJ ou e-mail..."
                        value={busca}
                        maxLength={150}
                        onChange={(evento) => setBusca(evento.target.value)}
                    />

                    <Botao type="submit" variante="contorno">
                        Buscar
                    </Botao>
                </form>

                <Botao
                    variante="contorno"
                    icone={SlidersHorizontal}
                    aria-expanded={mostrarFiltros}
                    aria-controls="filtros-clientes"
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                >
                    Filtros
                </Botao>

                <Botao
                    icone={Plus}
                    onClick={() => navegar('/clientes/novo')}
                >
                    Novo Cliente
                </Botao>
            </div>

            {mostrarFiltros && (
                <div id="filtros-clientes" className="pagina-cliente__filtros">
                    <label>
                        Tipo de cliente

                        <select
                            value={filtros.tipoPessoa}
                            onChange={(evento) =>
                                filtrar('tipoPessoa', evento.target.value)
                            }
                        >
                            <option value="">Todos</option>
                            <option value="FISICA">Pessoa Física</option>
                            <option value="JURIDICA">Pessoa Jurídica</option>
                        </select>
                    </label>

                    <label>
                        Status

                        <select
                            value={filtros.ativo}
                            onChange={(evento) =>
                                filtrar('ativo', evento.target.value)
                            }
                        >
                            <option value="">Todos</option>
                            <option value="true">Ativos</option>
                            <option value="false">Inativos</option>
                        </select>
                    </label>

                    <label>
                        Estado

                        <select
                            value={filtros.estado}
                            onChange={(evento) =>
                                filtrar('estado', evento.target.value)
                            }
                        >
                            <option value="">Todos</option>

                            {ESTADOS.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                    </label>

                    <Botao
                        variante="cinza"
                        onClick={() => {
                            setBusca('')
                            setPagina(0)
                            setFiltros({
                                busca: '',
                                tipoPessoa: '',
                                ativo: '',
                                estado: '',
                            })
                        }}
                    >
                        Limpar filtros
                    </Botao>
                </div>
            )}

            {sucesso && (
                <p className="pagina-cliente__sucesso" role="status">
                    {sucesso}
                </p>
            )}

            {erro && (
                <div className="pagina-cliente__erro" role="alert">
                    <p>{erro}</p>

                    <Botao
                        variante="contorno"
                        onClick={() => setRevisao((atual) => atual + 1)}
                    >
                        Recarregar listagem
                    </Botao>
                </div>
            )}

            <div
                className="pagina-cliente__tabela-container"
                aria-busy={carregando}
            >
                <table className="pagina-cliente__tabela">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Telefone</th>
                            <th>E-mail</th>
                            <th>Endereço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {carregando ? (
                            <tr>
                                <td colSpan={5} className="pagina-cliente__aviso">
                                    Carregando clientes...
                                </td>
                            </tr>
                        ) : clientes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="pagina-cliente__aviso">
                                    {erro
                                        ? 'Não foi possível carregar a listagem.'
                                        : 'Nenhum cliente encontrado.'}
                                </td>
                            </tr>
                        ) : clientes.map((cliente) => (
                            <tr key={cliente.id}>
                                <td>
                                    <strong>{cliente.nome}</strong>

                                    <span className="pagina-cliente__documento">
                                        {cliente.tipoPessoa === 'FISICA' ? 'PF' : 'PJ'}
                                        {' • '}
                                        {cliente.cpf || cliente.cnpj}
                                    </span>

                                    <span
                                        className={`pagina-cliente__status pagina-cliente__status--${cliente.ativo ? 'ativo' : 'inativo'}`}
                                    >
                                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>

                                <td>{cliente.telefone}</td>
                                <td>{cliente.email}</td>
                                <td>{enderecoCliente(cliente.endereco)}</td>

                                <td>
                                    <div className="pagina-cliente__acoes">
                                        <button
                                            type="button"
                                            title="Consultar"
                                            aria-label={`Consultar ${cliente.nome}`}
                                            onClick={() =>
                                                navegar(`/clientes/${cliente.id}`)
                                            }
                                        >
                                            <Eye size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            title="Editar"
                                            aria-label={`Editar ${cliente.nome}`}
                                            onClick={() =>
                                                navegar(`/clientes/${cliente.id}/editar`)
                                            }
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            title={cliente.ativo ? 'Desativar' : 'Ativar'}
                                            aria-label={`${cliente.ativo ? 'Desativar' : 'Ativar'} ${cliente.nome}`}
                                            disabled={alterando}
                                            onClick={() => {
                                                setErroStatus('')
                                                setSelecionado(cliente)
                                            }}
                                        >
                                            <Power size={17} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagina-cliente__rodape">
                <span>
                    {carregando
                        ? 'Carregando...'
                        : `Mostrando ${total === 0 ? 0 : pagina * TAMANHO + 1} a ${Math.min((pagina + 1) * TAMANHO, total)} de ${total} clientes`}
                </span>

                <div className="pagina-cliente__paginacao">
                    <Botao
                        variante="contorno"
                        icone={ChevronLeft}
                        aria-label="Página anterior"
                        disabled={carregando || pagina === 0}
                        onClick={() => setPagina(pagina - 1)}
                    >
                        Anterior
                    </Botao>

                    <span>
                        Página {pagina + 1} de {Math.max(1, totalPaginas)}
                    </span>

                    <Botao
                        variante="contorno"
                        icone={ChevronRight}
                        aria-label="Próxima página"
                        disabled={carregando || pagina + 1 >= totalPaginas}
                        onClick={() => setPagina(pagina + 1)}
                    >
                        Próxima
                    </Botao>
                </div>
            </div>

            <div className="pagina-cliente__exportacoes">
                <Botao
                    variante="contorno"
                    icone={Download}
                    disabled={Boolean(exportando)}
                    onClick={() => exportar('csv')}
                >
                    {exportando === 'csv' ? 'Exportando...' : 'Exportar CSV'}
                </Botao>

                <Botao
                    variante="contorno"
                    icone={Download}
                    disabled={Boolean(exportando)}
                    onClick={() => exportar('pdf')}
                >
                    {exportando === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
                </Botao>
            </div>

            <ModalConfirmacao
                aberto={Boolean(selecionado)}
                titulo={selecionado?.ativo ? 'Desativar cliente' : 'Ativar cliente'}
                mensagem={selecionado
                    ? `Deseja ${selecionado.ativo ? 'desativar' : 'ativar'} o cliente "${selecionado.nome}"?`
                    : ''}
                textoConfirmar={selecionado?.ativo ? 'Desativar' : 'Ativar'}
                carregando={alterando}
                erro={erroStatus}
                onConfirmar={confirmarStatus}
                onCancelar={() => {
                    if (!alterando) {
                        setSelecionado(null)
                        setErroStatus('')
                    }
                }}
            />
        </section>
    )
}

export default ClientePage