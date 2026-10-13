import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, UserRound } from 'lucide-react'

import { buscarCliente, criarCliente, atualizarCliente } from '../../api/clienteApi'
import Botao from '../../components/ui/Botao'
import CampoFormulario from '../../components/ui/CampoFormulario'
import CartaoFormulario from '../../components/ui/CartaoFormulario'
import TopoPagina from '../../components/layout/TopoPagina'

const ESTADOS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

const dadosVazios = () => ({
    tipoPessoa: 'FISICA', nome: '', cpf: '', cnpj: '', dataNascimento: '',
    genero: '', email: '', telefone: '',
    endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
    },
})

function hoje() {
    const data = new Date()

    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

function validar(dados) {
    const erros = {}

    for (const campo of ['nome', 'email', 'telefone']) {
        if (!dados[campo].trim()) erros[campo] = 'Preencha este campo.'
    }

    if (!['FISICA', 'JURIDICA'].includes(dados.tipoPessoa)) {
        erros.tipoPessoa = 'Selecione o tipo de cliente.'
    }

    if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
        erros.email = 'Informe um e-mail válido.'
    }

    if (
        !/^[\d().\s-]+$/.test(dados.telefone) ||
        !/^\d{10,11}$/.test(dados.telefone.replace(/\D/g, ''))
    ) {
        erros.telefone = 'Informe um telefone com DDD e 10 ou 11 dígitos.'
    }

    if (dados.tipoPessoa === 'FISICA') {
        if (!/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(dados.cpf.trim())) {
            erros.cpf = 'Informe o CPF com 11 dígitos.'
        }

        if (!dados.dataNascimento || dados.dataNascimento > hoje()) {
            erros.dataNascimento = 'Informe uma data de nascimento válida, até hoje.'
        }

        if (!['MASCULINO', 'FEMININO'].includes(dados.genero)) {
            erros.genero = 'Selecione o gênero.'
        }
    } else {
        if (!/^([A-Z0-9]{12}\d{2}|[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-\d{2})$/i.test(dados.cnpj.trim())) {
            erros.cnpj = 'Informe um CNPJ numérico ou alfanumérico com 14 caracteres.'
        }
    }

    for (const campo of ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado']) {
        if (!dados.endereco[campo].trim()) {
            erros[`endereco.${campo}`] = 'Preencha este campo.'
        }
    }

    if (!/^\d{5}-?\d{3}$/.test(dados.endereco.cep.trim())) {
        erros['endereco.cep'] = 'Informe um CEP com 8 dígitos.'
    }

    if (!ESTADOS.includes(dados.endereco.estado)) {
        erros['endereco.estado'] = 'Selecione um estado válido.'
    }

    return erros
}

function ClienteFormularioPage({ modo = 'criar' }) {
    const { id } = useParams()
    const navegar = useNavigate()
    const leitura = modo === 'visualizar'

    const [dados, setDados] = useState(dadosVazios)
    const [carregando, setCarregando] = useState(modo !== 'criar')
    const [carregado, setCarregado] = useState(modo === 'criar')
    const [salvando, setSalvando] = useState(false)
    const [erros, setErros] = useState({})
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [revisao, setRevisao] = useState(0)

    useEffect(() => {
        let vigente = true

        setErro('')
        setSucesso('')
        setErros({})
        setCarregado(false)
        setCarregando(true)

        async function carregar() {
            try {
                const cliente = modo === 'criar' ? null : await buscarCliente(id)

                if (!vigente) return

                const vazio = dadosVazios()

                if (cliente) {
                    for (const campo of Object.keys(vazio)) {
                        if (campo !== 'endereco') {
                            vazio[campo] = cliente[campo] ?? vazio[campo]
                        }
                    }

                    for (const campo of Object.keys(vazio.endereco)) {
                        vazio.endereco[campo] = cliente.endereco?.[campo] ?? ''
                    }
                }

                setDados(vazio)
                setCarregado(true)
            } catch (falha) {
                if (vigente) {
                    setErro(falha.message || 'Não foi possível consultar o cliente.')
                }
            } finally {
                if (vigente) setCarregando(false)
            }
        }

        carregar()

        return () => {
            vigente = false
        }
    }, [id, modo, revisao])

    function alterar(evento) {
        const { name, value } = evento.target

        setDados((atual) => {
            if (name.startsWith('endereco.')) {
                return {
                    ...atual,
                    endereco: {
                        ...atual.endereco,
                        [name.split('.')[1]]: value,
                    },
                }
            }

            if (name === 'tipoPessoa') {
                return {
                    ...atual,
                    tipoPessoa: value,
                    cpf: '',
                    cnpj: '',
                    dataNascimento: '',
                    genero: '',
                }
            }

            return { ...atual, [name]: value }
        })

        setErros((atual) => name === 'tipoPessoa'
            ? {}
            : { ...atual, [name]: '' }
        )

        setErro('')
        setSucesso('')
    }

    async function enviar(evento) {
        evento.preventDefault()

        if (leitura || salvando || !carregado) return

        setErro('')
        setSucesso('')

        const falhas = validar(dados)
        setErros(falhas)

        if (Object.keys(falhas).length) {
            setErro('Revise os campos destacados antes de salvar.')
            return
        }

        const pessoaFisica = dados.tipoPessoa === 'FISICA'

        const payload = {
            tipoPessoa: dados.tipoPessoa,
            nome: dados.nome.trim(),
            cpf: pessoaFisica ? dados.cpf.trim() : null,
            cnpj: pessoaFisica ? null : dados.cnpj.trim().toUpperCase(),
            dataNascimento: pessoaFisica ? dados.dataNascimento : null,
            genero: pessoaFisica ? dados.genero : null,
            email: dados.email.trim(),
            telefone: dados.telefone.trim(),
            endereco: Object.fromEntries(
                Object.entries(dados.endereco).map(([chave, valor]) => [
                    chave,
                    valor.trim(),
                ])
            ),
        }

        setSalvando(true)

        try {
            if (modo === 'editar') {
                await atualizarCliente(id, payload)
            } else {
                await criarCliente(payload)
            }

            setSucesso(modo === 'editar'
                ? 'Cliente atualizado com sucesso.'
                : 'Cliente cadastrado com sucesso.'
            )

            if (modo === 'criar') setDados(dadosVazios())
        } catch (falha) {
            setErro(falha.message || 'Não foi possível salvar o cliente.')
        } finally {
            setSalvando(false)
        }
    }

    function campo(nome, rotulo, opcoes = {}) {
        const valor = nome.startsWith('endereco.')
            ? dados.endereco[nome.split('.')[1]]
            : dados[nome]

        return (
            <CampoFormulario
                name={nome}
                rotulo={rotulo}
                value={valor}
                onChange={alterar}
                disabled={leitura || salvando}
                erro={erros[nome]}
                obrigatorio={!opcoes.opcional}
                required={!opcoes.opcional}
                {...opcoes}
            />
        )
    }

    const pessoaFisica = dados.tipoPessoa === 'FISICA'

    const titulo = modo === 'criar'
        ? 'Cadastro de Cliente'
        : modo === 'editar'
            ? 'Edição de Cliente'
            : 'Detalhes do Cliente'

    return (
        <section className="formulario-cliente">
            <TopoPagina
                titulo={titulo}
                subtitulo={leitura
                    ? 'Consulte as informações do cliente.'
                    : 'Preencha as informações do cliente abaixo.'
                }
                mostrarVoltar={false}
            />

            <Botao
                variante="contorno"
                disabled={salvando}
                onClick={() => navegar('/clientes')}
            >
                Voltar para clientes
            </Botao>

            {erro && (
                <p className="formulario-cliente__erro" role="alert">
                    {erro}
                </p>
            )}

            {sucesso && (
                <p className="formulario-cliente__sucesso" role="status">
                    {sucesso}
                </p>
            )}

            {carregando ? (
                <p role="status">Carregando cliente...</p>
            ) : !carregado ? (
                <Botao
                    variante="contorno"
                    onClick={() => setRevisao((atual) => atual + 1)}
                >
                    Tentar novamente
                </Botao>
            ) : (
                <form onSubmit={enviar} noValidate>
                    <CartaoFormulario
                        titulo="Informações básicas"
                        icone={UserRound}
                    >
                        <div className="formulario-cliente__grade">
                            {campo('tipoPessoa', 'Tipo de cliente', {
                                tipo: 'selecao',
                                placeholder: 'Selecione o tipo',
                                opcoes: [
                                    { valor: 'FISICA', rotulo: 'Pessoa Física' },
                                    { valor: 'JURIDICA', rotulo: 'Pessoa Jurídica' },
                                ],
                            })}

                            {campo('nome', pessoaFisica ? 'Nome completo' : 'Razão social', {
                                maxLength: 150,
                                autoComplete: pessoaFisica ? 'name' : 'organization',
                            })}

                            {pessoaFisica
                                ? campo('cpf', 'CPF', {
                                    maxLength: 14,
                                    placeholder: '000.000.000-00',
                                    inputMode: 'numeric',
                                })
                                : campo('cnpj', 'CNPJ', {
                                    maxLength: 18,
                                    placeholder: '00.000.000/0000-00',
                                })
                            }

                            {pessoaFisica && campo('dataNascimento', 'Data de nascimento', {
                                type: 'date',
                                max: hoje(),
                                autoComplete: 'bday',
                            })}

                            {campo('email', 'E-mail', {
                                type: 'email',
                                maxLength: 150,
                                autoComplete: 'email',
                            })}

                            {campo('telefone', 'Telefone', {
                                type: 'tel',
                                maxLength: 20,
                                placeholder: '(41) 99999-9999',
                                autoComplete: 'tel-national',
                            })}

                            {pessoaFisica && campo('genero', 'Gênero', {
                                tipo: 'selecao',
                                placeholder: 'Selecione o gênero',
                                opcoes: [
                                    { valor: 'MASCULINO', rotulo: 'Masculino' },
                                    { valor: 'FEMININO', rotulo: 'Feminino' },
                                ],
                            })}
                        </div>
                    </CartaoFormulario>

                    <CartaoFormulario titulo="Endereço" icone={MapPin}>
                        <div className="formulario-cliente__grade">
                            {campo('endereco.cep', 'CEP', {
                                maxLength: 9,
                                placeholder: '00000-000',
                                inputMode: 'numeric',
                                autoComplete: 'postal-code',
                            })}

                            {campo('endereco.logradouro', 'Rua', {
                                maxLength: 150,
                                autoComplete: 'address-line1',
                            })}

                            {campo('endereco.numero', 'Número', {
                                maxLength: 20,
                            })}

                            {campo('endereco.complemento', 'Complemento', {
                                opcional: true,
                                maxLength: 100,
                                autoComplete: 'address-line2',
                            })}

                            {campo('endereco.bairro', 'Bairro', {
                                maxLength: 100,
                            })}

                            {campo('endereco.cidade', 'Cidade', {
                                maxLength: 100,
                                autoComplete: 'address-level2',
                            })}

                            {campo('endereco.estado', 'Estado', {
                                tipo: 'selecao',
                                placeholder: 'Selecione o estado',
                                opcoes: ESTADOS.map((estado) => ({
                                    valor: estado,
                                    rotulo: estado,
                                })),
                                autoComplete: 'address-level1',
                            })}
                        </div>
                    </CartaoFormulario>

                    <div className="formulario-cliente__acoes">
                        {leitura ? (
                            <Botao onClick={() => navegar(`/clientes/${id}/editar`)}>
                                Editar cliente
                            </Botao>
                        ) : (
                            <Botao type="submit" disabled={salvando}>
                                {salvando
                                    ? 'Salvando...'
                                    : modo === 'editar'
                                        ? 'Salvar alterações'
                                        : 'Cadastrar'}
                            </Botao>
                        )}
                    </div>
                </form>
            )}
        </section>
    )
}

export default ClienteFormularioPage