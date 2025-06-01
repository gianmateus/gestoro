# Frontend - Restaurant Financial Management System

Interface moderna e responsiva para o sistema de gestão financeira de restaurantes, desenvolvida com React/Next.js e TypeScript.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos
- **Recharts** - Gráficos e visualizações
- **React Hook Form** - Gerenciamento de formulários
- **Zustand** - Gerenciamento de estado
- **Zod** - Validação de dados

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # Estilos globais
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página inicial
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes base da UI
│   │   ├── forms/         # Componentes de formulário
│   │   ├── charts/        # Componentes de gráficos
│   │   └── layout/        # Componentes de layout
│   ├── hooks/             # React hooks customizados
│   ├── lib/               # Utilitários e configurações
│   ├── store/             # Gerenciamento de estado
│   └── types/             # Tipos TypeScript específicos
├── public/                # Arquivos estáticos
├── tailwind.config.js     # Configuração Tailwind
├── next.config.js         # Configuração Next.js
└── package.json           # Dependências do projeto
```

## 🎨 Design System

### Cores
- **Primária**: Tons quentes inspirados em restaurantes
- **Secundária**: Cinzas neutros para texto e bordas
- **Semântica**: Verde (sucesso), Vermelho (erro), Amarelo (aviso)

### Componentes
- Cards responsivos
- Formulários acessíveis
- Navegação intuitiva
- Gráficos interativos

## 🌐 Internacionalização

A interface é totalmente em **alemão**, seguindo as especificações do cliente para o mercado alemão.

### Exemplos de Texto:
- Dashboard → "Übersicht"
- Accounts Payable → "Verbindlichkeiten"
- Accounts Receivable → "Forderungen"
- Inventory → "Inventar"
- Purchases → "Einkäufe"

## 🛠️ Desenvolvimento

### Instalação
```bash
cd frontend
npm install
```

### Executar em desenvolvimento
```bash
npm run dev
```

### Build de produção
```bash
npm run build
npm start
```

### Verificação de tipos
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🔗 Integração com Backend

O frontend consome a API REST do backend através de:
- Axios para requisições HTTP
- Interceptadores para autenticação JWT
- Tratamento de erros centralizado
- Cache de dados com SWR/React Query

## 📱 Responsividade

O sistema é totalmente responsivo, otimizado para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Segurança

- Autenticação JWT
- Proteção de rotas
- Validação de formulários
- Sanitização de dados 