import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, FileText, Pencil } from 'lucide-react'

import {
  atualizarCategoria,
  buscarCategoria,
  criarCategoria,
} from '../../api/categoriaApi'
import Botao from '../../components/ui/Botao'
import CampoFormulario from '../../components/ui/CampoFormulario'
import CartaoFormulario from '../../components/ui/CartaoFormulario'
import TopoPagina from '../../components/layout/TopoPagina'
import './FormularioCategoria.css'

const opcoesTipo = [
  { valor: 'SERVICO', rotulo: 'Serviço' },
  { valor: 'PRODUTO', rotulo: 'Produto' },
]

// Textos de cada modo da tela
const textosModo = {
  criar: {
    titulo: 'Cadastro de Categoria',
    subtitulo: 'Preencha as informações da nova categoria abaixo',
  },
  editar: {
    titulo: 'Edição de Categoria',
    subtitulo: 'Altere as informações da categoria abaixo',
  },
  visualizar: {
    titulo: 'Detalhes da Categoria',
    subtitulo: 'Veja as informações da categoria abaixo',
  },
}

const valoresIniciais = { nome: '', tipo: '', descricao: '' }

/*
  Um único formulário para as três situações:
    modo="criar"       -> campos vazios, botão "Cadastrar"
    modo="editar"      -> carrega a categoria, botão "Salvar alterações"
    modo="visualizar"  -> carrega a categoria, campos só para leitura
*/
function FormularioCategoria({ modo = 'criar' }) {
  const { id } = useParams()
  const navegar = useNavigate()

  const somenteLeitura = modo === 'visualizar'

  const [valores, setValores] = useState(valoresIniciais)
  const [erros, setErros] = useState({})
  const [carregando, setCarregando] = useState(modo !== 'criar')
  const [salvando, setSalvando] = useState(false)
  const [erroGeral, setErroGeral] = useState('')

  // Em editar/visualizar, busca a categoria no backend
  useEffect(() => {
    if (modo === 'criar') return undefined

    let ativo = true

    buscarCategoria(id)
      .then((categoria) => {
        if (!ativo) return

        setValores({
          nome: categoria.nome ?? '',
          tipo: categoria.tipo ?? '',
          descricao: categoria.descricao ?? '',
        })
      })
      .catch((falha) => {
        if (ativo) setErroGeral(falha.message)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    // Evita atualizar a tela se o usuário saiu antes da resposta chegar
    return () => {
      ativo = false
    }
  }, [modo, id])

  function alterarCampo(evento) {
    const { name, value } = evento.target

    setValores((anteriores) => ({ ...anteriores, [name]: value }))
    setErros((anteriores) => ({ ...anteriores, [name]: '' }))
  }

  function validar() {
    const novosErros = {}

    if (!valores.nome.trim()) {
      novosErros.nome = 'Informe o nome da categoria.'
    }

    if (!valores.tipo) {
      novosErros.tipo = 'Selecione o tipo.'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErroGeral('')

    if (!validar()) return

    const dados = {
      nome: valores.nome.trim(),
      tipo: valores.tipo,
      descricao: valores.descricao.trim(),
    }

    setSalvando(true)

    try {
      if (modo === 'editar') {
        await atualizarCategoria(id, dados)
      } else {
        await criarCategoria(dados)
      }

      navegar('/categorias')
    } catch (falha) {
      setErroGeral(falha.message)
      setSalvando(false)
    }
  }

  const { titulo, subtitulo } = textosModo[modo]

  return (
    <section className="formulario-categoria">
      <TopoPagina titulo={titulo} subtitulo={subtitulo} />

      {carregando ? (
        <p className="formulario-categoria__aviso">Carregando categoria...</p>
      ) : (
        <form onSubmit={enviar} noValidate>
          {erroGeral && (
            <p className="formulario-categoria__erro" role="alert">
              {erroGeral}
            </p>
          )}

          <CartaoFormulario titulo="Informações básicas" icone={FileText}>
            <CampoFormulario
              className="campo-formulario--duas-colunas"
              rotulo="Nome da categoria"
              obrigatorio
              name="nome"
              placeholder="Digite o nome da categoria"
              value={valores.nome}
              onChange={alterarCampo}
              erro={erros.nome}
              disabled={somenteLeitura}
            />

            <CampoFormulario
              tipo="selecao"
              rotulo="Tipo"
              obrigatorio
              name="tipo"
              placeholder="Selecione o tipo"
              opcoes={opcoesTipo}
              value={valores.tipo}
              onChange={alterarCampo}
              erro={erros.tipo}
              disabled={somenteLeitura}
            />

            <CampoFormulario
              className="campo-formulario--linha-inteira"
              tipo="areaTexto"
              rotulo="Descrição"
              opcional
              name="descricao"
              placeholder="Descreva a categoria, o que ela agrupa, observações importantes"
              value={valores.descricao}
              onChange={alterarCampo}
              disabled={somenteLeitura}
            />
          </CartaoFormulario>

          <div className="formulario-categoria__acoes">
            {modo === 'criar' && (
              <Botao type="submit" disabled={salvando}>
                {salvando ? 'Cadastrando...' : 'Cadastrar'}
              </Botao>
            )}

            {modo === 'editar' && (
              <>
                <Botao
                  variante="cinza"
                  onClick={() => navegar('/categorias')}
                  disabled={salvando}
                >
                  Cancelar
                </Botao>

                <Botao type="submit" icone={Check} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar alterações'}
                </Botao>
              </>
            )}

            {somenteLeitura && (
              <Botao
                variante="contorno"
                icone={Pencil}
                onClick={() => navegar(`/categorias/${id}/editar`)}
              >
                Editar categoria
              </Botao>
            )}
          </div>
        </form>
      )}
    </section>
  )
}

export default FormularioCategoria
