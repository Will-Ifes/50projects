"""Gera o index.html da vitrine a partir de projetos.json.

Uso (na raiz do repositório):  python scripts/gerar_vitrine.py

Os cards ficam no HTML final (funcionam sem JavaScript); o vitrine.js só filtra.
"""

import html
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REPO = "https://github.com/Will-Ifes/50projects/tree/master/projetos"


def card(projeto: dict) -> str:
    pasta = projeto["pasta"]
    numero = pasta[:2]
    nome = html.escape(projeto["nome"])
    descricao = html.escape(projeto["descricao"])
    categoria = html.escape(projeto["categoria"])
    melhorado = projeto.get("melhorado", False)
    selo = '\n                    <span class="selo-melhorado">Melhorado</span>' if melhorado else ""
    busca_texto = projeto["nome"] + " " + projeto["descricao"] + " " + projeto["categoria"] + (" melhorado" if melhorado else "")
    return f"""
            <li class="card" data-categoria="{categoria}" data-melhorado="{str(melhorado).lower()}" data-busca="{html.escape(busca_texto.lower())}">
                <a class="card-link" href="projetos/{pasta}/">
                    <img src="miniaturas/{pasta}.webp" width="480" height="300" alt="" loading="lazy">
                    <span class="card-numero" aria-hidden="true">{numero}</span>{selo}
                    <h3>{nome}</h3>
                </a>
                <p>{descricao}</p>
                <div class="card-rodape">
                    <span class="tag">{categoria}</span>
                    <a class="card-codigo" href="{REPO}/{pasta}" target="_blank" rel="noopener noreferrer">
                        Código<span class="sr-only"> de {nome} no GitHub</span>
                    </a>
                </div>
            </li>"""


def main():
    projetos = json.loads((RAIZ / "projetos.json").read_text(encoding="utf-8"))
    categorias = sorted({p["categoria"] for p in projetos})
    melhorados = sum(1 for p in projetos if p.get("melhorado"))
    filtros = f'                <button type="button" class="filtro" aria-pressed="false" data-filtro="__melhorado">★ Melhorados ({melhorados})</button>\n'
    filtros += "\n".join(
        f'                <button type="button" class="filtro" aria-pressed="false" data-filtro="{html.escape(c)}">{html.escape(c)}</button>'
        for c in categorias
    )
    cards = "".join(card(p) for p in projetos)

    modelo = (RAIZ / "scripts" / "modelo_vitrine.html").read_text(encoding="utf-8")
    pagina = (
        modelo.replace("{{TOTAL}}", str(len(projetos)))
        .replace("{{FILTROS}}", filtros)
        .replace("{{CARDS}}", cards)
    )
    (RAIZ / "index.html").write_text(pagina, encoding="utf-8")
    print(f"index.html gerado com {len(projetos)} projetos e {len(categorias)} categorias.")


if __name__ == "__main__":
    main()
