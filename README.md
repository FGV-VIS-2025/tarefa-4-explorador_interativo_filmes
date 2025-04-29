#  Visualização Interativa do Oscar

Este projeto apresenta uma ferramenta interativa para explorar filmes **indicados ao Oscar**, por meio de três visualizações integradas:

1. **Gráfico de barras horizontal** que mostra os gêneros com mais indicações.
2. **Bubble chart** que posiciona cada filme com base na nota média (rating IMDb) e mostra a popularidade (número de votos) pelo tamanho da bolha. A cor indica se o filme ganhou um Oscar.
3. **Grafo de coautoria** onde os nós representam filmes e as arestas indicam conexões por equipe (atores, diretores ou roteiristas em comum).

### Funcionalidades
- Busca por ID (tconst) para visualizar conexões no grafo.
- Tooltips com informações ao passar o cursor.
- Tamanho do nó proporcional ao rating.
- Cores por gênero no grafo e por premiação no bubble chart.
- Animações suaves com `d3.forceSimulation()` e `d3.transition()`.
- Interface responsiva, desenvolvida em Svelte.

---

## Justificativa de Design

### Escolhas visuais

- **Bubble chart vs scatterplot:** optou-se pelo bubble chart com simulação por força (`forceSimulation`) para evitar sobreposição entre filmes com ratings e votos similares. Diferente do scatterplot tradicional, que tende a sobrepor pontos, o bubble chart oferece melhor uso do espaço e facilita a percepção de agrupamentos. O eixo X mantém o valor de rating explícito, e o tamanho da bolha comunica a relevância do filme.

- **Grafo de colaborações:** a escolha por grafo permite revelar relações ocultas entre os filmes indicados, formando comunidades criativas. Por exemplo, o filme *Parasite (2019)* surge como um **nó isolado**, sem vínculos com outros filmes indicados – destacando sua singularidade. Já filmes como *Snow White (1937)* integram clusters que compartilham diretores e animadores da Disney.

- **Cores:** no grafo, foi usada a paleta `d3.schemeCategory10` para diferenciar gêneros. No bubble chart, o dourado indica ganhadores do Oscar. As cores são intuitivas e garantem contraste suficiente.

- **Tooltips e interações:** tooltips móveis foram incluídos para detalhar cada filme sem poluir a tela. No bubble chart, o clique destaca filmes; no grafo, o usuário pode buscar um ID para revelar seu entorno relacional.

- **Animações:** as transições com `d3.transition()` e simulações com `d3.forceSimulation()` melhoram a fluidez das atualizações e tornam a exploração mais envolvente.

### Alternativas consideradas

- **Gráfico de dispersão:** descartado por dificultar a leitura em regiões de alta densidade.
- **Filtros múltiplos:** considerados, mas substituídos por busca direta para manter o foco exploratório e comparativo.
- **Outros layouts de grafo:** circular ou hierárquico foram descartados por não representar bem a topologia relacional entre filmes.

---

## Processo de Desenvolvimento

Amanda foi responsável por todas as etapas:
- Limpeza e fusão dos dados (IMDb + indicações ao Oscar).
- Criação do grafo com agrupamento por componente conexa.
- Construção do bubble chart com escalas e simulação.
- Integração dos componentes em Svelte e estilização da interface.

---

## Fontes e Inspirações

- **Dados:** IMDb Datasets + Dataset externo de indicações ao Oscar
- **Visualizações:**
  - Grafo com força: https://github.com/vasturiano/force-graph
  - Bubble chart com força e eixo: https://observablehq.com/@d3/bubble-chart

---

Este projeto foi desenvolvido como parte de uma atividade de visualização interativa no curso. Seu foco é permitir a **exploração intuitiva** das conexões criativas e do reconhecimento dos filmes indicados ao Oscar.