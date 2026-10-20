# Advance Business Solution — Website

Landing page for Advance Business Solution, a Mumbai-based custom software and .NET development company.

## Structure

- `docs/index.html` — home page (edit this by hand)
- `docs/about.html`, `docs/contact.html`, `docs/404.html`, `docs/solutions/*.html` — generated pages
- `docs/styles.css` — styles (cobalt, navy and signal orange)
- `docs/main.js` — animations, solution filter, enquiry form (shared by all pages)
- `tools/build_pages.py` — builds the generated pages, reusing the home page's header and footer

After changing the header or footer in `index.html`, or the page content in `tools/build_pages.py`, rebuild:

```bash
python3 tools/build_pages.py
```

No other build step or dependencies. GitHub Pages serves the site from the `docs/` folder on `main`.

Live site: https://tzee-pixel.github.io/advance-business-solution/

To preview locally, run any static server, for example:

```bash
cd docs && python3 -m http.server 4173
```

## Before publishing

- Case-study technology and outcome numbers are placeholders marked "confirm".
- Database and hosting in the Technology section are placeholders.
- The enquiry form is not connected to email yet.
- Solution page descriptions and module lists are drafts written from each solution's name. Review them.
