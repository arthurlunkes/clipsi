# Clínica Psi — Sistema de Gestão Psicológica

Trabalho acadêmico da disciplina de **Composição e Projeto Gráfico**.

Sistema completo de gestão para clínica psicológica, com foco em responsividade mobile-first, composição visual, hierarquia e usabilidade.

---

## Tecnologias

| Categoria      | Tecnologia                     |
| -------------- | ------------------------------ |
| Framework      | Vue 3 + TypeScript + Vite      |
| Roteamento     | Vue Router                     |
| Estado         | Pinia                          |
| Estilo         | Tailwind CSS v4                |
| Banco de dados | IndexedDB via Dexie.js         |
| Calendário     | FullCalendar                   |
| Gráficos       | ApexCharts via vue3-apexcharts |
| Datas          | date-fns                       |
| Formulários    | vee-validate + zod             |
| Ícones         | lucide-vue-next                |
| PDF            | jsPDF                          |
| IA             | Google Gemini API              |

---

## Instalação

```bash
# Instalar dependências
yarn install

# Iniciar servidor de desenvolvimento
yarn dev

# Build de produção
yarn build

# Qualidade de código
yarn lint          # ESLint com --fix
yarn lint:check    # ESLint sem correções (usado no CI)
yarn format        # Prettier --write
yarn format:check  # Prettier --check (usado no CI)
yarn type-check    # vue-tsc
```

### IA (opcional)

Copie `.env.example` para `.env` e adicione sua chave Gemini:

```
VITE_GEMINI_API_KEY=sua_chave_aqui
```

---

## Estrutura de pastas

```
src/
├── app/                    # Componentes de layout (Sidebar, Header, BottomNav)
├── core/                   # Configurações e abstrações centrais
├── infrastructure/
│   ├── ai/                 # Integração Gemini com abstração de provider
│   └── database/           # Dexie DB, schema e seed de dados
├── features/               # Módulos de negócio
│   ├── dashboard/          # Visão geral e indicadores
│   ├── pacientes/          # CRUD completo de pacientes
│   ├── agenda/             # Calendário com FullCalendar
│   ├── acolhimento/        # Registros de acolhimento
│   ├── prontuario/         # Histórico de evoluções
│   ├── financeiro/         # Receitas, despesas e indicadores
│   ├── relatorios/         # Gráficos + exportação PDF
│   ├── fila-espera/        # Fila em tempo real
│   └── configuracoes/      # Configurações do sistema
├── shared/
│   ├── components/ui/      # Componentes base reutilizáveis
│   └── composables/        # Composables compartilhados
└── assets/                 # Estilos globais
```

Cada feature segue a estrutura:

```
feature/
├── pages/        # Componentes de página (rotas)
├── components/   # Componentes específicos da feature
├── composables/  # Lógica reativa
├── services/     # Acesso a dados (repository pattern)
└── types/        # Interfaces TypeScript
```

---

## Arquitetura

### Clean Architecture para Frontend

A arquitetura foi inspirada em Clean Architecture adaptada para o contexto frontend:

- **Pages** — responsáveis apenas por layout e composição de componentes
- **Composables** — lógica de estado reativo e side-effects
- **Services** — única camada que acessa o Dexie; funciona como repositório
- **Infrastructure** — adaptadores externos (IndexedDB, Gemini API)
- **Shared** — componentes base sem dependências de negócio

Componentes Vue **nunca importam Dexie diretamente**. Toda persistência passa pelos services.

### SOLID aplicado

- **SRP**: cada composable tem responsabilidade única
- **OCP**: AIProvider é uma interface; GeminiProvider implementa-a (troca de provedor sem alterar código consumidor)
- **DIP**: pages dependem de composables e services, não de implementações concretas

---

## Funcionalidades

### Dashboard

- Indicadores: pacientes ativos, consultas hoje, receita do mês, pacientes em espera
- Gráficos de atendimentos e financeiro (últimos 6 meses)
- Lista de próximas consultas e pacientes recentes

### Pacientes

- CRUD completo com busca em tempo real
- Paginação
- Perfil do paciente com histórico de consultas e prontuários

### Agenda

- FullCalendar com visualizações mês/semana/dia/lista
- Criar, editar e cancelar consultas
- Clique no evento abre modal de detalhes

### Acolhimento

- Registro de queixa principal, histórico e encaminhamento
- Expansão inline para visualizar detalhes
- Integração com IA para gerar resumo clínico

### Prontuário

- Evoluções cronológicas por paciente
- Filtro por paciente
- Integração com IA para resumo de sessão

### Financeiro

- Lançamentos de receitas e despesas
- Filtro por mês/ano
- Indicadores: receita, despesas, lucro, contas a receber

### Relatórios

- Gráficos de atendimentos, financeiro e status de consultas
- Exportação para PDF com jsPDF

### Fila de Espera

- Gerenciamento em tempo real da fila diária
- Status: aguardando → em atendimento → finalizado
- Cálculo de tempo de espera

---

## Design

Paleta de cores:

- Primária: `#7C5CFC` (violeta)
- Secundária: `#A78BFA`
- Sucesso: `#22C55E`
- Alerta: `#F59E0B`
- Erro: `#EF4444`
- Background: `#F8FAFC`

Princípios aplicados: Proximidade, Alinhamento, Repetição, Contraste, Espaço em branco, Gestalt, Hierarquia visual.

Responsivo: Mobile-first com layout dedicado para cada breakpoint (mobile / tablet / desktop).

### Tema claro/escuro

- Alternância rápida pelo botão (sol/lua) no cabeçalho e seleção completa (claro/escuro/sistema) em **Configurações → Aparência**.
- A preferência é persistida em `localStorage` (`ui:theme`) e o modo "sistema" acompanha `prefers-color-scheme` em tempo real.
- Um script inline no `index.html` aplica o tema antes da renderização, evitando "flash" de tema claro ao recarregar.
- O tema escuro é implementado em [src/style.css](src/style.css): como o projeto usa cores literais nas classes (ex.: `text-[#1E293B]`), elas são remapeadas sob a classe `.dark` via seletores de atributo, sem reescrever os componentes.

---

## Deploy (CI/CD)

O fluxo está em [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. **Qualidade & Build** (em todo push e pull request para `main`): instala dependências, roda Prettier, ESLint, type-check e gera o build de produção.
2. **Deploy via SSH** (apenas em push para `main`): baixa o artefato `dist/`, sincroniza com o servidor via `rsync`, instala a config do nginx (se ausente) e recarrega o nginx.

A configuração do nginx fica em [deploy/nginx/clipsi.arthurlunkes.com.br.conf](deploy/nginx/clipsi.arthurlunkes.com.br.conf) — domínio **clipsi.arthurlunkes.com.br**, com fallback de SPA, compressão gzip, cache de assets e cabeçalhos de segurança. O certificado TLS é esperado em `/etc/letsencrypt/live/clipsi.arthurlunkes.com.br/` (gere uma vez com `certbot`).

Configure no repositório (Settings → Secrets and variables → Actions):

| Tipo     | Nome              | Descrição                                                   |
| -------- | ----------------- | ----------------------------------------------------------- |
| Variable | `SSH_HOST`        | Host/IP do servidor                                         |
| Variable | `SSH_USER`        | Usuário SSH                                                 |
| Variable | `SSH_PORT`        | Porta SSH (padrão `22`)                                     |
| Variable | `DEPLOY_PATH`     | Diretório web servido pelo nginx (padrão `/var/www/clipsi`) |
| Variable | `DEPLOY_URL`      | URL pública (exibida no GitHub) — opcional                  |
| Secret   | `SSH_PRIVATE_KEY` | Chave privada SSH para o deploy                             |
