
import { NavLink } from 'react-router-dom'
import {
  Home,
  CalendarDays,
  Users,
  ClipboardList,
  Package,
  Tags,
  Archive,
  Truck,
  DollarSign,
  Settings,
} from 'lucide-react'

import './BarraLateral.css'

const itensMenu = [
  { nome: 'Início', caminho: '/dashboard', icone: Home },
  { nome: 'Agenda', caminho: '/agenda', icone: CalendarDays },
  { nome: 'Clientes', caminho: '/clientes', icone: Users },
  { nome: 'Serviços', caminho: '/servicos', icone: ClipboardList },
  { nome: 'Categorias', caminho: '/categorias', icone: Tags },
  { nome: 'Produtos', caminho: '/produtos', icone: Package },
  { nome: 'Estoque', caminho: '/estoque', icone: Archive },
  { nome: 'Fornecedores', caminho: '/fornecedores', icone: Truck },
  { nome: 'Financeiro', caminho: '/financeiro', icone: DollarSign },
  { nome: 'Configurações', caminho: '/configuracoes', icone: Settings },
]

function BarraLateral() {
  return (
    <aside className="barra-lateral">
      <div className="barra-lateral__marca">
        <span className="barra-lateral__nome">Prestify</span>
      </div>

      <nav className="barra-lateral__navegacao">
        {itensMenu.map((item) => {
          const Icone = item.icone

          return (
            <NavLink
              key={item.caminho}
              to={item.caminho}
              className={({ isActive }) =>
                `barra-lateral__link ${
                  isActive ? 'barra-lateral__link--ativo' : ''
                }`
              }
            >
              <Icone size={20} strokeWidth={1.8} />
              <span>{item.nome}</span>
            </NavLink>
          )
        })}
      </nav>

      <footer className="barra-lateral__rodape">
        <p>© 2026 - Prestify.</p>
        <p>Todos os direitos reservados.</p>
      </footer>
    </aside>
  )
}

export default BarraLateral