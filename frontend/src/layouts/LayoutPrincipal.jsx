
import { Outlet, useLocation } from 'react-router-dom'

import BarraLateral from '../components/layout/BarraLateral'
import Cabecalho from '../components/layout/Cabecalho'

import './LayoutPrincipal.css'

const titulosPaginas = {
  '/dashboard': 'Início',
  '/agenda': 'Agenda',
  '/clientes': 'Clientes',
  '/servicos': 'Serviços',
  '/categorias': 'Categorias',
  '/produtos': 'Produtos',
  '/estoque': 'Estoque',
  '/fornecedores': 'Fornecedores',
  '/financeiro': 'Financeiro',
  '/configuracoes': 'Configurações',
}

function LayoutPrincipal() {
  const localizacao = useLocation()

  const titulo =
    titulosPaginas[localizacao.pathname] || 'Prestify'

  return (
    <div className="layout-principal">
      <BarraLateral />

      <div className="layout-principal__principal">
        <Cabecalho titulo={titulo} />

        <main className="layout-principal__conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LayoutPrincipal