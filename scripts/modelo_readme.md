<p align="center">
  <a href="https://will-ifes.github.io/50projects/">
    <img src="./.github/readme-cover.svg" alt="50 Projetos. Vitrine com 40 mini projetos de HTML, CSS e JavaScript." width="100%" />
  </a>
</p>

# 50 Projetos · vitrine de HTML, CSS e JavaScript

{{TOTAL}} mini projetos feitos durante o curso *50 Projects in 50 Days* (Brad Traversy e Florin Pop), reunidos numa vitrine com busca e filtros, revisados para acessibilidade e com melhorias próprias em alguns deles.

**HTML · CSS · JavaScript puro** · [Abrir a vitrine](https://will-ifes.github.io/50projects/)

<p align="center">
  <a href="https://will-ifes.github.io/50projects/">
    <img src="./.github/demo.gif" alt="Demonstração da vitrine atual, da Pokédex e do gerador de senhas. Clique para explorar os projetos." width="720" />
  </a>
  <br />
  <sub>Clique na demonstração para abrir a vitrine publicada.</sub>
</p>

## O que mudou na revisão

| Antes | Depois |
| --- | --- |
| 39 pastas `project1` a `project39`, sem índice | Pastas `NN-nome-do-projeto` e uma vitrine com miniatura, busca sem acento e filtro por categoria |
| Pokédex e Testimonial também em repositórios separados | Tudo neste repositório; os separados podem ser arquivados |
| Recursos quebrados em 5 projetos | Imagens de sites que saíram do ar, caminho absoluto dos sons, URL de fonte malformada, serviço `source.unsplash.com` desativado e `script.js` inexistente: todos corrigidos |
| Violações de acessibilidade em quase todos | **0 violações no axe-core nos {{TOTAL}} projetos**: `<main>`, `h1`, rótulos, nomes de botões, contraste e ordem de títulos |
| Sem caminho de volta | Link "← Vitrine" fixo em cada projeto, foco visível e `prefers-reduced-motion` em todos |

A estrutura comum é aplicada por script, sem mudar o layout de cada projeto: o `<main>` usa `display: contents`, porque muitos projetos centralizam os filhos do `body` com flexbox.

## Melhorias além do curso ★

| Projeto | O que ganhou |
| --- | --- |
| **Pokédex** | Gerações I a IX, busca por nome ou número, filtro por tipo com as cores oficiais, ordenação por força, favoritos salvos no navegador e ficha em `<dialog>` com arte oficial, atributos, habilidades, evoluções clicáveis, grito do Pokémon e navegação anterior/próximo. Antes buscava 898 Pokémon um por um e levava minutos. |
| **Password Generator** | Senhas com `crypto.getRandomValues` (antes `Math.random`) e sem a sequência fixa minúscula → maiúscula → número → símbolo, que tornava a senha previsível; medidor de força por entropia; cópia com aviso acessível em vez de `alert`. |
| **GitHub Profiles** | Nome e bio escapados antes de entrar no HTML (antes permitiam injetar HTML pela bio), repositórios ordenados por estrelas com linguagem, erros de usuário inexistente, limite da API e sem rede, e `fetch` no lugar do axios. |
| **Movie App** | Filmes e sinopses em português, busca codificada corretamente, conteúdo escapado, pôster ausente, estados de vazio e erro e sinopse visível também pelo teclado. |
| **Drawing App** | Pointer events (mouse, toque e caneta), botão para salvar em PNG, traço arredondado e canvas que cabe no celular. |

## Projetos

{{TABELA}}

## Como manter

Tudo é gerado a partir de [`projetos.json`](projetos.json):

```bash
python scripts/estruturar.py      # aplica <main>, h1, título e link de volta em projetos novos
python scripts/corrigir_a11y.py   # correções pontuais de acessibilidade (idempotente)
python scripts/gerar_vitrine.py   # regenera o index.html da vitrine
python scripts/gerar_readme.py    # regenera este README
```

Para rodar localmente basta um servidor estático na raiz:

```bash
python -m http.server 8080
```

## Observações

- O **Movie App** usa uma chave pública da API do TMDB que veio do curso e já estava no repositório. Num site estático não há como escondê-la; para uso próprio, gere a sua em [themoviedb.org](https://www.themoviedb.org/settings/api).
- As interfaces dos projetos continuam em inglês, como no curso. A vitrine, os textos novos e o Movie App estão em português.

---

Mantido por **Will Oliveira** · [Perfil](https://github.com/Will-Ifes) · [LinkedIn](https://www.linkedin.com/in/wildemberg-de-jesus-oliveira/)
