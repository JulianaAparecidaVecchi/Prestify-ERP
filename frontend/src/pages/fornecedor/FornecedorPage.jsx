import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Power,
} from 'lucide-react'

import {
  listarFornecedores,
  inativarFornecedor,
  reativarFornecedor,
} from '../../api/fornecedorApi'

import TopoPagina from '../../components/layout/TopoPagina'
import './FornecedorPage.css'

function FornecedorPage() {
  const navegar = useNavigate()

  const [fornecedores, setFornecedores] = useState([])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [alterandoStatus, setAlterandoStatus] = useState(null)

  const carregarFornecedores = useCallback(async () => {
    setCarregando(true)
    setErro('')

    try {
      const dados = await listarFornecedores()
      setFornecedores(Array.isArray(dados) ? dados : [])
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar os fornecedores.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarFornecedores()
  }, [carregarFornecedores])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return fornecedores.filter((f) => {
      const nome = f.tipoPessoa === 'FISICA'
        ? f.nome
        : f.razaoSocial

      const documento = f.tipoPessoa === 'FISICA'
        ? f.cpf
        : f.cnpj

      const correspondeBusca = [
        nome,
        documento,
        f.email,
        f.telefone,
        f.segmentoAtuacao,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(termo)

      const ativo = f.ativo !== false

      const correspondeStatus =
        filtroStatus === 'TODOS' ||
        (filtroStatus === 'ATIVOS' && ativo) ||
        (filtroStatus === 'INATIVOS' && !ativo)

      return correspondeBusca && correspondeStatus
    })
  }, [fornecedores, busca, filtroStatus])

  async function alterarStatus(fornecedor) {
    const ativo = fornecedor.ativo !== false
    const nome = fornecedor.tipoPessoa === 'FISICA'
      ? fornecedor.nome
      : fornecedor.razaoSocial

    const mensagem = ativo
      ? `Deseja inativar o fornecedor "${nome}"?`
      : `Deseja reativar o fornecedor "${nome}"?`

    if (!window.confirm(mensagem)) return

    setAlterandoStatus(fornecedor.id)

    try {
      if (ativo) {
        await inativarFornecedor(fornecedor.id)
      } else {
        await reativarFornecedor(fornecedor.id)
      }

      await carregarFornecedores()
    } catch (e) {
      setErro(e.message || 'Não foi possível alterar o status.')
    } finally {
      setAlterandoStatus(null)
    }
  }

  function nomeFornecedor(f) {
    return f.tipoPessoa === 'FISICA'
      ? f.nome || '—'
      : f.razaoSocial || '—'
  }

  function documentoFornecedor(f) {
    return f.tipoPessoa === 'FISICA'
      ? f.cpf || '—'
      : f.cnpj || '—'
  }

  return (
    <section className="pagina-fornecedor">
      <TopoPagina
        titulo="Fornecedores"
        subtitulo="Visualize as informações sobre os fornecedores abaixo."
      />

      <div className="pagina-fornecedor__barra">
        <label className="pagina-fornecedor__busca">
          <Search size={18} />

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar fornecedor..."
          />
        </label>

        <label className="pagina-fornecedor__filtro">
          <SlidersHorizontal size={17} />

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            aria-label="Filtrar fornecedores por status"
          >
            <option value="TODOS">Todos</option>
            <option value="ATIVOS">Ativos</option>
            <option value="INATIVOS">Inativos</option>
          </select>
        </label>

        <button
          className="pagina-fornecedor__novo"
          onClick={() => navegar('/fornecedores/novo')}
        >
          <Plus size={19} />
          Novo Fornecedor
        </button>
      </div>

      {erro && (
        <div className="pagina-fornecedor__erro" role="alert">
          {erro}
          <button onClick={carregarFornecedores}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="pagina-fornecedor__tabela-container">
        <table className="pagina-fornecedor__tabela">
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Documento</th>
              <th>Contato</th>
              <th>Telefone</th>
              <th>Segmento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="7" className="pagina-fornecedor__aviso">
                  Carregando fornecedores...
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="pagina-fornecedor__aviso">
                  {fornecedores.length
                    ? 'Nenhum fornecedor encontrado.'
                    : 'Nenhum fornecedor cadastrado ainda.'}
                </td>
              </tr>
            ) : (
              filtrados.map((f) => {
                const ativo = f.ativo !== false

                return (
                  <tr key={f.id}>
                    <td>{nomeFornecedor(f)}</td>
                    <td>{documentoFornecedor(f)}</td>
                    <td>{f.email || '—'}</td>
                    <td>{f.telefone || '—'}</td>
                    <td>{f.segmentoAtuacao || '—'}</td>

                    <td>
                      <span
                        className={
                          `pagina-fornecedor__status ${
                            ativo
                              ? 'pagina-fornecedor__status--ativo'
                              : 'pagina-fornecedor__status--inativo'
                          }`
                        }
                      >
                        {ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td>
                      <div className="pagina-fornecedor__acoes">
                        <button
                          className="pagina-fornecedor__acao pagina-fornecedor__acao--visualizar"
                          title="Visualizar"
                          onClick={() => navegar(`/fornecedores/${f.id}`)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          className="pagina-fornecedor__acao pagina-fornecedor__acao--editar"
                          title="Editar"
                          onClick={() => navegar(`/fornecedores/${f.id}/editar`)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          className="pagina-fornecedor__acao pagina-fornecedor__acao--status"
                          title={ativo ? 'Inativar' : 'Reativar'}
                          disabled={alterandoStatus === f.id}
                          onClick={() => alterarStatus(f)}
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        <div className="pagina-fornecedor__rodape">
          Mostrando {filtrados.length} de {fornecedores.length} fornecedores
        </div>
      </div>
    </section>
  )
}

export default FornecedorPage