import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LayoutPrincipal from './layouts/LayoutPrincipal'
import CategoriaPage from './pages/categorias/CategoriaPage'
import FormularioCategoria from './pages/categorias/FormularioCategoria'
import ServicoPage from './pages/servicos/ServicoPage'
import ServicoFormularioPage from './pages/servicos/ServicoFormularioPage'
function App() { return <BrowserRouter><Routes><Route path="/" element={<Navigate to="/servicos" replace/>}/><Route element={<LayoutPrincipal/>}><Route path="/categorias" element={<CategoriaPage/>}/><Route path="/categorias/nova" element={<FormularioCategoria modo="criar"/>}/><Route path="/categorias/:id/editar" element={<FormularioCategoria modo="editar"/>}/><Route path="/categorias/:id" element={<FormularioCategoria modo="visualizar"/>}/><Route path="/servicos" element={<ServicoPage/>}/><Route path="/servicos/novo" element={<ServicoFormularioPage modo="criar"/>}/><Route path="/servicos/:id/editar" element={<ServicoFormularioPage modo="editar"/>}/><Route path="/servicos/:id" element={<ServicoFormularioPage modo="visualizar"/>}/></Route></Routes></BrowserRouter> }
export default App
