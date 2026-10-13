import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { listarServicos, excluirServico } from '../../api/servicoApi'
import Botao from '../../components/ui/Botao'
import ModalConfirmacao from '../../components/ui/ModalConfirmacao'
import TopoPagina from '../../components/layout/TopoPagina'
import './ServicoPage.css'

const moeda = (valor) => valor == null ? '—' : Number(valor).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
function ServicoPage() {
 const navegar=useNavigate(); const [servicos,setServicos]=useState([]); const [busca,setBusca]=useState(''); const [carregando,setCarregando]=useState(true); const [erro,setErro]=useState(''); const [excluir,setExcluir]=useState(null); const [erroExclusao,setErroExclusao]=useState(''); const [excluindo,setExcluindo]=useState(false)
 const carregar=useCallback(async()=>{setCarregando(true);setErro('');try{const dados=await listarServicos();setServicos(Array.isArray(dados)?dados:[])}catch(e){setErro(e.message)}finally{setCarregando(false)}},[])
 useEffect(()=>{carregar()},[carregar])
 const filtrados=useMemo(()=>servicos.filter(s=>`${s.codigo} ${s.nome} ${s.categoriaNome}`.toLowerCase().includes(busca.toLowerCase().trim())),[servicos,busca])
 async function confirmarExclusao(){setExcluindo(true);setErroExclusao('');try{await excluirServico(excluir.id);setExcluir(null);await carregar()}catch(e){setErroExclusao(e.message)}finally{setExcluindo(false)}}
 return <section className="pagina-servico"><TopoPagina titulo="Serviços" subtitulo="Gerencie os serviços oferecidos pela sua empresa." />
  <div className="pagina-servico__barra"><label className="pagina-servico__busca"><Search size={18}/><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por código, serviço ou categoria" /></label><Botao icone={Plus} onClick={()=>navegar('/servicos/novo')}>Novo serviço</Botao></div>
  {erro&&<p className="pagina-servico__erro" role="alert">{erro} <button onClick={carregar}>Tentar novamente</button></p>}
  <div className="pagina-servico__tabela-container"><table className="pagina-servico__tabela"><thead><tr><th>Código</th><th>Serviço</th><th>Categoria</th><th>Duração</th><th>Preço</th><th>Ações</th></tr></thead><tbody>
  {carregando?<tr><td colSpan="6" className="pagina-servico__aviso">Carregando serviços...</td></tr>:filtrados.length===0?<tr><td colSpan="6" className="pagina-servico__aviso">{servicos.length?'Nenhum serviço encontrado.':'Nenhum serviço cadastrado ainda.'}</td></tr>:filtrados.map(s=><tr key={s.id}><td>{s.codigo}</td><td>{s.nome}</td><td>{s.categoriaNome}</td><td>{s.duracaoEstimada} min</td><td>{s.tipoPreco==='UNICO'?moeda(s.preco):`${s.variacoes?.length||0} variação(ões)`}</td><td><div className="pagina-servico__acoes"><button className="pagina-servico__acao pagina-servico__acao--visualizar" title="Visualizar" onClick={()=>navegar(`/servicos/${s.id}`)}><Eye size={15}/></button><button className="pagina-servico__acao pagina-servico__acao--editar" title="Editar" onClick={()=>navegar(`/servicos/${s.id}/editar`)}><Pencil size={15}/></button><button className="pagina-servico__acao pagina-servico__acao--excluir" title="Excluir" onClick={()=>{setExcluir(s);setErroExclusao('')}}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>
  {excluir&&<ModalConfirmacao aberto={Boolean(excluir)} titulo="Excluir serviço" mensagem={`Deseja realmente excluir o serviço “${excluir.nome}”?`} onConfirmar={confirmarExclusao} onCancelar={()=>{setExcluir(null);setErroExclusao('')}} carregando={excluindo} erro={erroExclusao} />}
 </section>
}
export default ServicoPage
