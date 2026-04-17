# Contexto do Projeto - Sorteio de Times

## 1. Objetivo do app
- Aplicacao web client-side para organizar peladas/futsal com:
- Cadastro de participantes disponiveis.
- Controle da ordem de chegada.
- Cadastro de jogadores (com habilidade e posicao) a partir das chegadas.
- Sorteio de times com balanceamento por habilidade e distribuicao de posicoes.

## 2. Stack e arquitetura
- Stack: HTML + CSS + JavaScript vanilla (sem backend e sem framework).
- Persistencia local: localStorage do navegador.
- Arquitetura principal: classe TeamDrawApp em script.js gerencia estado, eventos, render e regras de sorteio.

Arquivos principais:
- index.html: estrutura da interface e IDs consumidos pelo JS.
- style.css: estilos globais, componentes e responsividade.
- script.js: logica de estado, eventos, validacoes e algoritmo de balanceamento.

## 3. Modelos de dados (estado em memoria)
- players: lista de jogadores adicionados ao sorteio.
  - Campos: id, name, skill (1-3), position.
- arrivals: ordem de chegada registrada.
  - Campos: id, name, time (texto), timestamp (numero).
- availablePeople: pessoas disponiveis para marcar chegada.
  - Campos: name, skill (1-3 ou null), position (ou null).
- teams: resultado do sorteio.
  - Campos: id, name, players[], totalSkill, positions.

Chaves de persistencia em localStorage:
- players
- teams
- arrivals
- availablePeople

## 4. Fluxo funcional atual
1. Usuario pode cadastrar pessoas em Participantes Disponiveis, definindo nivel e habilidade/posicao ja no cadastro.
2. Usuario tambem pode cadastrar participantes em lote colando lista no front.
3. Usuario marca chegada selecionando um participante.
4. Campo de adicionar jogador mostra apenas quem chegou e ainda nao foi adicionado.
5. Usuario adiciona jogador com habilidade e posicao opcionais.
6. Botao de sorteio habilita apenas quando ha jogadores suficientes para preencher todos os times.
7. Sorteio gera os times, mostra cards com jogadores e estatisticas de balanceamento.
8. Acao rapida "Adicionar Todos e Sortear" adiciona todos os chegados pendentes com habilidade/posicao nao informadas e tenta sortear automaticamente.
9. Opcao "Ignorar ordem de chegada" permite adicionar jogador e adicionar todos usando todos os participantes cadastrados, sem depender de arrivals.

## 5. Regras de negocio implementadas
- Nao permite cadastrar pessoa duplicada em availablePeople (comparacao case-insensitive).
- Participante pode ser cadastrado com nivel (1-3) e habilidade/posicao opcionais.
- Habilidade/posicao foi padronizada para apenas 3 categorias: zag, mei, atc.
- Dados antigos com posicoes anteriores sao normalizados automaticamente para as 3 categorias.
- Cadastro em lote aceita lista com um nome por linha e trata formatos numerados (ex.: "1. Nome").
- Cadastro em lote aceita o padrao nome-nivel-posicao (ex.: "William-2-zag"), com nivel restrito a 1, 2 ou 3.
- Cadastro em lote possui flag de tipo de lista com 3 modos:
  - lista sem nivel e posicao (somente nome),
  - lista com nivel e posicao (nome-nivel-posicao),
  - lista so com posicao (nome-posicao).
- Cadastro em lote usa o nivel e habilidade/posicao selecionados no formulario como padrao para os nomes importados.
- Cadastro em lote remove sufixo final entre parenteses (ex.: "Igor (convdd)" -> "Igor").
- Cadastro em lote ignora nomes vazios e duplicados (ja existentes ou repetidos no proprio lote).
- Nao permite adicionar jogador duplicado em players (comparacao case-insensitive).
- Habilidade e posicao sao opcionais no cadastro do jogador.
- Ao adicionar jogador sem informar habilidade/posicao manualmente, o sistema reaproveita os dados definidos no cadastro do participante.
- Jogador sem habilidade informada entra com peso 0 no calculo de forca.
- Jogador sem posicao informada entra na categoria sem-posicao para distribuicao.
- Quando "Ignorar ordem de chegada" esta ativo, a selecao de jogadores usa availablePeople em vez de arrivals.
- Quando "Ignorar ordem de chegada" esta ativo, "Adicionar Todos e Sortear" considera todos os participantes cadastrados pendentes.
- Sorteio exige no minimo numTeams * playersPerTeam jogadores cadastrados.
- Balanceamento por posicao e habilidade:
  - Separa jogadores por posicao.
  - Ordena por habilidade decrescente dentro de cada posicao.
  - Distribui para o time com menor quantidade da posicao e, em empate, menor forca total.
  - Distribui remanescentes para time com menos jogadores e menor forca.
- Regra especial hardcoded:
  - Yan e Jhon Luxuria nao podem ficar no mesmo time.
  - Se ficarem juntos, o algoritmo tenta swap com outro time priorizando mesma posicao e menor diferenca de habilidade.

## 6. Comportamentos de UI relevantes
- Tela organizada por secoes: chegadas, configuracao, jogadores, sorteio e resultado.
- Listas de chegadas, jogadores e participantes com remocao individual.
- Chips de participantes exibem nome, nivel e habilidade/posicao cadastrados.
- Botao Limpar Cadastrados limpa toda a lista de participantes disponiveis (availablePeople) com confirmacao.
- Botao Limpar chegadas limpa apenas arrivals.
- Botao Limpar tudo limpa players, arrivals e teams (mantem availablePeople).
- Botao "Adicionar Todos e Sortear" usa os nomes da ordem de chegada que ainda nao viraram jogadores e executa sorteio se atingir minimo.
- Checkbox "Ignorar ordem de chegada" troca a fonte do seletor de jogador e da acao rapida para participantes cadastrados.
- Interface responsiva para tablet/mobile via media queries em 768px e 480px.

## 7. Pontos de atencao tecnicos
- Categorias de habilidade/posicao atuais sao zag, mei e atc. A normalizacao mantem compatibilidade com registros legados.
- Interacoes de remocao usam onclick inline no HTML gerado por JS.
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