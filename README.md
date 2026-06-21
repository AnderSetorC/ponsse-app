# Ponsse App - Quem está disponível

App simples para mostrar aos clientes quais funcionários da Ponsse estão disponíveis para atendimento em tempo real.

## Funcionalidades

- **Página principal (`/`)**: cards com foto, nome, setor, horário e telefone. O botão "Falar agora" fica disponível (verde/amarelo) só quando o funcionário está dentro do horário configurado.
- **Painel admin (`/admin`)**: ativar/desativar funcionários rapidamente, editar nome, setor, telefone, horário, enviar foto.
- **Status online/offline automático** baseado no horário configurado pelo admin.
- **Atualização ao vivo**: a página principal atualiza a cada minuto e sempre que a aba volta a ficar visível.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a página principal e [http://localhost:3000/admin](http://localhost:3000/admin) para o painel.

## Como fazer deploy no Vercel

1. Suba o projeto para um repositório no GitHub
2. Vá em [vercel.com](https://vercel.com) → New Project → importe o repositório
3. Clique em Deploy (sem nenhuma configuração extra)
4. Em Settings → Domains, adicione o domínio próprio que você comprou

## Estrutura

- `app/page.tsx` — página principal
- `app/admin/page.tsx` — painel admin
- `components/FuncionarioCard.tsx` — card de funcionário
- `components/AdminRow.tsx` — linha editável do admin
- `lib/funcionarios.ts` — funções utilitárias
- `lib/types.ts` — tipos e dados iniciais

## Sobre as fotos

Como você escolheu salvar as fotos na pasta pública do projeto, há dois caminhos:

1. **Rápido (data URL no navegador)**: o admin envia a foto pelo painel e ela fica salva como base64 no localStorage do navegador. Funciona só naquele dispositivo.

2. **Para funcionar em todos os dispositivos**: baixe a foto do admin, salve em `public/fotos/<id-do-funcionario>.jpg`, faça commit no Git e no campo foto do funcionário coloque `/fotos/1.jpg` (editando o JSON no localStorage ou pedindo para ajustar).

## Dados iniciais

Os funcionários do `fones.txt` já vêm pré-cadastrados. Edite em `lib/types.ts` no array `funcionariosIniciais` se precisar ajustar antes do primeiro deploy.
