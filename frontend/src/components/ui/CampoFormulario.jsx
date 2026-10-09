import { ChevronDown } from 'lucide-react'
import { useId } from 'react'

import './CampoFormulario.css'

/*
  Campo de formulário padrão: rótulo + controle + mensagem de erro.

  Props:
    rotulo        texto acima do campo
    tipo          'texto' (padrão) | 'selecao' | 'areaTexto'
    obrigatorio   mostra o asterisco vermelho
    opcional      mostra "(opcional)" ao lado do rótulo
    erro          mensagem de erro (deixa a borda vermelha)
    opcoes        só para 'selecao': [{ valor: 'X', rotulo: 'Texto' }]
    placeholder   texto de exemplo (em 'selecao', é a opção vazia)
    ...resto      value, onChange, disabled, name, maxLength etc.
*/
function CampoFormulario({
  rotulo,
  tipo = 'texto',
  obrigatorio = false,
  opcional = false,
  erro = '',
  opcoes = [],
  placeholder = '',
  className = '',
  ...resto
}) {
  const id = useId()
  const classeControle = `campo-formulario__controle ${
    erro ? 'campo-formulario__controle--erro' : ''
  }`

  let controle

  if (tipo === 'selecao') {
    controle = (
      <div className="campo-formulario__selecao">
        <select id={id} className={classeControle} {...resto}>
          <option value="">{placeholder}</option>
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="campo-formulario__seta" />
      </div>
    )
  } else if (tipo === 'areaTexto') {
    controle = (
      <textarea
        id={id}
        className={`${classeControle} campo-formulario__area-texto`}
        placeholder={placeholder}
        {...resto}
      />
    )
  } else {
    controle = (
      <input
        id={id}
        type="text"
        className={classeControle}
        placeholder={placeholder}
        {...resto}
      />
    )
  }

  return (
    <div className={`campo-formulario ${className}`}>
      <label htmlFor={id} className="campo-formulario__rotulo">
        {rotulo}
        {obrigatorio && (
          <span className="campo-formulario__obrigatorio"> *</span>
        )}
        {opcional && (
          <span className="campo-formulario__opcional"> (opcional)</span>
        )}
      </label>

      {controle}

      {erro && (
        <span className="campo-formulario__erro" role="alert">
          {erro}
        </span>
      )}
    </div>
  )
}

export default CampoFormulario
