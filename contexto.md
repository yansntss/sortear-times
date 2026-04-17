# Contexto do Projeto - Sorteio de Times

## 1. Objetivo do app
- Aplicacao web client-side para organizar peladas/futsal com:
- Cadastro de participantes disponiveis.
- Controle da ordem de chegada.
- Cadastro de jogadores a partir das chegadas.
- Sorteio de times com distribuicao por posicao.

## 2. Stack e arquitetura
- Stack: HTML + CSS + JavaScript vanilla (sem backend e sem framework).
- Persistencia local: localStorage do navegador.
- Arquitetura principal: classe TeamDrawApp em script.js gerencia estado, eventos, render e regras de sorteio.

Arquivos principais:
- index.html: estrutura da interface e IDs consumidos pelo JS.
- style.css: estilos globais, componentes e responsividade.
- script.js: logica de estado, eventos, validacoes e algoritmo de sorteio.

## 3. Modelos de dados (estado em memoria)
- players: lista de jogadores adicionados ao sorteio.
  - Campos: id, name, position.
- arrivals: ordem de chegada registrada.
  - Campos: id, name, time (texto), timestamp (numero).
- availablePeople: pessoas disponiveis para marcar chegada.
  - Campos: name, position (ou null).
- teams: resultado do sorteio.
  - Campos: id, name, players[], positions.

Chaves de persistencia em localStorage:
- players
- teams
- arrivals
- availablePeople

## 4. Fluxo funcional atual
1. Usuario pode cadastrar pessoas em Participantes Disponiveis, definindo habilidade/posicao opcional.
2. Usuario pode cadastrar participantes em lote (lista so com nome ou lista nome-posicao).
3. Usuario marca chegada selecionando um participante (registro automatico ao selecionar o nome).
4. Campo de adicionar jogador mostra apenas quem chegou e ainda nao foi adicionado.
5. Usuario adiciona jogador com habilidade/posicao opcional.
6. Botao de sorteio habilita apenas quando ha jogadores suficientes para preencher todos os times.
7. Sorteio gera os times e mostra cards com jogadores e informacoes de distribuicao.
8. Acao rapida Adicionar Todos e Sortear adiciona todos os chegados pendentes e tenta sortear automaticamente.
9. Opcao Ignorar ordem de chegada permite adicionar jogador e adicionar todos usando participantes cadastrados, sem depender de arrivals.

## 5. Regras de negocio implementadas
- Nao permite cadastrar pessoa duplicada em availablePeople (comparacao case-insensitive).
- Habilidade/posicao padronizada para apenas 3 categorias: zag, mei, atc.
- Dados antigos com posicoes anteriores sao normalizados automaticamente para as 3 categorias.
- Participante pode ter habilidade/posicao editada apos o cadastro, diretamente na lista de participantes.
- Cadastro em lote aceita lista com um nome por linha e trata formatos numerados (ex.: "1. Nome").
- Cadastro em lote possui flag de tipo de lista com 2 modos:
  - lista so com nome,
  - lista so com posicao (nome-posicao).
- Cadastro em lote usa a habilidade/posicao selecionada no formulario como padrao para os nomes importados.
- Cadastro em lote remove sufixo final entre parenteses (ex.: "Igor (convdd)" -> "Igor").
- Cadastro em lote ignora nomes vazios e duplicados (ja existentes ou repetidos no proprio lote).
- Nao permite adicionar jogador duplicado em players (comparacao case-insensitive).
- Habilidade/posicao e opcional no cadastro do jogador.
- Ao adicionar jogador sem informar habilidade/posicao manualmente, o sistema reaproveita os dados definidos no cadastro do participante.
- Jogador sem posicao informada entra na categoria sem-posicao para distribuicao.
- Quando Ignorar ordem de chegada esta ativo, a selecao de jogadores usa availablePeople em vez de arrivals.
- Quando Ignorar ordem de chegada esta ativo, Adicionar Todos e Sortear considera todos os participantes cadastrados pendentes.
- Sorteio exige no minimo numTeams * playersPerTeam jogadores cadastrados.
- Balanceamento por posicao:
  - Separa jogadores por posicao.
  - Distribui para o time com menor quantidade da posicao e, em empate, menor quantidade total de jogadores.
  - Distribui remanescentes para time com menos jogadores.
- Regra especial hardcoded:
  - Yan e Jhon Luxuria nao podem ficar no mesmo time.
  - Se ficarem juntos, o algoritmo tenta swap priorizando mesma posicao.

## 6. Comportamentos de UI relevantes
- Tela organizada por secoes: chegadas, configuracao, jogadores, sorteio e resultado.
- Listas de chegadas, jogadores e participantes com remocao individual.
- Chips de participantes exibem nome e habilidade/posicao cadastrados.
- Chips de participantes permitem editar habilidade/posicao por select inline, com salvamento imediato.
- No resultado do sorteio, a habilidade individual fica oculta; os cards exibem nome e posicao.
- Importacao em lote fica em bloco recolhivel (opcional), reduzindo poluicao visual no celular.
- Em telas pequenas, os controles principais usam alvos maiores e layout em coluna para facilitar toque.
- Barra de acoes fixa no mobile adiciona atalhos para Adicionar Todos e Sortear sem rolar a tela.
- Botao Limpar Cadastrados limpa toda a lista de participantes disponiveis (availablePeople) com confirmacao.
- Botao Limpar chegadas limpa apenas arrivals.
- Botao Limpar tudo limpa players, arrivals e teams (mantem availablePeople).

## 7. Pontos de atencao tecnicos
- Categorias de habilidade/posicao atuais sao zag, mei e atc.
- Interacoes de remocao de jogador/chegada usam onclick inline no HTML gerado por JS.
- IDs baseados em Date.now() podem colidir em cliques extremamente rapidos (baixo risco no uso atual).

## 8. Limites e escopo atual
- Sem autenticacao, sem multiusuario e sem sincronizacao em nuvem.
- Dados locais por navegador/dispositivo.
- Sem testes automatizados no repositorio.
- Sem pipeline de build; execucao direta abrindo index.html.

## 9. Diretrizes para evolucao (seguir daqui para frente)
- Preservar fluxo principal: participante -> chegada -> jogador -> sorteio.
- Manter compatibilidade com dados ja salvos em localStorage sempre que possivel.
- Evitar quebrar IDs e seletores usados em index.html/script.js.
- Se mudar regras de balanceamento, documentar claramente impacto esperado e casos de teste.
- Se adicionar nova regra especial de separacao/juncao de jogadores, tornar configuravel e nao hardcoded.
- Manter as categorias de habilidade/posicao em zag, mei e atc; novas categorias devem ser tratadas de forma configuravel.

## 10. Checklist de manutencao de contexto
- Atualizar este contexto.md sempre que houver alteracao relevante em:
  - comportamento de negocio,
  - arquitetura,
  - estrutura de dados,
  - fluxo de usuario,
  - regras de balanceamento,
  - persistencia/localStorage,
  - dependencias e forma de operacao.
- Em cada entrega, informar no resumo final se contexto.md foi atualizado.
