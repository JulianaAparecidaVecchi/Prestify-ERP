import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, MapPin, UserRound } from 'lucide-react'

import { colaboradorService } from '../../services/colaboradorService'
import { extrairMensagemErro } from '../../services/api'

import './ColaboradorCadastroPage.css'

// TODO: trocar pela organização do usuário logado quando o login existir.
const ORGANIZACAO_ID_TEMPORARIO = 1

const FUNCOES = [
  { valor: 'ADMINISTRADOR', rotulo: 'Administrador' },
  { valor: 'ANALISTA_RH', rotulo: 'Analista de RH' },
  { valor: 'ANALISTA_FINANCEIRO', rotulo: 'Analista Financeiro' },
  { valor: 'ESTOQUISTA', rotulo: 'Estoquista' },
  { valor: 'COMERCIAL', rotulo: 'Comercial' },
  { valor: 'GERENTE_SUPRIMENTOS', rotulo: 'Gerente de Suprimentos' },
  { valor: 'VENDEDOR', rotulo: 'Vendedor' },
  { valor: 'PRESTADOR_SERVICO', rotulo: 'Prestador de Serviço' },
]

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const FORMULARIO_INICIAL = {
  tipoPessoa: 'PF',
  nome: '',
  razaoSocial: '',
  documento: '',
  dataNascimento: '',
  dataAdmissao: '',
  dataAbertura: '',
  genero: 'FEMININO',
  email: '',
  telefone: '',
  senha: '',
  funcao: '',
  salario: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
}

const soDigitos = (valor) => valor.replace(/\D/g, '')

function formatarCpf(valor) {
  return soDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatarCnpj(valor) {
  return soDigitos(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatarTelefone(valor) {
  const d = soDigitos(valor).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function formatarCep(valor) {
  const d = soDigitos(valor).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

function validar(form) {
  const erros = {}
  const ehPF = form.tipoPessoa === 'PF'

  if (!form.nome.trim()) {
    erros.nome = ehPF ? 'Informe o nome completo.' : 'Informe o nome fantasia.'
  }

  if (soDigitos(form.documento).length !== (ehPF ? 11 : 14)) {
    erros.documento = ehPF ? 'CPF deve ter 11 dígitos.' : 'CNPJ deve ter 14 dígitos.'
  }

  if (ehPF) {
    if (!form.dataNascimento) erros.dataNascimento = 'Informe a data de nascimento.'
    if (!form.dataAdmissao) erros.dataAdmissao = 'Informe a data de admissão.'
  } else {
    if (!form.razaoSocial.trim()) erros.razaoSocial = 'Informe a razão social.'
    if (!form.dataAbertura) erros.dataAbertura = 'Informe a data de criação.'
  }

  if (!form.email.trim()) erros.email = 'Informe o e-mail.'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) erros.email = 'E-mail inválido.'

  const digitosTelefone = soDigitos(form.telefone).length
  if (digitosTelefone < 10 || digitosTelefone > 11) erros.telefone = 'Informe DDD + número.'

  if (form.senha.length < 8) erros.senha = 'A senha deve ter ao menos 8 caracteres.'

  if (!form.funcao) erros.funcao = 'Selecione a função.'

  if (form.salario === '' || Number(form.salario) < 0) erros.salario = 'Informe o salário.'

  if (soDigitos(form.cep).length !== 8) erros.cep = 'CEP deve ter 8 dígitos.'
  if (!form.logradouro.trim()) erros.logradouro = 'Informe a rua.'
  if (!form.numero.trim()) erros.numero = 'Informe o número.'
  if (!form.bairro.trim()) erros.bairro = 'Informe o bairro.'
  if (!form.cidade.trim()) erros.cidade = 'Informe a cidade.'
  if (!form.estado) erros.estado = 'Selecione o estado.'

  return erros
}

function montarPayload(form) {
  const ehPF = form.tipoPessoa === 'PF'
  const documento = soDigitos(form.documento)

  return {
    tipoPessoa: form.tipoPessoa,
    nome: form.nome.trim(),
    razaoSocial: ehPF ? null : form.razaoSocial.trim(),
    cpf: ehPF ? documento : null,
    cnpj: ehPF ? null : documento,
    dataNascimento: ehPF ? form.dataNascimento : null,
    dataAdmissao: ehPF ? form.dataAdmissao : null,
    dataAbertura: ehPF ? null : form.dataAbertura,
    genero: ehPF ? form.genero : null,
    email: form.email.trim(),
    telefone: soDigitos(form.telefone),
    senha: form.senha,
    funcao: form.funcao,
    salario: Number(form.salario),
    endereco: {
      cep: soDigitos(form.cep),
      logradouro: form.logradouro.trim(),
      numero: form.numero.trim(),
      complemento: form.complemento.trim() || null,
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      estado: form.estado,
    },
  }
}

function Campo({ id, rotulo, obrigatorio = true, erro, children }) {
  return (
    <div className="colaborador-cadastro__campo">
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="colaborador-cadastro__obrigatorio"> *</span>}
      </label>
      {children}
      {erro && <span className="colaborador-cadastro__erro">{erro}</span>}
    </div>
  )
}

function ColaboradorCadastroPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(FORMULARIO_INICIAL)
  const [erros, setErros] = useState({})
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  const ehPF = form.tipoPessoa === 'PF'

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  function trocarTipo(tipo) {
    setForm((atual) => ({
      ...atual,
      tipoPessoa: tipo,
      nome: '',
      documento: '',
    }))
    setErros({})
  }

  // Preenche rua/bairro/cidade/estado pelo CEP. Se a consulta falhar,
  // o usuário simplesmente digita o endereço na mão.
  async function buscarCep(valorCep) {
    const cep = soDigitos(valorCep)
    if (cep.length !== 8) return

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const dados = await resposta.json()
      if (dados.erro) return

      setForm((atual) => ({
        ...atual,
        logradouro: dados.logradouro || atual.logradouro,
        bairro: dados.bairro || atual.bairro,
        cidade: dados.localidade || atual.cidade,
        estado: dados.uf || atual.estado,
      }))
    } catch {
      // sem internet ou ViaCEP fora do ar: segue com preenchimento manual
    }
  }

  async function handleSubmit(evento) {
    evento.preventDefault()
    setMensagem(null)

    const errosValidacao = validar(form)
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      setMensagem({ tipo: 'erro', texto: 'Corrija os campos destacados para continuar.' })
      return
    }

    setEnviando(true)
    try {
      await colaboradorService.cadastrar(montarPayload(form), ORGANIZACAO_ID_TEMPORARIO)
      setMensagem({ tipo: 'sucesso', texto: 'Colaborador cadastrado com sucesso!' })
      setForm(FORMULARIO_INICIAL)
      setErros({})
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: extrairMensagemErro(erro) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="colaborador-cadastro">
      <button
        type="button"
        className="colaborador-cadastro__voltar"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <header className="colaborador-cadastro__cabecalho">
        <h2>Cadastro de Colaborador</h2>
        <p>Preencha as informações do novo colaborador abaixo</p>
      </header>

      {mensagem && (
        <div
          className={`colaborador-cadastro__alerta colaborador-cadastro__alerta--${mensagem.tipo}`}
          role="alert"
        >
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* ---------------- Informações básicas ---------------- */}
        <fieldset className="colaborador-cadastro__secao">
          <legend>
            <UserRound size={16} />
            Informações básicas
          </legend>

          <div className="colaborador-cadastro__grade">
            <div className="colaborador-cadastro__campo">
              <span className="colaborador-cadastro__rotulo">
                Tipo de colaborador
                <span className="colaborador-cadastro__obrigatorio"> *</span>
              </span>
              <div className="colaborador-cadastro__opcoes">
                <label>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    checked={ehPF}
                    onChange={() => trocarTipo('PF')}
                  />
                  Pessoa física
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipoPessoa"
                    checked={!ehPF}
                    onChange={() => trocarTipo('PJ')}
                  />
                  Pessoa jurídica
                </label>
              </div>
            </div>

            <Campo id="senha" rotulo="Senha do colaborador" erro={erros.senha}>
              <div className="colaborador-cadastro__senha">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Digite uma senha"
                  value={form.senha}
                  onChange={(e) => atualizar('senha', e.target.value)}
                  aria-invalid={Boolean(erros.senha)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((atual) => !atual)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Campo>

            <Campo id="funcao" rotulo="Função" erro={erros.funcao}>
              <select
                id="funcao"
                value={form.funcao}
                onChange={(e) => atualizar('funcao', e.target.value)}
                aria-invalid={Boolean(erros.funcao)}
              >
                <option value="">Selecione a função</option>
                {FUNCOES.map((funcao) => (
                  <option key={funcao.valor} value={funcao.valor}>
                    {funcao.rotulo}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              id="nome"
              rotulo={ehPF ? 'Nome completo' : 'Nome fantasia'}
              erro={erros.nome}
            >
              <input
                id="nome"
                type="text"
                placeholder={ehPF ? 'Digite o nome completo' : 'Digite o nome fantasia'}
                value={form.nome}
                onChange={(e) => atualizar('nome', e.target.value)}
                aria-invalid={Boolean(erros.nome)}
              />
            </Campo>

            <Campo id="documento" rotulo={ehPF ? 'CPF' : 'CNPJ'} erro={erros.documento}>
              <input
                id="documento"
                type="text"
                inputMode="numeric"
                placeholder={ehPF ? '000.000.000-00' : '00.000.000/0000-00'}
                value={form.documento}
                onChange={(e) =>
                  atualizar(
                    'documento',
                    ehPF ? formatarCpf(e.target.value) : formatarCnpj(e.target.value),
                  )
                }
                aria-invalid={Boolean(erros.documento)}
              />
            </Campo>

            {ehPF ? (
              <Campo id="dataNascimento" rotulo="Data de nascimento" erro={erros.dataNascimento}>
                <input
                  id="dataNascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => atualizar('dataNascimento', e.target.value)}
                  aria-invalid={Boolean(erros.dataNascimento)}
                />
              </Campo>
            ) : (
              <Campo id="dataAbertura" rotulo="Data de criação" erro={erros.dataAbertura}>
                <input
                  id="dataAbertura"
                  type="date"
                  value={form.dataAbertura}
                  onChange={(e) => atualizar('dataAbertura', e.target.value)}
                  aria-invalid={Boolean(erros.dataAbertura)}
                />
              </Campo>
            )}

            <Campo id="email" rotulo="E-mail" erro={erros.email}>
              <input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={form.email}
                onChange={(e) => atualizar('email', e.target.value)}
                aria-invalid={Boolean(erros.email)}
              />
            </Campo>

            <Campo id="telefone" rotulo="Telefone" erro={erros.telefone}>
              <input
                id="telefone"
                type="tel"
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => atualizar('telefone', formatarTelefone(e.target.value))}
                aria-invalid={Boolean(erros.telefone)}
              />
            </Campo>

            {ehPF ? (
              <Campo id="dataAdmissao" rotulo="Data de admissão" erro={erros.dataAdmissao}>
                <input
                  id="dataAdmissao"
                  type="date"
                  value={form.dataAdmissao}
                  onChange={(e) => atualizar('dataAdmissao', e.target.value)}
                  aria-invalid={Boolean(erros.dataAdmissao)}
                />
              </Campo>
            ) : (
              <Campo id="salario" rotulo="Salário" erro={erros.salario}>
                <input
                  id="salario"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="R$ 0,00"
                  value={form.salario}
                  onChange={(e) => atualizar('salario', e.target.value)}
                  aria-invalid={Boolean(erros.salario)}
                />
              </Campo>
            )}

            {ehPF ? (
              <>
                <Campo id="salario" rotulo="Salário" erro={erros.salario}>
                  <input
                    id="salario"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="R$ 0,00"
                    value={form.salario}
                    onChange={(e) => atualizar('salario', e.target.value)}
                    aria-invalid={Boolean(erros.salario)}
                  />
                </Campo>

                <div className="colaborador-cadastro__campo">
                  <span className="colaborador-cadastro__rotulo">
                    Gênero
                    <span className="colaborador-cadastro__obrigatorio"> *</span>
                  </span>
                  <div className="colaborador-cadastro__opcoes">
                    <label>
                      <input
                        type="radio"
                        name="genero"
                        checked={form.genero === 'MASCULINO'}
                        onChange={() => atualizar('genero', 'MASCULINO')}
                      />
                      Masculino
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="genero"
                        checked={form.genero === 'FEMININO'}
                        onChange={() => atualizar('genero', 'FEMININO')}
                      />
                      Feminino
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <Campo id="razaoSocial" rotulo="Razão social" erro={erros.razaoSocial}>
                <input
                  id="razaoSocial"
                  type="text"
                  placeholder="Digite a razão social"
                  value={form.razaoSocial}
                  onChange={(e) => atualizar('razaoSocial', e.target.value)}
                  aria-invalid={Boolean(erros.razaoSocial)}
                />
              </Campo>
            )}
          </div>
        </fieldset>

        {/* ---------------- Endereço ---------------- */}
        <fieldset className="colaborador-cadastro__secao">
          <legend>
            <MapPin size={16} />
            Endereço
          </legend>

          <div className="colaborador-cadastro__grade colaborador-cadastro__grade--endereco-1">
            <Campo id="cep" rotulo="CEP" erro={erros.cep}>
              <input
                id="cep"
                type="text"
                inputMode="numeric"
                placeholder="00000-000"
                value={form.cep}
                onChange={(e) => atualizar('cep', formatarCep(e.target.value))}
                onBlur={(e) => buscarCep(e.target.value)}
                aria-invalid={Boolean(erros.cep)}
              />
            </Campo>

            <Campo id="logradouro" rotulo="Rua" erro={erros.logradouro}>
              <input
                id="logradouro"
                type="text"
                placeholder="Digite o nome da rua"
                value={form.logradouro}
                onChange={(e) => atualizar('logradouro', e.target.value)}
                aria-invalid={Boolean(erros.logradouro)}
              />
            </Campo>

            <Campo id="numero" rotulo="Número" erro={erros.numero}>
              <input
                id="numero"
                type="text"
                placeholder="123"
                value={form.numero}
                onChange={(e) => atualizar('numero', e.target.value)}
                aria-invalid={Boolean(erros.numero)}
              />
            </Campo>

            <Campo id="complemento" rotulo="Complemento" obrigatorio={false}>
              <input
                id="complemento"
                type="text"
                placeholder="Apto, Casa, Bloco..."
                value={form.complemento}
                onChange={(e) => atualizar('complemento', e.target.value)}
              />
            </Campo>
          </div>

          <div className="colaborador-cadastro__grade">
            <Campo id="bairro" rotulo="Bairro" erro={erros.bairro}>
              <input
                id="bairro"
                type="text"
                placeholder="Digite o nome do bairro"
                value={form.bairro}
                onChange={(e) => atualizar('bairro', e.target.value)}
                aria-invalid={Boolean(erros.bairro)}
              />
            </Campo>

            <Campo id="cidade" rotulo="Cidade" erro={erros.cidade}>
              <input
                id="cidade"
                type="text"
                placeholder="Digite o nome da cidade"
                value={form.cidade}
                onChange={(e) => atualizar('cidade', e.target.value)}
                aria-invalid={Boolean(erros.cidade)}
              />
            </Campo>

            <Campo id="estado" rotulo="Estado" erro={erros.estado}>
              <select
                id="estado"
                value={form.estado}
                onChange={(e) => atualizar('estado', e.target.value)}
                aria-invalid={Boolean(erros.estado)}
              >
                <option value="">Selecione o estado</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        </fieldset>

        <div className="colaborador-cadastro__acoes">
          <button
            type="submit"
            className="colaborador-cadastro__botao-cadastrar"
            disabled={enviando}
          >
            {enviando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ColaboradorCadastroPage
