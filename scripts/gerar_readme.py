"""Gera o README.md a partir de scripts/modelo_readme.md e projetos.json.

Uso (na raiz do repositório):  python scripts/gerar_readme.py
"""

import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PAGES = "https://will-ifes.github.io/50projects"


def main():
    projetos = json.loads((RAIZ / "projetos.json").read_text(encoding="utf-8"))
    linhas = ["| # | Projeto | Categoria | O que faz |", "| --- | --- | --- | --- |"]
    for p in projetos:
        pasta = p["pasta"]
        estrela = " ★" if p.get("melhorado") else ""
        linhas.append(
            f"| {pasta[:2]} | [{p['nome']}]({PAGES}/projetos/{pasta}/){estrela} · [código](projetos/{pasta}) "
            f"| {p['categoria']} | {p['descricao']} |"
        )
    modelo = (RAIZ / "scripts" / "modelo_readme.md").read_text(encoding="utf-8")
    readme = modelo.replace("{{TOTAL}}", str(len(projetos))).replace("{{TABELA}}", "\n".join(linhas))
    (RAIZ / "README.md").write_text(readme, encoding="utf-8")
    print("README.md gerado.")


if __name__ == "__main__":
    main()
