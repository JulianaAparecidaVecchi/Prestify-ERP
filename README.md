# Prestify

## Integrantes da Equipe

Este projeto foi desenvolvido por:

- Arthur Kalil Lima Figueiredo
- Arthur Rodrigues Pansera
- Jean Inácio Praes Moura
- Juliana Aparecida Vecchi
- Stefany Carlos de Oliveira

---

## Execução do Projeto

### Backend

```powershell
cd prestify-backend
.\mvnw.cmd spring-boot:run
```

O backend será executado em:

```text
http://localhost:8080
```

### Frontend

Em outro terminal:

```powershell
cd prestify-frontend
npm.cmd install
npm.cmd run dev
```

O frontend será executado em:

```text
http://localhost:5173
```

Para executar o sistema localmente, é necessário possuir o MySQL/MariaDB em execução e um banco chamado `prestify`.