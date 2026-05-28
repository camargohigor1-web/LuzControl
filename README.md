# LuzControl ⚡

**Controle inteligente do seu consumo elétrico**

App web PWA para monitoramento de consumo elétrico residencial. Por padrão, os dados são salvos localmente no dispositivo (`localStorage`), com backup remoto opcional via Firestore.

---

## Funcionalidades

- 📊 **Dashboard** — resumo do mês, bandeira tarifária, meta, projeção
- 📖 **Leituras** — registro mensal com cálculo automático de consumo e custo/kWh
- ⚡ **Equipamentos** — cadastro, ranking de custo, simulador de economia, agrupamento por categoria
- 📈 **Relatórios** — gráficos de consumo, custo, custo/kWh, heatmap anual, exportação em PDF
- ⚙️ **Configurações** — tema claro/escuro, metas, múltiplas residências, tarifa base

---

## Estrutura do projeto

```
luzcontrol/
├── public/
│   ├── favicon.svg
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── App.jsx        ← componente principal
│   └── main.jsx       ← entry point React
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## Como rodar localmente

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## Deploy na Vercel

### Opção 1 — Via CLI

```bash
npm install -g vercel
vercel --prod
```

### Opção 2 — Via GitHub

1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project**
3. Importe o repositório
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em **Deploy**

O `vercel.json` já configura o redirecionamento SPA e os headers de cache automaticamente.

---

## PWA — Instalar no celular

Após o deploy, acesse o app pelo navegador do celular e use a opção **"Adicionar à tela inicial"**:

- **iOS (Safari):** Compartilhar → Adicionar à Tela de Início
- **Android (Chrome):** Menu → Adicionar à tela inicial

O app funcionará offline após a primeira visita.

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18 | UI e estado |
| Vite 5 | Bundler e dev server |
| vite-plugin-pwa | Service Worker e manifest |
| Recharts | Gráficos |
| Lucide React | Ícones |
| Nunito (Google Fonts) | Tipografia |
| html2canvas + jsPDF | Exportação PDF |
| localStorage | Persistência de dados |
| Firebase Firestore | Backup remoto opcional |

---

## Backup automático com Firestore

O app continua funcionando offline com `localStorage`, mas pode salvar uma cópia remota no Firestore quando o backup for ativado em **Configurações > Backup automático**.

### Configuração

1. Crie um projeto no Firebase.
2. Ative o Firestore.
3. Copie as credenciais do app Web do Firebase.
4. Configure as variáveis do arquivo `.env.example` no `.env` local e também na Vercel.
5. Publique novamente o app.

### Regras simples para uso pessoal

Use regras restritas ao caminho de backup:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /luzcontrol_backups/{backupId} {
      allow read, write: if true;
    }
  }
}
```

Para um app público, o ideal é adicionar login antes de abrir escrita no Firestore. Esta implementação prioriza simplicidade para uso pessoal.

### Como usar

1. Abra o app.
2. Entre em **Configurações > Backup automático**.
3. Crie um código forte e guarde esse código fora do navegador.
4. Ative o backup automático.
5. Em outro aparelho, informe o mesmo código e escolha restaurar o backup existente.
6. Para recuperar dados manualmente, use **Restaurar backup** e informe o mesmo código.

---

## Dados e privacidade

Por padrão, os dados (leituras, equipamentos, configurações, perfis) ficam no `localStorage` do navegador. Quando o backup automático é ativado, uma cópia dos dados é enviada para o Firestore configurado no projeto.
