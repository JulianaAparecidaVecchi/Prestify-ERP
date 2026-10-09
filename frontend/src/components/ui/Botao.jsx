import './Botao.css'

/*
  Botão padrão do sistema.

  Props:
    variante  'primario' (roxo, padrão) | 'contorno' | 'cinza' | 'perigo'
    icone     componente de ícone do lucide-react (opcional)
    ...resto  qualquer prop de <button> (onClick, type, disabled...)

  Exemplo:
    <Botao icone={Plus} onClick={abrir}>Novo Serviço</Botao>
*/
function Botao({
  variante = 'primario',
  icone: Icone,
  type = 'button',
  children,
  ...resto
}) {
  return (
    <button
      type={type}
      className={`botao botao--${variante}`}
      {...resto}
    >
      {Icone && <Icone size={20} strokeWidth={2} />}
      {children}
    </button>
  )
}

export default Botao
