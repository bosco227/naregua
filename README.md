# NaRégua

Aplicação demonstrativa para encontrar barbearias no mapa, comparar profissionais por especialidade e quantidade de cortes concluídos e solicitar um horário livre.

![React](https://img.shields.io/badge/React-19-11150f?logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8-11150f?logo=mysql)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-c7f432?logo=leaflet&logoColor=11150f)

## O que já funciona

- Mapa interativo com pins de barbearias em Fortaleza
- Seleção de barbearia e profissional
- Perfil com especialidade, avaliação e total de cortes
- Horários livres e bloqueio de agendamento duplicado
- Meus agendamentos com status pendente/confirmado
- Dashboard da barbearia com confirmação de pedidos
- CRM básico e disparo simulado de promoção
- Navegação com React Router e interface mobile-first
- Persistência da demonstração no navegador
- API Express e modelo MySQL prontos para integração

## Rodando o front-end

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Rodando a API

1. Execute `database/schema.sql` e, opcionalmente, `database/seed.sql` no MySQL.
2. Copie `.env.example` para `.env` e ajuste as credenciais.
3. Instale e inicie a API:

```bash
cd server
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3333/api`.

## Regra de disponibilidade

A API responde com `409 Conflict` quando já existe um agendamento para o mesmo barbeiro e horário. A regra também é garantida no MySQL pela chave única `uq_barbeiro_horario (barbeiro_id, data_hora)`, evitando conflitos mesmo em requisições simultâneas.

## Estrutura

```text
app/                 interface React e rotas
database/            schema e dados demonstrativos
server/              API Express + MySQL
.env.example         variáveis necessárias, sem segredos
```

## Observação

O front-end abre com dados demonstrativos para facilitar a avaliação pelo GitHub. A API fornecida representa a integração real e pode substituir os dados locais sem mudar os fluxos da interface.
# naregua
