import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'
import CategoriaPage from './pages/categorias/CategoriaPage'
import FormularioCategoria from './pages/categorias/FormularioCategoria'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/categorias" replace />}
        />

        <Route element={<LayoutPrincipal />}>
          {/* Categorias: listar, criar, editar e visualizar */}
          <Route path="/categorias" element={<CategoriaPage />} />

          <Route
            path="/categorias/nova"
            element={<FormularioCategoria modo="criar" />}
          />

          <Route
            path="/categorias/:id/editar"
            element={<FormularioCategoria modo="editar" />}
          />

          <Route
            path="/categorias/:id"
            element={<FormularioCategoria modo="visualizar" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
