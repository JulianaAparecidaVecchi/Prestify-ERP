
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'
import CategoriaPage from './pages/categorias/CategoriaPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to="/categorias"
              replace
            />
          }
        />

        <Route
          element={<LayoutPrincipal />}
        >
          <Route
            path="/categorias"
            element={<CategoriaPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App