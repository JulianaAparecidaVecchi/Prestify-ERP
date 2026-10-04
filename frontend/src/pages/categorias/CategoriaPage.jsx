
import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import './CategoriaPage.css'

function CategoriaPage() {
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('TODOS')

  return (
    <section className="categoria-page">
      <div className="categoria-page__toolbar">
        <div className="categoria-page__busca">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar categoria..."
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>

        <div className="categoria-page__acoes">
          <div className="categoria-page__filtro">
            <Filter size={18} />

            <select
              value={tipoFiltro}
              onChange={(evento) => setTipoFiltro(evento.target.value)}
              aria-label="Filtrar por tipo"
            >
              <option value="TODOS">Todos os tipos</option>
              <option value="SERVICO">Serviços</option>
              <option value="PRODUTO">Produtos</option>
            </select>
          </div>

          <button
            type="button"
            className="categoria-page__botao-nova"
          >
            <Plus size={18} />
            Nova categoria
          </button>
        </div>
      </div>

      <div className="categoria-page__tabela-container">
        <table className="categoria-page__tabela">
          <thead>
            <tr>
              <th>Nome da categoria</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="3" className="categoria-page__vazia">
                As categorias cadastradas aparecerão aqui.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default CategoriaPage