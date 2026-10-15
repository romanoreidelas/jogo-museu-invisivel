# MUSEU INVISÍVEL — O Desafio da Imaginação

Minijogo independente do ENTRE TELAS: cinco rodadas, três opções por rodada, onze pinturas e dois canais de áudio independentes. Site estático, sem servidor de aplicação.

## Para usar na feira

Você não precisa de GitHub, terminal ou programação para usar o site já publicado.

1. Abra **PREPARAR EXPERIÊNCIA → GERENCIAR ÁUDIOS**.
2. Selecione a obra e a etapa, envie seu arquivo e clique em **Salvar configurações**.
3. A transcrição é **opcional**. A gravação funciona sem digitar o conteúdo falado.
4. Use **Ouvir prévia** para testar. Enviar um arquivo nunca o reproduz.
5. Inicie a partida. Cada áudio só começa pelo seu botão de reprodução.
6. Para outro computador ou endereço, exporte o pacote e importe no navegador da feira.

MP3, WAV e OGG são aceitos; M4A, MPEG e MPG dependem do conteúdo/codec e do navegador. A importação verifica assinatura do conteúdo e decodificação sem tocar o som. Arquivos incompatíveis recebem orientação para converter a MP3. Renomear uma extensão não converte o áudio.

Não existe opção de reprodução automática. Preferências antigas de autoplay são descartadas. Trocar de tela interrompe os canais; não há início automático em rodada, resposta, revelação, final, upload ou importação.

## Estrutura

- `src/app.js`: navegação e integração da interface.
- `src/game.js`: sorteio e pontuação.
- `src/components/`: gerenciamento de áudio.
- `src/audio/`: players, mixagem, validação e IndexedDB.
- `src/data/`: onze obras, descrições e catálogo de telas.
- `src/config/`: velocidades, ambientes e arquivos distribuídos com o site.
- `src/styles/`: aparência e responsividade.
- `public/assets/images/`: pinturas e recortes reais do acervo.
- `public/assets/audio/`: gravações opcionais incluídas na publicação.
- `public/index.html`: estrutura inicial da interface.
- `scripts/`: geração do site e servidor local opcional.
- `tests/`: testes de lógica, mídia e interface.
- `dist/`: saída gerada para publicação; não editar diretamente.
- `.github/workflows/pages.yml`: publicação opcional pelo GitHub Actions.

## Instalar e executar localmente (opcional)

Requer Node.js 22 ou posterior, apenas para quem quiser trabalhar no código:

```sh
npm ci
npm run build
npm start
```

Abra `http://localhost:4173`. Não abra index.html diretamente pelo explorador de arquivos; módulos JavaScript precisam de HTTP(S). `npm run dev` gera o site e inicia o servidor. `npm test` executa os testes após a geração.

## GitHub Pages (opcional)

Veja [docs/GITHUB.md](docs/GITHUB.md). O projeto já tem workflow; nenhuma publicação ou conta GitHub foi criada automaticamente. Os caminhos relativos funcionam na raiz e em `https://usuario.github.io/nome-do-repositorio/`, sem configurar uma base fixa.

## Arquivos e privacidade

Uploads ficam como bytes no IndexedDB do navegador, não apenas como URLs temporárias. Atualizar a página mantém os arquivos, salvo limpeza/evicção dos dados do navegador. Eles não são enviados a um servidor nem aparecem automaticamente em outros dispositivos ou domínios. A exportação inclui os arquivos e configurações; a importação preserva os destinos não incluídos no pacote. Limites: 40 MB por arquivo, 250 MB de áudio por pacote.

O painel tem bloqueio local por senha. Isso evita alterações casuais pela interface; não substitui autenticação de servidor nem protege contra quem controla o perfil/ferramentas do navegador. O GitHub Pages pode deixar o site e os arquivos incluídos publicamente acessíveis. Nenhuma senha, gravação local ou configuração privada do navegador faz parte do código-fonte exportado.

## Verificação e limites

Testes automatizados cobrem reprodução manual, navegação silenciosa inclusive com preferências legadas de autoplay, dois canais independentes, pausa e retomada, arquivos sem transcrição, substituição, persistência, pacote, cinco rodadas, onze obras, pontuação e caminhos em subpastas. O DOM e os players desses testes são substitutos controlados.

Nesta sessão não há navegador de QA disponível. Compatibilidade acústica dos arquivos reais, pausa audível da Web Speech API, responsividade visual e leitor de tela real precisam de conferência no computador da feira. A voz sintetizada depende do navegador/sistema; gravações têm prioridade e não são substituídas automaticamente por síntese quando falham.

O museu ENTRE TELAS original não é alterado por este projeto. Histórico técnico em `docs/HISTORY.md`.
