
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Package, DollarSign, AlertTriangle } from 'lucide-react'

import TopoPagina from '../../components/layout/TopoPagina'
import Botao from '../../components/ui/Botao'

import {
  atualizarProdutoEstoque,
  buscarProdutoEstoque,
  cadastrarProdutoEstoque,
} from '../../api/estoqueApi'

import './ProdutoEstoqueFormulario.css'

const estadoInicial = {
  nome: '',
  codigoSku: '',
  precoCusto: '',
  precoVenda: '',
  unidade: 'UN',
  validade: '',
  quantidadeMinima: '',
  quantidadeAtual: '',
  quantidadeParaVenda: '',
  categoriaId: '',
  ativo: true,
}

function ProdutoEstoqueFormulario({ modo = 'criar' }) {
  const { id } = useParams()
  const navegar = useNavigate()

  const [dados, setDados] = useState(estadoInicial)
  const [dadosOriginais, setDadosOriginais] = useState(estadoInicial)
  const [erros, setErros] = useState({})
  const [carregando, setCarregando] = useState(modo === 'editar')
  const [salvando, setSalvando] = useState(false)
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false)

  const quantidadeTotal = Number(dados.quantidadeAtual) || 0
  const quantidadeVenda = Number(dados.quantidadeParaVenda) || 0
  const quantidadeInsumo = Math.max(0, quantidadeTotal - quantidadeVenda)

  const custo = Number(dados.precoCusto)
  const venda = Number(dados.precoVenda)

  const margemLucro =
    dados.precoCusto !== '' &&
    dados.precoVenda !== '' &&
    Number.isFinite(custo) &&
    Number.isFinite(venda) &&
    venda > 0
      ? ((venda - custo) / venda) * 100
      : null

  const alterado = JSON.stringify(dados) !== JSON.stringify(dadosOriginais)

  useEffect(() => {
    if (modo !== 'editar') {
      setDados(estadoInicial)
      setDadosOriginais(estadoInicial)
      setCarregando(false)
      return
    }

    let ativo = true

    setCarregando(true)
    setErros({})

    buscarProdutoEstoque(id)
      .then((produto) => {
        if (!ativo) return

        const preenchido = {
          nome: produto.nome ?? '',
          codigoSku: produto.codigoSku ?? '',
          precoCusto: produto.precoCusto ?? '',
          precoVenda: produto.precoVenda ?? '',
          unidade: produto.unidade || 'UN',
          validade: produto.validade || '',
          quantidadeMinima: produto.quantidadeMinima ?? '',
          quantidadeAtual: produto.quantidadeAtual ?? '',
          quantidadeParaVenda: produto.quantidadeParaVenda ?? '',
          categoriaId: produto.categoriaId ?? '',
          ativo: produto.ativo ?? true,
        }

        setDados(preenchido)
        setDadosOriginais(preenchido)
      })
      .catch((e) => {
        if (ativo) {
          setErros({
            geral: e.message || 'Não foi possível carregar o produto.',
          })
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [id, modo])

  useEffect(() => {
    if (!modalCancelarAberto) return

    function tratarTecla(evento) {
      if (evento.key === 'Escape') {
        setModalCancelarAberto(false)
      }
    }

    window.addEventListener('keydown', tratarTecla)

    return () => {
      window.removeEventListener('keydown', tratarTecla)
    }
  }, [modalCancelarAberto])

  function alterar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))

    setErros((atuais) => ({
      ...atuais,
      [campo]: '',
      geral: '',
    }))
  }

  function validar() {
    const novosErros = {}

    if (!dados.nome.trim()) {
      novosErros.nome = 'Informe o nome do produto.'
    } else if (dados.nome.trim().length > 150) {
      novosErros.nome = 'Use no máximo 150 caracteres.'
    }

    if (dados.codigoSku.trim().length > 80) {
      novosErros.codigoSku = 'Use no máximo 80 caracteres.'
    }

    if (
      dados.precoCusto === '' ||
      !Number.isFinite(Number(dados.precoCusto)) ||
      Number(dados.precoCusto) < 0
    ) {
      novosErros.precoCusto = 'Informe um preço de custo válido.'
    }

    if (
      dados.precoVenda === '' ||
      !Number.isFinite(Number(dados.precoVenda)) ||
      Number(dados.precoVenda) < 0
    ) {
      novosErros.precoVenda = 'Informe um preço de venda válido.'
    }

    const quantidadeMinima =
      dados.quantidadeMinima === '' ? 0 : Number(dados.quantidadeMinima)

    const quantidadeAtual =
      dados.quantidadeAtual === '' ? 0 : Number(dados.quantidadeAtual)

    const quantidadeParaVenda =
      dados.quantidadeParaVenda === ''
        ? 0
        : Number(dados.quantidadeParaVenda)

    if (!Number.isInteger(quantidadeMinima) || quantidadeMinima < 0) {
      novosErros.quantidadeMinima =
        'Informe um número inteiro igual ou maior que zero.'
    }

    if (!Number.isInteger(quantidadeAtual) || quantidadeAtual < 0) {
      novosErros.quantidadeAtual =
        'Informe um número inteiro igual ou maior que zero.'
    }

    if (!Number.isInteger(quantidadeParaVenda) || quantidadeParaVenda < 0) {
      novosErros.quantidadeParaVenda =
        'Informe um número inteiro igual ou maior que zero.'
    } else if (
      Number.isInteger(quantidadeAtual) &&
      quantidadeAtual >= 0 &&
      quantidadeParaVenda > quantidadeAtual
    ) {
      novosErros.quantidadeParaVenda =
        'Não pode superar o estoque total.'
    }

    if (dados.categoriaId !== '') {
      const categoriaId = Number(dados.categoriaId)

      if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
        novosErros.categoriaId = 'Informe um ID válido ou deixe vazio.'
      }
    }

    setErros(novosErros)

    return Object.keys(novosErros).length === 0
  }

  function campoErro(campo) {
    return erros[campo]
      ? 'produto-estoque-form__campo produto-estoque-form__campo--erro'
      : 'produto-estoque-form__campo'
  }

  function cancelar() {
    if (alterado) {
      setModalCancelarAberto(true)
      return
    }

    navegar('/estoque')
  }

  function confirmarCancelamento() {
    setModalCancelarAberto(false)
    navegar('/estoque')
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErros({})

    if (!validar()) {
      requestAnimationFrame(() => {
        document
          .querySelector(
            '.produto-estoque-form__campo--erro input, .produto-estoque-form__campo--erro select'
          )
          ?.focus()
      })

      return
    }

    const payload = {
      nome: dados.nome.trim(),
      codigoSku: dados.codigoSku.trim() || null,
      precoCusto: Number(dados.precoCusto),
      precoVenda: Number(dados.precoVenda),
      unidade: dados.unidade.trim() || 'UN',
      validade: dados.validade || null,
      quantidadeMinima:
        dados.quantidadeMinima === '' ? 0 : Number(dados.quantidadeMinima),
      quantidadeAtual:
        dados.quantidadeAtual === '' ? 0 : Number(dados.quantidadeAtual),
      quantidadeParaVenda:
        dados.quantidadeParaVenda === ''
          ? 0
          : Number(dados.quantidadeParaVenda),
      categoriaId:
        dados.categoriaId === '' ? null : Number(dados.categoriaId),
      ativo: Boolean(dados.ativo),
    }

    setSalvando(true)

    try {
      if (modo === 'editar') {
        await atualizarProdutoEstoque(id, payload)
      } else {
        await cadastrarProdutoEstoque(payload)
      }

      navegar('/estoque', {
        state: {
          mensagem:
            modo === 'editar'
              ? 'Produto atualizado com sucesso.'
              : 'Produto cadastrado com sucesso.',
        },
      })
    } catch (e) {
      setErros({
        geral: e.message || 'Não foi possível salvar o produto.',
      })
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <section className="produto-estoque-form">
        <p>Carregando produto...</p>
      </section>
    )
  }

  return (
    <section className="produto-estoque-form">
      <TopoPagina
        titulo={modo === 'editar' ? 'Editar produto' : 'Novo produto'}
        subtitulo={
          modo === 'editar'
            ? 'Atualize os dados cadastrais do produto.'
            : 'Cadastre um produto para controlar seu estoque.'
        }
      />

      {erros.geral && (
        <p className="produto-estoque-form__erro" role="alert">
          {erros.geral}
        </p>
      )}

      <form
        className="produto-estoque-form__formulario"
        onSubmit={enviar}
        noValidate
      >
        <div className="produto-estoque-form__cartao">
          <h2 className="produto-estoque-form__secao-titulo">
            <span className="produto-estoque-form__icone">
              <Package size={18} />
            </span>
            Informações do produto
          </h2>

          <div className="produto-estoque-form__grade">
            <label className={campoErro('nome')}>
              Nome do produto *
              <input
                value={dados.nome}
                maxLength={150}
                onChange={(e) => alterar('nome', e.target.value)}
                aria-invalid={Boolean(erros.nome)}
                aria-describedby={erros.nome ? 'erro-nome' : undefined}
                placeholder="Ex.: Shampoo profissional"
              />
              {erros.nome && <span id="erro-nome">{erros.nome}</span>}
            </label>

            <label className={campoErro('codigoSku')}>
              SKU / Código
              <input
                value={dados.codigoSku}
                maxLength={80}
                onChange={(e) => alterar('codigoSku', e.target.value)}
                aria-invalid={Boolean(erros.codigoSku)}
                aria-describedby={erros.codigoSku ? 'erro-sku' : undefined}
                placeholder="Ex.: PROD-001"
              />
              {erros.codigoSku && <span id="erro-sku">{erros.codigoSku}</span>}
            </label>

            <label>
              Unidade de medida
              <select
                value={dados.unidade}
                onChange={(e) => alterar('unidade', e.target.value)}
              >
                <option value="UN">Unidade (UN)</option>
                <option value="PC">Peça (PC)</option>
                <option value="KG">Quilograma (KG)</option>
                <option value="G">Grama (G)</option>
                <option value="L">Litro (L)</option>
                <option value="ML">Mililitro (ML)</option>
                <option value="CX">Caixa (CX)</option>
                <option value="PCT">Pacote (PCT)</option>
              </select>
            </label>

            <label className={campoErro('quantidadeMinima')}>
              Quantidade mínima
              <input
                type="number"
                min="0"
                step="1"
                value={dados.quantidadeMinima}
                onChange={(e) =>
                  alterar('quantidadeMinima', e.target.value)
                }
                aria-invalid={Boolean(erros.quantidadeMinima)}
                aria-describedby={
                  erros.quantidadeMinima ? 'erro-minima' : undefined
                }
                placeholder="0"
              />
              {erros.quantidadeMinima && (
                <span id="erro-minima">{erros.quantidadeMinima}</span>
              )}
            </label>

            <label className={campoErro('quantidadeAtual')}>
              {modo === 'editar' ? 'Estoque atual' : 'Quantidade inicial'}
              <input
                type="number"
                min="0"
                step="1"
                value={dados.quantidadeAtual}
                onChange={(e) =>
                  alterar('quantidadeAtual', e.target.value)
                }
                aria-invalid={Boolean(erros.quantidadeAtual)}
                aria-describedby={
                  erros.quantidadeAtual ? 'erro-atual' : undefined
                }
                disabled={modo === 'editar'}
                placeholder="0"
              />
              {erros.quantidadeAtual && (
                <span id="erro-atual">{erros.quantidadeAtual}</span>
              )}
            </label>

            <label>
              Validade
              <input
                type="date"
                value={dados.validade}
                onChange={(e) => alterar('validade', e.target.value)}
              />
            </label>

            <label className={campoErro('quantidadeParaVenda')}>
              Quantidade destinada à venda
              <input
                type="number"
                min="0"
                step="1"
                max={quantidadeTotal}
                value={dados.quantidadeParaVenda}
                onChange={(e) =>
                  alterar('quantidadeParaVenda', e.target.value)
                }
                aria-invalid={Boolean(erros.quantidadeParaVenda)}
                aria-describedby={
                  erros.quantidadeParaVenda ? 'erro-venda-qtd' : undefined
                }
                placeholder="0"
              />
              {erros.quantidadeParaVenda && (
                <span id="erro-venda-qtd">
                  {erros.quantidadeParaVenda}
                </span>
              )}
            </label>

            <label>
              Quantidade destinada a insumos
              <input type="number" value={quantidadeInsumo} readOnly />
            </label>

            <label className={campoErro('categoriaId')}>
              ID da categoria
              <input
                type="number"
                min="1"
                step="1"
                value={dados.categoriaId}
                onChange={(e) => alterar('categoriaId', e.target.value)}
                aria-invalid={Boolean(erros.categoriaId)}
                aria-describedby={
                  erros.categoriaId ? 'erro-categoria' : undefined
                }
                placeholder="Opcional"
              />
              {erros.categoriaId && (
                <span id="erro-categoria">{erros.categoriaId}</span>
              )}
            </label>
          </div>

          <label className="produto-estoque-form__ativo">
            <input
              type="checkbox"
              checked={Boolean(dados.ativo)}
              onChange={(e) => alterar('ativo', e.target.checked)}
            />
            Produto ativo
          </label>

          {modo === 'editar' && (
            <p className="produto-estoque-form__nota">
              Para alterar a quantidade total em estoque, utilize a opção
              de movimentação na tela principal.
            </p>
          )}
        </div>

        <div className="produto-estoque-form__cartao">
          <h2 className="produto-estoque-form__secao-titulo">
            <span className="produto-estoque-form__icone">
              <DollarSign size={18} />
            </span>
            Preços e margem
          </h2>

          <div className="produto-estoque-form__grade produto-estoque-form__grade--preco">
            <label className={campoErro('precoCusto')}>
              Preço de custo (R$) *
              <input
                type="number"
                min="0"
                step="0.01"
                value={dados.precoCusto}
                onChange={(e) => alterar('precoCusto', e.target.value)}
                aria-invalid={Boolean(erros.precoCusto)}
                aria-describedby={
                  erros.precoCusto ? 'erro-preco-custo' : undefined
                }
                placeholder="0,00"
              />
              {erros.precoCusto && (
                <span id="erro-preco-custo">{erros.precoCusto}</span>
              )}
            </label>

            <label className={campoErro('precoVenda')}>
              Preço de venda (R$) *
              <input
                type="number"
                min="0"
                step="0.01"
                value={dados.precoVenda}
                onChange={(e) => alterar('precoVenda', e.target.value)}
                aria-invalid={Boolean(erros.precoVenda)}
                aria-describedby={
                  erros.precoVenda ? 'erro-preco-venda' : undefined
                }
                placeholder="0,00"
              />
              {erros.precoVenda && (
                <span id="erro-preco-venda">{erros.precoVenda}</span>
              )}
            </label>

            <label>
              Margem de lucro
              <input
                value={
                  margemLucro === null
                    ? 'Indisponível'
                    : `${margemLucro.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}%`
                }
                readOnly
              />
            </label>
          </div>
        </div>

        <div className="produto-estoque-form__acoes">
          <Botao
            variante="contorno"
            onClick={cancelar}
            disabled={salvando}
          >
            Cancelar
          </Botao>

          <Botao
            type="submit"
            icone={Save}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar produto'}
          </Botao>
        </div>
      </form>

      {modalCancelarAberto && (
        <div
          className="estoque-modal-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setModalCancelarAberto(false)
            }
          }}
        >
          <div
            className="estoque-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="estoque-modal-titulo"
            aria-describedby="estoque-modal-descricao"
          >
            
            <div className="estoque-modal__cabecalho">
              <div className="estoque-modal__icone">
                <AlertTriangle size={22} />
              </div>

              <h2 id="estoque-modal-titulo">
                Descartar alterações?
              </h2>
            </div>

            <p id="estoque-modal-descricao">
              Você tem alterações que ainda não foram salvas.
              Se sair agora, elas serão perdidas.
            </p>

            <div className="estoque-modal__acoes">
              <button
                type="button"
                className="estoque-modal__botao estoque-modal__botao--secundario"
                onClick={() => setModalCancelarAberto(false)}
                autoFocus
              >
                Voltar ao formulário
              </button>

              <button
                type="button"
                className="estoque-modal__botao estoque-modal__botao--perigo"
                onClick={confirmarCancelamento}
              >
                Descartar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProdutoEstoqueFormulario