# MUSEU INVISÍVEL — O Desafio da Imaginação

Jogo independente do ENTRE TELAS. O projeto original não foi modificado.

Site estático em `dist/`, sem serviços externos de narração ou dependências de execução. Cinco obras sorteadas entre as onze do acervo, três alternativas distintas, revelação, comparação de detalhe, pontuação e reinício. Imagens, recortes, metadados e mecanismos de voz/ambiente foram copiados do acervo local do museu. As fontes institucionais das pinturas permanecem em `dist/acervo.js`.

As descrições poéticas do jogo foram adaptadas para cerca de 60–70 palavras, sem pronunciar o título. A duração exata depende da voz e da velocidade escolhidas. Não existe cronômetro obrigatório.

## Áudio

Vozes reais do dispositivo por Web Speech API, velocidade inicial 1,15×. Importação de gravações por obra em IndexedDB: narração e ambiente. MP3 importado tem prioridade, sem troca silenciosa de voz em caso de erro. Arquivos importados persistem apenas no navegador usado; não são compartilhados entre dispositivos. As sínteses de ambiente do museu são procedurais, não gravações ou arquivos produzidos por IA. Não existiam MP3s fornecidos no projeto fonte. Tons musicais desativados no jogo.

## Pontuação

Acerto +10; conclusão do detalhe +5, inclusive após erro. Máximo padrão 75. Bônus opcional de +5 por acerto com uma única reprodução iniciada, configurado antes da partida; máximo 100. Transcrição não altera a pontuação. Cada etapa só pontua uma vez.

## Verificação

`npm install` e `npm test` executam os testes. Verificadas 1.000 partidas para unicidade e posição das alternativas, pontuação e reinício, existência das 11 imagens e recortes, fluxo DOM de cinco rodadas, transcrição, controles de pausa, seleção de voz e parâmetros de velocidade para síntese e MP3. Testes de voz usam mecanismos substitutos e não demonstram a qualidade acústica da voz disponível no notebook. Browser QA visual, responsividade real, reprodução audível e leitores de tela reais não foram executados: ferramenta de navegador de QA indisponível na sessão. CSS contém layouts para notebook e celular, foco visível, alto contraste e redução de movimento.

## Atualização — dois canais e gestão de áudios

- Dois cartões independentes em cada etapa: audiodescrição e ambiente. Narrar não inicia nem pausa o ambiente. Ambos podem tocar juntos. Redução opcional do ambiente a 25% do volume configurado, com transição de 350 ms para arquivos e suavização pelo Web Audio para síntese.
- 52 destinos isolados: 11 obras × escuta, alternativas, revelação e detalhe; oito telas gerais (início, instruções, transição, acerto, erro, revelação geral, pontuação e final). A revelação oferece seleção explícita entre seu áudio por obra e o áudio geral, sem sobreposição.
- Cada destino admite narração e ambiente MP3/WAV/OGG, texto equivalente, volume padrão e repetição de ambiente. Prévia, substituição, remoção e restauração dos originais disponíveis. Limite 40 MB por arquivo. Ambientes originais sem repetição encerram após 45 s.
- O gerenciamento usa senha local derivada com PBKDF2; bloqueia ao fechar, começar jogo e após cinco minutos sem interação. O Site continua owner-private. O bloqueio local protege a interface de uso casual no notebook e não é autenticação de servidor nem protege contra quem controla as ferramentas de desenvolvimento ou o perfil do navegador. Não existe gravação compartilhada no servidor.
- IndexedDB versão 2 armazena os arquivos reais e as configurações; gravações antigas são migradas para a escuta da obra correspondente. URLs temporárias são recriadas a partir dos bytes persistidos.
- Exportação JSON com arquivos em base64 e importação transacional, com validação de destinos, formatos, tamanho e reprodução de metadados. Limite 250 MB de áudio no pacote (350 MB do JSON importado). A senha local não é exportada. Configurações de destinos presentes substituem as correspondentes; os demais são preservados. Salvar antes de exportar.
- Preferências de reprodução automática são separadas; novos navegadores iniciam ambos os canais manualmente. Preferências anteriores de narração são respeitadas. Voz do navegador só pode ser escolhida quando o canal usa síntese; arquivo gravado com erro não sofre substituição silenciosa.
- Testes executados em Node com DOM e mecanismos de áudio substitutos: canais isolados e simultâneos, volumes, ducking gradual, troca de rodada, erros de MP3, 104 chaves de configuração, persistência em nova conexão IndexedDB, migração, exportação/importação dos bytes, restauração, validação atômica, senha, painel bloqueado, partida completa e sorteio/pontuação. O ambiente desta sessão continua sem a ferramenta de browser QA: responsividade visual, reprodução audível no dispositivo e leitor de tela real permanecem sem validação presencial.
- O código e o repositório do museu principal não foram modificados nesta atualização.

## Atualização de fluidez e preparação

Auditoria: a interface é JavaScript direto (não React). Os comandos de pausa da narração já chamavam HTMLAudioElement.pause ou speechSynthesis.pause; não havia timeout de um segundo nessa chamada. Foram identificados (1) o decaimento exponencial de 0,25 s do ambiente procedural, que deixava uma cauda audível, e (2) uma promessa de retomada que podia anunciar reprodução após uma pausa mais recente. A pausa procedural agora cancela automações, define ganho zero imediatamente e suspende o AudioContext. A narração protege a intenção de transporte com um contador de operações; eventos de início tardio reaplicam a pausa sem reiniciar o texto. MP3 conserva a instância e o currentTime na pausa/retomada. A mixagem continua suave e separada desses comandos.

A pausa acústica da Web Speech API é implementada pelo navegador/sistema operacional. Não é possível prometer latência audível zero com esse mecanismo a partir dos testes desta sessão. O painel de preparação informa essa limitação e prioriza arquivos gravados já configurados. Não se usa cancel-and-restart para fingir retomada precisa da síntese. Não foram geradas ou adicionadas narrações gravadas nesta atualização.

O início oferece PREPARAR EXPERIÊNCIA; voz, velocidade, envio de áudios, repetição, mixagem e modo de áudio da revelação ficam antes da partida. SALVAR E INICIAR JOGO fecha os painéis e bloqueia administração. Durante todas as rodadas, só permanecem transporte independente, repetição manual, silêncio, volume essencial, transcrição e descrição dos sons. Sair da partida requer confirmação. Preferências e arquivos personalizados são preservados no reinício e na saída.

Fragmentos locais de Vênus, Primavera e Papoulas compõem bordas fixas com opacidade de 4% a 6,5%. A decoração é aria-hidden, ignora ponteiros e é escondida durante escuta misteriosa e alternativas, e no alto contraste. A versão móvel reduz a decoração. Estilos de foco, transições curtas e redução de movimento preservados.

24 testes automatizados passaram, incluindo pausas em início/meio/fim, promessa de play pendente, pausa durante resume, pausa com canais simultâneos, reinício e mudança de rodada, preparo/salvamento, ocultação e bloqueio de acesso administrativo em jogo, saída confirmada, pontuação e cinco rodadas. Os mecanismos de mídia e DOM desses testes são substitutos controlados. Teste acústico em navegador real e inspeção visual nas resoluções pedidas não foram possíveis porque control-browser não está disponível. Não afirmar que o atraso audível da voz do dispositivo está comprovadamente eliminado. O museu ENTRE TELAS permaneceu sem alterações.

## Reprodução estritamente manual e preparação GitHub

Removidas as duas preferências e chamadas de autoplay, inclusive valores legados salvos. Mudanças de tela interrompem os players sincronamente antes de preparar a próxima configuração. Ajustar a velocidade da voz sintetizada não chama speak/play: só vale na próxima reprodução explícita. A prévia de administrador também verifica se seu pedido ainda está ativo após esperas assíncronas.

Arquivos aceitos: MP3, WAV, OGG, M4A, MPEG e MPG. Extensão é apenas um filtro inicial; assinatura, carregamento silencioso e decodeAudioData verificam conteúdo e codec no navegador. Erros orientam conversão para MP3. Não existe exigência de texto; uploads novos limpam texto anterior para evitar transcrição incorreta. Narrações sem texto deixam a transcrição indisponível, sem bloquear a reprodução. IndexedDB, pacote e migração preservados.

Fonte organizada em src/, public/, scripts/ e tests/. Workflow do GitHub Pages e configuração opcional de áudios incluídos no projeto. ZIP de código sem .git, .openai ou dados do navegador. Nenhum repositório externo foi criado. O site continua no endereço atual. Os testes automatizados incluem navegação silenciosa com flags legadas habilitadas, todas as obras com arquivos sem texto, troca e recarga de arquivos, validação silenciosa e caminhos em subpastas. Não houve teste em navegador real nesta sessão.
