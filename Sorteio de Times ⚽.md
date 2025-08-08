# Sorteio de Times ⚽

Um aplicativo web simples e intuitivo para sortear times de forma balanceada, considerando a habilidade e posição dos jogadores.

## Funcionalidades

- ✅ **Configuração flexível**: Defina a quantidade de times e jogadores por time
- ✅ **Sistema de habilidades**: Classifique jogadores de 1 a 3 estrelas
- ✅ **Posições específicas**: Pivô, Fixo, Meio e Ala
- ✅ **Algoritmo de balanceamento**: Distribui jogadores de forma equilibrada
- ✅ **Interface responsiva**: Funciona em desktop e mobile
- ✅ **Estatísticas detalhadas**: Mostra força total e média dos times

## Como usar

1. **Configurar os times**:
   - Defina quantos times você quer criar (2-10)
   - Defina quantos jogadores por time (3-11)

2. **Adicionar jogadores**:
   - Digite o nome do jogador
   - Selecione a habilidade (1-3 estrelas)
   - Selecione a posição (Pivô, Fixo, Meio, Ala)
   - Clique em "Adicionar Jogador"

3. **Sortear times**:
   - Quando tiver jogadores suficientes, clique em "Sortear Times"
   - Os times serão criados automaticamente de forma balanceada

## Algoritmo de Balanceamento

O aplicativo usa um algoritmo inteligente que:

- **Distribui por posição**: Garante que cada time tenha jogadores de diferentes posições
- **Equilibra habilidades**: Distribui jogadores mais habilidosos entre os times
- **Minimiza diferenças**: Busca criar times com força total similar
- **Considera prioridades**: Prioriza distribuição de posições antes da força bruta

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design moderno com gradientes e animações
- **JavaScript ES6+**: Lógica de sorteio e manipulação do DOM
- **Design Responsivo**: Compatível com dispositivos móveis

## Estrutura dos Arquivos

```
sorteio-times/
├── index.html      # Estrutura principal da aplicação
├── style.css       # Estilos e design responsivo
├── script.js       # Lógica de sorteio e interações
└── README.md       # Este arquivo de documentação
```

## Como executar

1. Baixe todos os arquivos para uma pasta
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Não é necessário servidor web - funciona localmente

## Compatibilidade

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Exemplo de Uso

1. Configure para 2 times com 5 jogadores cada
2. Adicione 10 jogadores com diferentes habilidades e posições
3. Clique em "Sortear Times"
4. Veja os times balanceados e as estatísticas

## Recursos Avançados

- **Validação de entrada**: Impede jogadores duplicados
- **Feedback visual**: Mostra progresso e status
- **Remoção individual**: Remova jogadores específicos
- **Limpeza rápida**: Limpe todos os jogadores de uma vez
- **Informações de balanceamento**: Veja estatísticas detalhadas

---

Desenvolvido com ❤️ para facilitar a organização de jogos esportivos!

