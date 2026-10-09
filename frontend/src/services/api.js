import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

// TODO: quando o login estiver pronto, anexar o JWT aqui:
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

export function extrairMensagemErro(erro) {
  return (
    erro.response?.data?.mensagem ??
    'Não foi possível concluir a operação. Tente novamente.'
  )
}

export default api
