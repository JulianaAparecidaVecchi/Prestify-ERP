import { Outlet } from 'react-router-dom'

import BarraLateral from '../components/layout/BarraLateral'
import Cabecalho from '../components/layout/Cabecalho'

import './LayoutPrincipal.css'

// O título de cada tela agora fica dentro da própria página (componente
// TopoPagina), como no design. Por isso o layout não precisa mais saber
// o nome das páginas.
function LayoutPrincipal() {
  return (
    <div className="layout-principal">
      <BarraLateral />

      <div className="layout-principal__principal">
        <Cabecalho />

        <main className="layout-principal__conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LayoutPrincipal
