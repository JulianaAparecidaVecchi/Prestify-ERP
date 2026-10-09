import './CartaoFormulario.css'

/*
  Cartão de seção de formulário, como "Informações básicas" no design:
  um ícone roxo + título no topo e os campos logo abaixo.

  Props:
    titulo   título da seção
    icone    componente de ícone do lucide-react
    children os campos da seção
*/
function CartaoFormulario({ titulo, icone: Icone, children }) {
  return (
    <section className="cartao-formulario">
      <header className="cartao-formulario__cabecalho">
        {Icone && (
          <span className="cartao-formulario__icone">
            <Icone size={16} strokeWidth={2} />
          </span>
        )}
        <h2 className="cartao-formulario__titulo">{titulo}</h2>
      </header>

      <div className="cartao-formulario__conteudo">{children}</div>
    </section>
  )
}

export default CartaoFormulario
