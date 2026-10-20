#!/usr/bin/env python3
"""Build the inner pages of the site from docs/index.html.

The header and footer are copied from the home page so every page stays in sync.
Run after editing index.html or the page content below:

    python3 tools/build_pages.py
"""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
NAME = "Advance Business Solution"

home = (DOCS / "index.html").read_text()


def block(src, start, end):
    a = src.index(start)
    b = src.index(end, a) + len(end)
    return src[a:b]


HEADER = block(home, '<header class="site-header">', "</header>")
FOOTER = block(home, '<footer class="site-footer">', "</footer>")
FORM = block(home, '<form class="enquiry" id="enquiry" novalidate>', "</form>")


def relink(fragment, prefix, current=None):
    """Point home-page anchors and pages at the right place from an inner page."""
    out = re.sub(r'href="#top"', f'href="{prefix}index.html"', fragment)
    out = re.sub(r'href="#start"', f'href="{prefix}contact.html"', out)
    out = re.sub(r'href="#([\w-]+)"', rf'href="{prefix}index.html#\1"', out)
    out = re.sub(r'href="(about|contact)\.html"', rf'href="{prefix}\1.html"', out)
    out = re.sub(r'href="solutions/', f'href="{prefix}solutions/', out)
    if current:
        out = out.replace(f'href="{prefix}{current}">', f'href="{prefix}{current}" aria-current="page">', 1)
    return out


def page(path, title, description, body, current=None, prefix=None):
    # 404.html is served at any depth, so it uses absolute links
    if prefix is None:
        prefix = "../" * path.count("/")
    header = relink(HEADER, prefix, current)
    # the footer's back-to-top link should stay on the current page
    footer = relink(FOOTER, prefix).replace(f'href="{prefix}index.html" class="to-top"', 'href="#top" class="to-top"')
    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}">
  <meta name="theme-color" content="#2f4bff">
  <link rel="icon" href="{prefix}favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{html.escape(title)}">
  <meta property="og:description" content="{html.escape(description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap">
  <link rel="stylesheet" href="{prefix}styles.css">
</head>
<body class="inner">
  <a class="skip" href="#main">Skip to content</a>

  {header}

  <main id="main">
{body}
  </main>

  {footer}

  <script src="{prefix}main.js" defer></script>
</body>
</html>
"""
    out = DOCS / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc)
    print("wrote", out.relative_to(ROOT))


def cta_band(prefix, heading="Have a process like this?", text="Tell us how your business works. We'll show you what we'd build."):
    return f"""
    <section class="sp-cta">
      <div class="wrap sp-cta-in">
        <div>
          <p class="tag">Start a project</p>
          <h2 class="draw">{heading}</h2>
          <p class="sec-lede">{text}</p>
        </div>
        <a class="btn btn-accent" href="{prefix}contact.html">Start a Project <span aria-hidden="true">→</span></a>
      </div>
    </section>"""


# ---------------------------------------------------------------------------
# Solutions. Wording is a draft written from each solution's name; review it
# with the team before relying on it. Technology and outcomes stay "confirm".
# ---------------------------------------------------------------------------
SECTOR_COLOR = {"real-estate": "var(--brand)", "healthcare": "#0b7d5d", "distribution": "#c7820a", "other": "#5a2fe0"}

SOLUTIONS = [
    dict(slug="rera-document-management", code="RERA", name="RERA Document Management", sector="Real estate", key="real-estate",
         type="Document management", client=None,
         summary="One organised home for the documents every real estate project needs under RERA.",
         problem="RERA compliance means keeping registrations, approvals, progress reports and agreements for every project. These usually sit across shared folders, email and paper files, which makes them slow to find when they are needed.",
         modules=[("Project library", "Documents organised project by project."),
                  ("Uploads and versions", "Every revision kept, with the latest one clear."),
                  ("Search", "Find a document by project, type or date."),
                  ("Role-based access", "Each team sees what it needs.")]),
    dict(slug="construction-inventory", code="CIM", name="Real Estate Construction Inventory Management", sector="Real estate", key="real-estate",
         type="Inventory", client=None,
         summary="Construction materials tracked from purchase to use, across every site.",
         problem="Materials move between suppliers, stores and construction sites. Without a single record, it is hard to see what is in stock, what was used where, and what needs ordering.",
         modules=[("Material receipts", "Record what arrives and from whom."),
                  ("Site-wise stock", "See stock levels for each site."),
                  ("Issues and usage", "Track what is issued and consumed."),
                  ("Stock reports", "Clear reports for site and head office.")]),
    dict(slug="task-management", code="TASKS", name="Task Management", sector="Real estate", key="real-estate",
         type="Workflow & tasks", client="Birla Real Estate",
         summary="Project tasks, owners and due dates in one place for every team.",
         problem="Tasks across teams and projects were tracked through email, calls and spreadsheets, making it hard to see who owned what and what was overdue.",
         modules=[("Task assignment", "Every task has an owner."),
                  ("Status tracking", "Progress visible at a glance."),
                  ("Due dates", "Deadlines that are easy to follow."),
                  ("Team reports", "Summaries for managers and leadership.")]),
    dict(slug="inventory-order-management", code="ORDERS", name="Inventory & Order Management", sector="Distribution", key="distribution",
         type="Inventory & orders", client="Neptune Marketing",
         summary="Inventory and orders running from the same data, from order entry to dispatch.",
         problem="Stock and orders were tracked separately, which made availability and dispatch status hard to see.",
         modules=[("Stock records", "Current stock for every product."),
                  ("Order entry", "Orders captured in one system."),
                  ("Dispatch tracking", "Know what has shipped."),
                  ("Reports", "Sales and stock reports on demand.")]),
    dict(slug="building-material-supply", code="BMS", name="Building Material Supply", sector="Construction supply", key="distribution",
         type="Supply & orders", client=None,
         summary="Orders, stock and deliveries for a building material supply business.",
         problem="Supplying building materials involves many orders, products and deliveries. Managing them in spreadsheets makes errors and delays more likely.",
         modules=[("Customer orders", "Every order recorded once."),
                  ("Stock", "Know what is available to supply."),
                  ("Deliveries", "Track what goes out and where."),
                  ("Reports", "Clear numbers for the business.")]),
    dict(slug="patient-token-management", code="TOKENS", name="Patient Token Management", sector="Healthcare", key="healthcare",
         type="Queue management", client="Diagnostic centres",
         summary="A calmer, ordered queue at the front desk of a diagnostic centre.",
         problem="Walk-in patients were queued manually, with no clear order or waiting status for staff or patients.",
         modules=[("Token issue", "A number for every patient on arrival."),
                  ("Calling in order", "Staff call the next patient with one action."),
                  ("Queue display", "Patients can see where they are."),
                  ("Daily counts", "A simple record of each day's visits.")]),
    dict(slug="gcc-web-application", code="GCC", name="GCC Web-Based Application", sector="Web application", key="other",
         type="Custom web application", client=None,
         summary="A custom web-based application, designed, built and supported by our team.",
         problem="The business needed a web-based system built around its own process rather than a packaged product.",
         modules=[("Web access", "Works in the browser, no installs."),
                  ("User roles", "Access set for each type of user."),
                  ("Records", "Data kept in one structured system."),
                  ("Reports", "The numbers the team needs.")]),
]


def solution_page(sol):
    prefix = "../"
    others = [o for o in SOLUTIONS if o is not sol]
    related = [o for o in others if o["key"] == sol["key"]][:2]
    related += [o for o in others if o not in related][: 3 - len(related)]
    client = sol["client"] or '<span class="tbc">confirm</span>'
    mods = "\n".join(
        f'''          <li class="mod reveal"><span class="mono">{i + 1:02d}</span><h3>{html.escape(t)}</h3><p>{html.escape(d)}</p></li>'''
        for i, (t, d) in enumerate(sol["modules"]))
    rel = "\n".join(
        f'''          <li class="sol" data-sector="{o['key']}"><span class="mono sol-n">{i + 1:02d}</span><span class="mono sol-code">{o['code']}</span><span class="sol-name">{html.escape(o['name'])}</span><span class="sol-sector mono">{o['sector']}</span><span class="sol-type">{html.escape(o['type'])}</span><a class="sol-link" href="{o['slug']}.html"><span class="sr-only">View {html.escape(o['name'])}</span></a></li>'''
        for i, o in enumerate(related))
    body = f"""
    <section class="sp-hero" id="top" style="--sec: {SECTOR_COLOR[sol['key']]}">
      <div class="plusgrid dark" aria-hidden="true"></div>
      <div class="wrap sp-hero-in">
        <nav class="crumbs mono" aria-label="Breadcrumb"><a href="{prefix}index.html">Home</a><span aria-hidden="true">/</span><a href="{prefix}index.html#portfolio">Solutions</a><span aria-hidden="true">/</span><span aria-current="page">{html.escape(sol['name'])}</span></nav>
        <p class="sp-code" aria-hidden="true">{sol['code']}</p>
        <h1>{html.escape(sol['name'])}</h1>
        <p class="sp-lede">{html.escape(sol['summary'])}</p>
        <dl class="sp-meta">
          <div><dt class="mono">Sector</dt><dd>{sol['sector']}</dd></div>
          <div><dt class="mono">Type</dt><dd>{html.escape(sol['type'])}</dd></div>
          <div><dt class="mono">Client</dt><dd>{client}</dd></div>
          <div><dt class="mono">Built by</dt><dd>{NAME}</dd></div>
        </dl>
      </div>
    </section>

    <section class="section band-light">
      <div class="wrap sp-split">
        <div class="sp-problem">
          <p class="tag">The problem</p>
          <h2 class="draw">What wasn't working before.</h2>
          <p class="sec-lede">{html.escape(sol['problem'])}</p>
        </div>
        <div>
          <p class="tag">What it covers</p>
          <ul class="mods">
{mods}
          </ul>
        </div>
      </div>
    </section>

    <section class="section band-mid">
      <div class="wrap sp-split">
        <div>
          <p class="tag">How we built it</p>
          <h2 class="draw">Requirements first, then the build.</h2>
          <p class="sec-lede">Every project follows the same path: we map the process, agree the rules and screens, then build in short cycles you can review.</p>
          <a class="link-arrow" href="{prefix}index.html#process">See our full process →</a>
        </div>
        <dl class="sp-spec">
          <div><dt class="mono">Technology</dt><dd>.NET · ASP.NET Core <span class="tbc">confirm</span></dd></div>
          <div><dt class="mono">Delivery</dt><dd>Discovery · Build · Testing · Deployment · Support</dd></div>
          <div class="sp-metric"><dt class="mono">Outcome</dt><dd><strong>— → —</strong><span class="tbc">metric to confirm</span></dd></div>
        </dl>
      </div>
    </section>

    <section class="section band-light">
      <div class="wrap">
        <div class="sec-head split">
          <div>
            <p class="tag">Related solutions</p>
            <h2 class="draw">More systems we've built.</h2>
          </div>
          <a class="link-arrow" href="{prefix}index.html#portfolio">All solutions →</a>
        </div>
        <ul class="sol-list">
{rel}
        </ul>
      </div>
    </section>
{cta_band(prefix)}"""
    page(f"solutions/{sol['slug']}.html", f"{sol['name']} — {NAME}",
         f"{sol['summary']} Built by {NAME}, Mumbai.", body)


for s in SOLUTIONS:
    solution_page(s)

# ---------------------------------------------------------------------------
# About
# ---------------------------------------------------------------------------
SERVICES = ["Custom software development", "Web application development", "Mobile apps for Android and iOS",
            "IT consulting", "Offshore development", "Product enhancement", "Support and professional services"]
SECTORS = [
    ("Real estate", "var(--brand)", ["Birla Real Estate"]),
    ("Healthcare", "var(--mint)", ["New Lakhnow Diagnostics Center", "Hyderabad Diagnostic Center", "Royal Diagnostic Center",
                                   "Dr. Nathani Diagnostic Clinic", "Meditrust Diagnostic Center", "SS Medical Center"]),
    ("Distribution & trading", "var(--amber)", ["Neptune Marketing", "Purohit Trading Company"]),
    ("Other industries", "var(--violet)", ["Mahindra Life Science", "Chemie Alliance", "Punjabi Chandu Halwai"]),
]
svc = "\n".join(f'          <li class="reveal"><span class="mono">{i + 1:02d}</span>{s}</li>' for i, s in enumerate(SERVICES))
sec = "\n".join(
    f'''          <div class="sector reveal" style="--sec: {c}"><p class="sector-t"><span aria-hidden="true"></span>{t}</p><ul>{"".join(f"<li>{n}</li>" for n in names)}</ul></div>'''
    for t, c, names in SECTORS)
about_body = f"""
    <section class="page-hero" id="top">
      <div class="wrap page-hero-in">
        <p class="tag">About us</p>
        <h1 class="draw">We build software around how businesses work.</h1>
        <p class="sp-lede">{NAME} is an IT services and business software company based in Dadar, Mumbai. We design, develop and support custom applications for companies whose operations don't fit off-the-shelf tools.</p>
      </div>
    </section>

    <section class="section band-light">
      <div class="wrap sp-split">
        <div>
          <p class="tag">What we do</p>
          <h2 class="draw">From the first conversation to long-term support.</h2>
          <p class="sec-lede">We take on the whole job: understanding the process, designing the system, building it, rolling it out and looking after it as the business grows.</p>
        </div>
        <ol class="svc-plain">
{svc}
        </ol>
      </div>
    </section>

    <section class="statement" aria-labelledby="how-title">
      <div class="wrap">
        <p class="tag">How we work</p>
        <h2 id="how-title" class="statement-text">Requirements first. One team. Support that stays.</h2>
        <div class="why-grid">
          <div class="why reveal"><span class="mono">REQ</span><h3>Requirements first</h3><p>We map your process, roles and exceptions before any code is written.</p></div>
          <div class="why reveal"><span class="mono">BUILD</span><h3>One team, full cycle</h3><p>The people who scope your system are the people who build and test it.</p></div>
          <div class="why reveal"><span class="mono">RUN</span><h3>Support that stays</h3><p>Maintenance, enhancements and help for as long as the software runs your business.</p></div>
        </div>
      </div>
    </section>

    <section class="section band-light">
      <div class="wrap">
        <div class="sec-head split">
          <div>
            <p class="tag">Who we work with</p>
            <h2 class="draw">Clients across industries.</h2>
          </div>
          <a class="link-arrow" href="index.html#portfolio">See the solutions →</a>
        </div>
        <div class="sectors">
{sec}
        </div>
      </div>
    </section>

    <section class="section band-mid">
      <div class="wrap sp-split">
        <div>
          <p class="tag">Technology</p>
          <h2 class="draw">Built on .NET.</h2>
          <p class="sec-lede">We build on .NET, ASP.NET Core and C#, a mature platform for business systems that handle real data and run for years. We also integrate with the tools you already use, including Tally and SAP.</p>
          <a class="link-arrow" href="index.html#technology">See the stack →</a>
        </div>
        <dl class="sp-spec">
          <div><dt class="mono">Office</dt><dd>Office No. 10, B Wing, Haji Habib Bldg., Opp. Fire Brigade, Dadar, Mumbai 400014</dd></div>
          <div><dt class="mono">Email</dt><dd>sales@e-magicindia.com</dd></div>
        </dl>
      </div>
    </section>
{cta_band("", "Let's talk about your business.", "Tell us how it works today and where it gets stuck.")}"""
page("about.html", f"About — {NAME}", f"{NAME} is a Mumbai software company that designs, builds and supports custom business applications.", about_body, current="about.html")

# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------
MAPS = "https://www.google.com/maps/search/?api=1&query=Haji+Habib+Building+Dadar+Mumbai+400014"
contact_body = f"""
    <section class="page-hero" id="top">
      <div class="wrap page-hero-in">
        <p class="tag">Contact</p>
        <h1 class="draw">Tell us how your business works.</h1>
        <p class="sp-lede">Four short questions about your project. We read every enquiry and reply with next steps, starting with a discovery call.</p>
      </div>
    </section>

    <section class="contact-sec" id="start">
      <div class="wrap contact-grid">
        {FORM}
        <aside class="contact-side">
          <div class="cs-block">
            <p class="tag">Email</p>
            <p class="cs-big">sales@e-magicindia.com</p>
          </div>
          <div class="cs-block">
            <p class="tag">Office</p>
            <p>Office No. 10, B Wing, Haji Habib Bldg.,<br>Opp. Fire Brigade, Dadar, Mumbai 400014</p>
            <a class="link-arrow" href="{MAPS}" target="_blank" rel="noopener">Open in Google Maps ↗</a>
          </div>
          <div class="cs-block">
            <p class="tag">What happens next</p>
            <ol class="cs-steps">
              <li>We review your answers and reply by email.</li>
              <li>We schedule a discovery call to understand your process.</li>
              <li>You receive a written scope and approach.</li>
            </ol>
          </div>
        </aside>
      </div>
    </section>"""
page("contact.html", f"Contact — {NAME}", f"Start a software project with {NAME}, Mumbai. Tell us how your business works.", contact_body, current="contact.html")

# ---------------------------------------------------------------------------
# 404
# ---------------------------------------------------------------------------
nf_body = """
    <section class="nf" id="top">
      <div class="wrap nf-in">
        <p class="tag">Error 404</p>
        <p class="nf-code" aria-hidden="true">404</p>
        <h1>This page isn't part of the system.</h1>
        <p class="sp-lede">The link may be old, or the address mistyped.</p>
        <div class="cta-row">
          <a class="btn btn-accent" href="/advance-business-solution/index.html">Back to home <span aria-hidden="true">→</span></a>
          <a class="btn btn-ghost" href="/advance-business-solution/contact.html">Contact us</a>
        </div>
      </div>
    </section>"""
page("404.html", f"Page not found — {NAME}", "This page could not be found.", nf_body, prefix="/advance-business-solution/")
