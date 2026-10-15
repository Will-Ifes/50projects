"""Correções pontuais de acessibilidade apontadas pelo axe em cada projeto.

Uso (na raiz do repositório):  python scripts/corrigir_a11y.py

Cada troca precisa encontrar o trecho original; se não encontrar e a troca ainda
não tiver sido aplicada, o script para com erro, para nada passar despercebido.
"""

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent / "projetos"

# (arquivo, trecho original, trecho novo, substituir todas as ocorrências?)
TROCAS = [
    # Ordem de títulos: o h1 da página vem antes; h3/h4 viram nível 2 sem mudar o CSS
    ("01-expanding-cards/index.html", "<h3>", '<h3 aria-level="2">', True),
    ("03-rotating-navigation/index.html", "<h3>My Dog</h3>", '<h3 aria-level="2">My Dog</h3>', False),
    ("10-dad-jokes/index.html", "<h3>", '<h3 aria-level="2">', True),
    ("12-faq-collapse/index.html", '<h3 class="faq-title">', '<h3 class="faq-title" aria-level="2">', True),
    ("13-random-choice-picker/index.html", "<h3>", '<h3 aria-level="2">', True),
    ("16-drink-water/index.html", "<h3>Goal", '<h3 aria-level="2">Goal', False),
    ("17-movie-app/script.js", "<h3>", '<h3 aria-level="2">', True),
    ("24-content-placeholder/index.html", '<h3 class="card-title', '<h3 aria-level="2" class="card-title', False),
    ("37-pokedex/script.js", '<h3 class="name">', '<h3 class="name" aria-level="2">', False),
    ("40-testimonial-box-switcher/index.html", '<h4 class="username">', '<h4 class="username" aria-level="2">', False),

    # Botões só com ícone ganham nome acessível
    ("03-rotating-navigation/index.html", '<button id="close">', '<button id="close" aria-label="Fechar menu">', False),
    ("03-rotating-navigation/index.html", '<button id="open">', '<button id="open" aria-label="Abrir menu">', False),
    ("04-hidden-search/index.html", '<button class="btn">', '<button class="btn" aria-label="Mostrar busca">', False),
    ("04-hidden-search/index.html", '<input type="text" class="input" placeholder="Search...">',
     '<input type="search" class="input" placeholder="Search..." aria-label="Buscar">', False),
    ("12-faq-collapse/index.html", '<button class="faq-toggle">', '<button class="faq-toggle" aria-label="Mostrar ou esconder resposta">', True),
    ("14-animated-navigation/index.html", '<button class="icon" id="toggle">', '<button class="icon" id="toggle" aria-label="Recolher ou expandir menu">', False),
    ("18-background-slider/index.html", '<button class="arrow left-arrow" id="left">', '<button class="arrow left-arrow" id="left" aria-label="Slide anterior">', False),
    ("18-background-slider/index.html", '<button class="arrow right-arrow" id="right">', '<button class="arrow right-arrow" id="right" aria-label="Próximo slide">', False),
    ("26-vertical-slider/index.html", '<button class="down-button">', '<button class="down-button" aria-label="Slide anterior">', False),
    ("26-vertical-slider/index.html", '<button class="up-button">', '<button class="up-button" aria-label="Próximo slide">', False),
    ("31-password-generator/index.html", '<button class="btn" id="clipboard">', '<button class="btn" id="clipboard" aria-label="Copiar senha">', False),

    # Campos sem rótulo associado
    ("08-form-input-wave/index.html", '<input type="text" required>', '<input type="text" id="email" autocomplete="email" required>', False),
    ("08-form-input-wave/index.html", "<label>Email</label>", '<label for="email">Email</label>', False),
    ("08-form-input-wave/index.html", '<input type="password" required>', '<input type="password" id="password" autocomplete="current-password" required>', False),
    ("08-form-input-wave/index.html", "<label>Password</label>", '<label for="password">Password</label>', False),
    # Link dentro de texto precisa de algo além da cor
    ("08-form-input-wave/style.css", ".container a {\n    text-decoration: none;", ".container a {\n    text-decoration: underline;", False),
    ("22-drawing-app/index.html", '<input type="color" id="color">', '<input type="color" id="color" aria-label="Cor do pincel">', False),
    ("31-password-generator/index.html", '<label >Password Length</label>', '<label for="length">Password Length</label>', False),
    ("31-password-generator/index.html", '<label >Include uppercase letters</label>', '<label for="uppercase">Include uppercase letters</label>', False),
    ("31-password-generator/index.html", '<label >Include lowercase letters</label>', '<label for="lowercase">Include lowercase letters</label>', False),
    ("31-password-generator/index.html", '<label >Include numbers</label>', '<label for="numbers">Include numbers</label>', False),
    ("31-password-generator/index.html", '<label >Include symbols</label>', '<label for="symbols">Include symbols</label>', False),
]

# Contraste: (arquivo, regex da cor original, cor nova). A cor nova é a mais próxima que passa AA.
CORES = [
    ("02-progress-steps/style.css", r"#3498db", "#1f6fb2"),          # 3.15 -> 5.3 com branco
    ("10-dad-jokes/style.css", r"#9f68e0", "#7a45c0"),               # 3.79 -> 6.0
    ("16-drink-water/style.css", r"#3494e4", "#1a6fb8"),             # 3.22 -> 5.4
    ("19-theme-clock/style.css", r"#aaa\b|#aaaaaa", "#6b6b6b"),      # 2.32 -> 5.3 no tema claro
    ("24-content-placeholder/style.css", r"#777\b|#777777", "#666666"),  # 4.47 -> 5.7
    ("25-sticky-navbar/style.css", r"#f8301f", "#ff5a4a"),           # 4.11 -> 5.2 no menu escuro
    ("26-vertical-slider/index.html", r"#FFB866", "#a35f12"),        # 1.7 -> 5.0 com texto branco
    ("33-notes-app/style.css", r"#9ec862", "#4c7a1a"),               # 1.92 -> 5.2
    ("38-mobile-tab-navigation/style.css", r"#888\b|#888888", "#666666"),  # 3.54 -> 5.7
]


def main():
    erros = []
    for arquivo, de, para, todas in TROCAS:
        caminho = RAIZ / arquivo
        texto = caminho.read_text(encoding="utf-8")
        if para in texto and de not in texto.replace(para, ""):
            continue  # já aplicado
        if de not in texto:
            erros.append(f"{arquivo}: não encontrei {de!r}")
            continue
        texto = texto.replace(de, para) if todas else texto.replace(de, para, 1)
        caminho.write_text(texto, encoding="utf-8")

    for arquivo, padrao, cor in CORES:
        caminho = RAIZ / arquivo
        texto = caminho.read_text(encoding="utf-8")
        novo, n = re.subn(padrao, cor, texto, flags=re.I)
        if n == 0 and cor not in texto:
            erros.append(f"{arquivo}: cor {padrao} não encontrada")
        caminho.write_text(novo, encoding="utf-8")

    if erros:
        print("\n".join(erros))
        sys.exit(1)
    print("Correções aplicadas.")


if __name__ == "__main__":
    main()
