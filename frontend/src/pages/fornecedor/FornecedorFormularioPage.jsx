import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserRound, MapPin } from 'lucide-react'

import {
  buscarFornecedor,
  criarFornecedor,
  atualizarFornecedor,
} from '../../api/fornecedorApi'

import './FornecedorFormularioPage.css'

const FORM_VAZIO = {
  tipoPessoa: 'FISICA',
  nome: '',
  cpf: '',
  dataNascimento: '',
  razaoSocial: '',
  cnpj: '',
  email: '',
  telefone: '',
  segmentoAtuacao: '',
  endereco: {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  },
}

function dataParaInput(data) {
  if (!data) return ''
  return String(data).slice(0, 10)
}

function FornecedorFormularioPage({ modo = 'criar' }) {
  const navegar = useNavigate()
  const { id } = useParams()

  const [dados, setDados] = useState(FORM_VAZIO)
  const [carregando, setCarregando] = useState(modo !== 'criar')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const somenteLeitura = modo === 'visualizar'

  useEffect(() => {
    if (modo === 'criar') return

    async function carregar() {
      setCarregando(true)
      setErro('')

      try {
        const fornecedor = await buscarFornecedor(id)

        setDados({
          ...FORM_VAZIO,
          ...fornecedor,
          dataNascimento: dataParaInput(fornecedor.dataNascimento),
          endereco: {
            ...FORM_VAZIO.endereco,
            ...(fornecedor.endereco || {}),
            rua:
              fornecedor.endereco?.rua ??
              fornecedor.endereco?.logradouro ??
              '',
          },
        })
      } catch (e) {
        setErro(e.message || 'Não foi possível carregar o fornecedor.')
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [id, modo])

  function alterarCampo(evento) {
    const { name, value } = evento.target

    setDados((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }

  function alterarEndereco(evento) {
    const { name, value } = evento.target

    setDados((anterior) => ({
      ...anterior,
      endereco: {
        ...anterior.endereco,
        [name]: value,
      },
    }))
  }

  function alterarTipo(tipoPessoa) {
    setDados((anterior) => ({
      ...anterior,
      tipoPessoa,
    }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')

    if (
      dados.tipoPessoa === 'FISICA' &&
      (!dados.nome.trim() || !dados.cpf.trim() || !dados.dataNascimento)
    ) {
      setErro('Preencha o nome, o CPF e a data de nascimento.')
      return
    }

    if (
      dados.tipoPessoa === 'JURIDICA' &&
      (!dados.razaoSocial.trim() || !dados.cnpj.trim())
    ) {
      setErro('Preencha a razão social e o CNPJ.')
      return
    }

    if (!dados.email.trim() || !dados.telefone.trim() ||
        !dados.segmentoAtuacao.trim()) {
      setErro('Preencha o e-mail, o telefone e o segmento de atuação.')
      return
    }

    if (
      !dados.endereco.cep.trim() ||
      !dados.endereco.rua.trim() ||
      !dados.endereco.numero.trim() ||
      !dados.endereco.bairro.trim() ||
      !dados.endereco.cidade.trim() ||
      !dados.endereco.estado.trim()
    ) {
      setErro('Preencha os campos obrigatórios do endereço.')
      return
    }

    const payload = {
      ...dados,
      dataNascimento: dados.tipoPessoa === 'FISICA'
        ? dados.dataNascimento
        : null,
      nome: dados.tipoPessoa === 'FISICA' ? dados.nome.trim() : null,
      cpf: dados.tipoPessoa === 'FISICA' ? dados.cpf : null,
      razaoSocial: dados.tipoPessoa === 'JURIDICA'
        ? dados.razaoSocial.trim()
        : null,
      cnpj: dados.tipoPessoa === 'JURIDICA' ? dados.cnpj : null,
    }

    setSalvando(true)

    try {
      if (modo === 'editar') {
        await atualizarFornecedor(id, payload)
      } else {
        await criarFornecedor(payload)
      }

      navegar('/fornecedores')
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar o fornecedor.')
    } finally {
      setSalvando(false)
    }
  }

  const titulo = modo === 'criar'
    ? 'Cadastro de Fornecedor'
    : modo === 'editar'
      ? 'Edição de Fornecedor'
      : 'Detalhes do Fornecedor'

  if (carregando) {
    return (
      <section className="formulario-fornecedor">
        <p>Carregando fornecedor...</p>
      </section>
    )
  }

  return (
    <section className="formulario-fornecedor">
      <button
        type="button"
        className="formulario-fornecedor__voltar"
        onClick={() => navegar('/fornecedores')}
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <header className="formulario-fornecedor__cabecalho">
        <h1>{titulo}</h1>
        <p>Preencha as informações do fornecedor abaixo.</p>
      </header>

      {erro && (
        <p className="formulario-fornecedor__erro" role="alert">
          {erro}
        </p>
      )}

      <form onSubmit={enviar}>
        <section className="formulario-fornecedor__cartao">
          <h2>
            <span className="formulario-fornecedor__icone">
              <UserRound size={16} />
            </span>
            Informações básicas
          </h2>

          <div className="formulario-fornecedor__tipo">
            <span>Tipo de fornecedor <b>*</b></span>

            <label>
              <input
                type="radio"
                name="tipoPessoa"
                checked={dados.tipoPessoa === 'FISICA'}
                onChange={() => alterarTipo('FISICA')}
                disabled={somenteLeitura || salvando}
              />
              Pessoa física
            </label>

            <label>
              <input
                type="radio"
                name="tipoPessoa"
                checked={dados.tipoPessoa === 'JURIDICA'}
                onChange={() => alterarTipo('JURIDICA')}
                disabled={somenteLeitura || salvando}
              />
              Pessoa jurídica
            </label>
          </div>

          <div className="formulario-fornecedor__grade">
            {dados.tipoPessoa === 'FISICA' ? (
              <>
                <Campo
                  label="Nome"
                  name="nome"
                  value={dados.nome}
                  onChange={alterarCampo}
                  placeholder="Digite o nome completo"
                  required
                  disabled={somenteLeitura || salvando}
                />

                <Campo
                  label="CPF"
                  name="cpf"
                  value={dados.cpf}
                  onChange={alterarCampo}
                  placeholder="000.000.000-00"
                  required
                  disabled={somenteLeitura || salvando}
                />

                <Campo
                  label="Data de nascimento"
                  name="dataNascimento"
                  type="date"
                  value={dados.dataNascimento}
                  onChange={alterarCampo}
                  required
                  disabled={somenteLeitura || salvando}
                />
              </>
            ) : (
              <>
                <Campo
                  label="Razão Social"
                  name="razaoSocial"
                  value={dados.razaoSocial}
                  onChange={alterarCampo}
                  placeholder="Digite a razão social"
                  required
                  disabled={somenteLeitura || salvando}
                />

                <Campo
                  label="CNPJ"
                  name="cnpj"
                  value={dados.cnpj}
                  onChange={alterarCampo}
                  placeholder="00.000.000/0000-00"
                  required
                  disabled={somenteLeitura || salvando}
                />
              </>
            )}

            <Campo
              label="E-mail"
              name="email"
              type="email"
              value={dados.email}
              onChange={alterarCampo}
              placeholder="exemplo@email.com"
              required
              disabled={somenteLeitura || salvando}
            />

            <Campo
              label="Telefone"
              name="telefone"
              type="tel"
              value={dados.telefone}
              onChange={alterarCampo}
              placeholder="(00) 00000-0000"
              required
              disabled={somenteLeitura || salvando}
            />

            <Campo
              label="Segmento de atuação"
              name="segmentoAtuacao"
              value={dados.segmentoAtuacao}
              onChange={alterarCampo}
              placeholder="Digite o segmento"
              required
              disabled={somenteLeitura || salvando}
            />
          </div>
        </section>

        <section className="formulario-fornecedor__cartao formulario-fornecedor__cartao--endereco">
          <h2>
            <span className="formulario-fornecedor__icone">
              <MapPin size={16} />
            </span>
            Endereço
          </h2>

          <div className="formulario-fornecedor__grade-endereco">
            <Campo
              label="CEP"
              name="cep"
              value={dados.endereco.cep}
              onChange={alterarEndereco}
              placeholder="00000-000"
              required
              disabled={somenteLeitura || salvando}
            />

            <Campo
              label="Rua"
              name="rua"
              value={dados.endereco.rua}
              onChange={alterarEndereco}
              placeholder="Digite o nome da rua"
              required
              disabled={somenteLeitura || salvando}
            />

            <Campo
              label="Número"
              name="numero"
              value={dados.endereco.numero}
              onChange={alterarEndereco}
              placeholder="123"
              required
              disabled={somenteLeitura || salvando}
            />

            <Campo
              label="Complemento"
              name="complemento"
              value={dados.endereco.complemento}
              onChange={alterarEndereco}
              placeholder="Apto, casa, bloco..."
              disabled={somenteLeitura || salvando}
            />

            <Campo
              label="Bairro"
              name="bairro"
              value={dados.endereco.bairro}
              onChange={alterarEndereco}
              placeholder="Digite o nome do bairro"
              required
              disabled={somenteLeitura || salvando}
            />

            <Campo
              label="Cidade"
              name="cidade"
              value={dados.endereco.cidade}
              onChange={alterarEndereco}
              placeholder="Digite o nome da cidade"
              required
              disabled={somenteLeitura || salvando}
            />

            <label className="formulario-fornecedor__campo">
              <span>Estado <b>*</b></span>
              <select
                name="estado"
                value={dados.endereco.estado}
                onChange={alterarEndereco}
                required
                disabled={somenteLeitura || salvando}
              >
                <option value="">Selecione o estado</option>
                {[
                  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF',
                  'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
                  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS',
                  'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
                ].map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {!somenteLeitura && (
          <div className="formulario-fornecedor__acoes">
            <button
              className="formulario-fornecedor__submit"
              type="submit"
              disabled={salvando}
            >
              {salvando
                ? 'Salvando...'
                : modo === 'editar'
                  ? 'Salvar alterações'
                  : 'Cadastrar'}
            </button>
          </div>
        )}
      </form>
    </section>
  )
}

function Campo({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
}) {
  return (
    <label className="formulario-fornecedor__campo">
      <span>
        {label} {required && <b>*</b>}
      </span>

      <input
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </label>
  )
}

export default FornecedorFormularioPage