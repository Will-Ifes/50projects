"""Aplica a estrutura comum da vitrine a todos os projetos.

Uso (na raiz do repositório):  python scripts/estruturar.py

Idempotente: projetos que já têm o marcador "vitrine-main" são ignorados.
Para cada projetos/NN-nome/index.html:
- título "NN · Nome | 50 Projetos"
- liga comum/vitrine.css
- <nav> com link de volta para a vitrine
- <main class="vitrine-main"> envolvendo o conteúdo (se ainda não houver <main>)
- <h1> só para leitor de tela quando a página não tem h1
"""

import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = json.loads((RAIZ / "projetos.json").read_text(encoding="utf-8"))


def estruturar(pasta: Path, nome: str, numero: str):
    arquivo = pasta / "index.html"
    html = arquivo.read_text(encoding="utf-8")
    if "vitrine-main" in html:
        return "já estruturado"

    html = re.sub(r"<title>.*?</title>", f"<title>{numero} · {nome} | 50 Projetos</title>", html, count=1, flags=re.S)
    html = html.replace("</head>", '    <link rel="stylesheet" href="../../comum/vitrine.css">\n</head>', 1)

    voltar = (
        '\n    <nav class="vitrine-nav" aria-label="Vitrine">'
        '<a class="vitrine-voltar" href="../../">← Vitrine</a></nav>'
    )
    titulo = "" if re.search(r"<h1[\s>]", html) else f'\n    <h1 class="vitrine-sr">{nome}</h1>'

    if re.search(r"<main[\s>]", html):
        # Já tem landmark principal: só adiciona navegação e título
        html = re.sub(r"(<body[^>]*>)", lambda m: m.group(1) + voltar, html, count=1)
        html = re.sub(r"(<main[^>]*>)", lambda m: m.group(1) + titulo, html, count=1)
        html = html.replace("<main", '<main data-vitrine="vitrine-main"', 1)
    else:
        html = re.sub(
            r"(<body[^>]*>)",
            lambda m: m.group(1) + voltar + '\n    <main class="vitrine-main">' + titulo,
            html,
            count=1,
        )
        html = html.replace("</body>", "    </main>\n</body>", 1)

    arquivo.write_text(html, encoding="utf-8")
    return "ok"


def main():
    for projeto in CATALOGO:
        pasta = RAIZ / "projetos" / projeto["pasta"]
        print(f'{projeto["pasta"]}: {estruturar(pasta, projeto["nome"], projeto["pasta"][:2])}')


if __name__ == "__main__":
    main()
