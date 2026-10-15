# Publicação opcional no GitHub Pages

O jogo já publicado pode continuar sendo usado sem nenhuma destas etapas. Este documento é para quem quiser manter uma cópia independente no GitHub.

1. Crie um repositório no GitHub e envie o conteúdo do pacote de código, incluindo a pasta `.github`.
2. Use a branch `main` ou ajuste o nome no arquivo `.github/workflows/pages.yml`.
3. Nas configurações do repositório, em Pages, selecione **GitHub Actions** como origem.
4. O workflow instala dependências de teste, gera `dist/`, executa os testes e publica somente essa saída.
5. O endereço final será informado pelo próprio GitHub Actions. Não há domínio ou nome de usuário fixo no código.

Não é necessário servidor de aplicação, token em JavaScript, banco remoto ou chave de API. GitHub Pages serve os arquivos estáticos. O build usa Node.js e os testes dependem de linkedom e fake-indexeddb; o jogo no navegador não depende desses pacotes.

## Levar suas gravações

**Mais simples:** no site atual, exporte o pacote pelo gerenciador. No endereço do GitHub Pages, importe esse pacote. O armazenamento é separado por origem; mudar o endereço não transporta o IndexedDB automaticamente.

**Distribuir gravações com a publicação:** coloque arquivos reais em `public/assets/audio/` e adicione entradas em `src/config/bundled-audio.js`, usando os identificadores de `src/data/audio-catalog.js`. Existe um exemplo comentado no arquivo de configuração. Mantenha URLs relativas como `assets/audio/papoulas-narracao.mp3`. Cada entrada aceita `url`, `name`, `text` (opcional), `volume` e `loop`. Depois gere e publique novamente.

Arquivos incluídos na publicação ficam disponíveis a quem puder acessar o site. Uploads feitos no painel continuam locais. Não envie credenciais nem o banco de dados do navegador ao repositório.

## Restaurar e atualizar

Edite `src/` e `public/`, nunca a saída `dist/`. Preserve as chaves de destino existentes para que os áudios locais continuem associados às mesmas obras/telas. Faça backup exportando o pacote antes de limpar dados do navegador.
