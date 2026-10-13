import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LayoutPrincipal from './layouts/LayoutPrincipal'

import CategoriaPage from './pages/categorias/CategoriaPage'
import FormularioCategoria from './pages/categorias/FormularioCategoria'

import ServicoPage from './pages/servicos/ServicoPage'
import ServicoFormularioPage from './pages/servicos/ServicoFormularioPage'

import FornecedorPage from './pages/fornecedor/FornecedorPage'
import FornecedorFormularioPage from './pages/fornecedor/FornecedorFormularioPage'

import PaginaEmBreve from './pages/PaginaEmBreve'

import ClientePage from './pages/clientes/ClientePage'
import ClienteFormularioPage from './pages/clientes/ClienteFormularioPage'
import './pages/clientes/ClientePage.css'
import './pages/clientes/ClienteFormularioPage.css'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/servicos" replace />}
                />

                <Route element={<LayoutPrincipal />}>
                    <Route
                        path="/dashboard"
                        element={<PaginaEmBreve titulo="Início" />}
                    />
                    <Route
                        path="/agenda"
                        element={<PaginaEmBreve titulo="Agenda" />}
                    />

                    {/* Categorias */}
                    <Route
                        path="/categorias"
                        element={<CategoriaPage />}
                    />
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

                    {/* Clientes */}
                    <Route
                        path="/clientes"
                        element={<ClientePage />}
                    />
                    <Route
                        path="/clientes/novo"
                        element={<ClienteFormularioPage modo="criar" />}
                    />
                    <Route
                        path="/clientes/:id/editar"
                        element={<ClienteFormularioPage modo="editar" />}
                    />
                    <Route
                        path="/clientes/:id"
                        element={<ClienteFormularioPage modo="visualizar" />}
                    />

                    {/* Serviços */}
                    <Route
                        path="/servicos"
                        element={<ServicoPage />}
                    />
                    <Route
                        path="/servicos/novo"
                        element={<ServicoFormularioPage modo="criar" />}
                    />
                    <Route
                        path="/servicos/:id/editar"
                        element={<ServicoFormularioPage modo="editar" />}
                    />
                    <Route
                        path="/servicos/:id"
                        element={<ServicoFormularioPage modo="visualizar" />}
                    />

                    {/* Demais módulos ainda sem implementação */}
                    <Route
                        path="/produtos"
                        element={<PaginaEmBreve titulo="Produtos" />}
                    />
                    <Route
                        path="/estoque"
                        element={<PaginaEmBreve titulo="Estoque" />}
                    />

                    {/* Fornecedores */}
                    <Route
                        path="/fornecedores"
                        element={<FornecedorPage />}
                    />
                    <Route
                        path="/fornecedores/novo"
                        element={<FornecedorFormularioPage modo="criar" />}
                    />
                    <Route
                        path="/fornecedores/:id/editar"
                        element={<FornecedorFormularioPage modo="editar" />}
                    />
                    <Route
                        path="/fornecedores/:id"
                        element={<FornecedorFormularioPage modo="visualizar" />}
                    />

                    <Route
                        path="/financeiro"
                        element={<PaginaEmBreve titulo="Financeiro" />}
                    />
                    <Route
                        path="/rh"
                        element={<PaginaEmBreve titulo="Recursos Humanos" />}
                    />
                    <Route
                        path="/configuracoes"
                        element={<PaginaEmBreve titulo="Configurações" />}
                    />
                    <Route
                        path="*"
                        element={<PaginaEmBreve titulo="Página não encontrada" />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App