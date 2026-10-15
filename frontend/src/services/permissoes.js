const CAMINHOS_POR_FUNCAO = {
    ADMINISTRADOR: [
        '/dashboard',
        '/agenda',
        '/clientes',
        '/servicos',
        '/categorias',
        '/produtos',
        '/estoque',
        '/fornecedores',
        '/financeiro',
        '/rh',
        '/configuracoes',
    ],
    ANALISTA_RH: ['/rh'],
    ANALISTA_FINANCEIRO: ['/financeiro'],
    ESTOQUISTA: ['/estoque', '/categorias'],
    COMERCIAL: ['/clientes'],
    GERENTE_SUPRIMENTOS: ['/fornecedores', '/estoque', '/categorias'],
    VENDEDOR: ['/produtos'],
    PRESTADOR_SERVICO: ['/servicos', '/categorias', '/agenda'],
}

export function podeAcessarCaminho(funcao, caminho) {
    if (typeof caminho !== 'string') return false

    const caminhos = CAMINHOS_POR_FUNCAO[funcao]
    if (!Array.isArray(caminhos)) return false

    const rota = caminho.split(/[?#]/)[0]

    return caminhos.some((permitido) =>
        rota === permitido || rota.startsWith(`${permitido}/`)
    )
}

export function obterPaginaInicial(funcao) {
    if (funcao === 'ADMINISTRADOR') return '/servicos'

    const caminhos = CAMINHOS_POR_FUNCAO[funcao]
    return Array.isArray(caminhos) ? caminhos[0] : '/login'
}