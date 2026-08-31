# Portfólio — Hermes da Costa Santos

Site estático (HTML, CSS, JS + Tailwind via CDN). Sem framework, sem build. Pronto para GitHub Pages.

## Publicar no GitHub Pages

1. Crie um repositório (por exemplo `portfolium` ou `HermesSantos.github.io`) e faça push desta pasta na branch `main`.
2. No GitHub: **Settings → Pages**.
3. Em **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
4. Salve. Em alguns minutos o site sobe em:
   - `https://hermessantos.github.io/portfolium/` (repo de projeto)
   - ou `https://hermessantos.github.io/` (se o repo se chamar `HermesSantos.github.io`)

Os caminhos dos assets são relativos (`css/app.css`, `js/app.js`). Funciona nos dois formatos.

## Local

Abra `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Conteúdo

Textos vêm do currículo. Idioma PT/EN no header (preferência no `localStorage`). Métricas do GitHub usam a API pública, com fallback estático se a API falhar.
