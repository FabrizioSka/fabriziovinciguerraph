# FV Portfolio Architecture

> Documentazione tecnica ufficiale del portfolio fotografico di Fabrizio Vinciguerra.

---

## Informazioni sul documento

- **Versione:** 1.0
- **Ultimo aggiornamento:** luglio 2026
- **Tecnologia principale:** Eleventy 3
- **Template engine:** Nunjucks
- **Hosting e runtime edge:** Cloudflare Pages + Pages Functions
- **Dominio di produzione:** `https://www.fabriziovinciguerraph.com`
- **Lingua del sito:** inglese
- **Repository locale:** `project-fv`

---

## Scopo del documento

Questo documento descrive l’architettura tecnica reale del portfolio fotografico di Fabrizio Vinciguerra.

È pensato come manuale operativo di lungo periodo e deve permettere di:

- comprendere rapidamente la struttura del progetto;
- individuare i file coinvolti in una determinata funzionalità;
- aggiungere pagine, collezioni e gallerie private senza compromettere il sito;
- capire il flusso di build Eleventy ed esbuild;
- mantenere coerenti CSS, JavaScript, SEO e dati strutturati;
- gestire correttamente il deploy su Cloudflare Pages;
- riconoscere i punti critici relativi a sicurezza, immagini e manutenzione.

Il documento è basato sui file sorgente forniti nel luglio 2026. Quando una configurazione non era presente nei file analizzati, viene indicata esplicitamente come informazione da verificare nella dashboard Cloudflare o nel repository remoto.

---

## Convenzioni

Salvo diversa indicazione:

- tutti i percorsi sono relativi alla root del progetto;
- i percorsi URL iniziano con `/`;
- `_site/` indica l’output generato da Eleventy;
- i file in `src/` vengono elaborati da Eleventy;
- le cartelle `assets/`, `css/`, `js/` e il file `site.webmanifest` vengono copiati nella build tramite passthrough;
- “galleria pubblica” indica una collezione visibile nella sezione Work;
- “galleria privata” indica una pagina e le relative immagini protette dalle Cloudflare Pages Functions;
- “slug” indica l’identificatore URL di una galleria, per esempio `dance-2026`.

---

# Indice

1. Panoramica del progetto
2. Filosofia e principi architetturali
3. Stack tecnologico
4. Struttura reale delle cartelle
5. Pipeline di build
6. Configurazione Eleventy
7. Architettura Nunjucks
8. Struttura delle pagine
9. Componenti condivisi
10. Architettura CSS
11. Architettura JavaScript
12. Gestione delle immagini
13. Gallerie dinamiche
14. Metadati fotografici e SEO delle immagini
15. Gallerie private e autenticazione
16. SEO tecnico e dati strutturati
17. Performance
18. Accessibilità
19. Deploy su Cloudflare Pages
20. Workflow Git e manutenzione
21. Roadmap e debito tecnico
22. Procedure operative
23. Troubleshooting
24. Registro delle modifiche
25. Appendici tecniche

---

# 1. Panoramica del progetto

FV Portfolio è un sito fotografico statico sviluppato con Eleventy.

Il progetto non utilizza CMS, database tradizionali o framework frontend. Le pagine pubbliche vengono generate in fase di build e distribuite come HTML, CSS, JavaScript e immagini statiche. Le uniche funzionalità server-side sono le Cloudflare Pages Functions dedicate alla protezione delle gallerie private.

L’architettura generale può essere rappresentata così:

```text
File sorgente
    │
    ├── Template Nunjucks
    ├── Dati gallerie
    ├── Metadati fotografici
    ├── CSS modulare
    ├── JavaScript ES Modules
    └── Immagini
            │
            ▼
        Eleventy 3
            │
            ├── genera HTML
            ├── copia asset statici
            └── attiva esbuild dopo la build
                    │
                    ▼
              CSS unico minificato
                    │
                    ▼
                  _site/
                    │
                    ▼
          Cloudflare Pages + Functions
```

Le aree principali del sito sono:

- Home;
- Portfolio/Work;
- Woods & Silence;
- Waterfalls;
- Sicily;
- Travel Stories;
- About;
- Contact;
- Private Galleries;
- Dance Recital 2026;
- pagina 404;
- `robots.txt`;
- `sitemap.xml`.

Il progetto è orientato a un portfolio fine-art e visual storytelling. L’architettura tecnica privilegia il controllo diretto del codice, la leggerezza e l’automazione del caricamento delle fotografie.

---

# 2. Filosofia e principi architetturali

## 2.1 Fotografia al centro

L’interfaccia ha il compito di sostenere le immagini, non di competere con esse. Le scelte di layout, tipografia, transizioni e lightbox sono costruite attorno alla fruizione fotografica.

## 2.2 Static first

Il sito viene generato staticamente. Questo riduce:

- superficie d’attacco;
- dipendenze runtime;
- costi di hosting;
- complessità operativa;
- tempi di risposta.

## 2.3 JavaScript progressivo e modulare

Il sito utilizza JavaScript Vanilla suddiviso in moduli. Le funzionalità vengono inizializzate da `js/main.js`. Ogni modulo deve evitare errori quando gli elementi attesi non sono presenti nella pagina.

## 2.4 CSS modulare con output unico

Il CSS sorgente è suddiviso per responsabilità. In produzione viene raccolto e minificato da esbuild in un unico file:

```text
_site/css/style.css
```

## 2.5 Contenuti fotografici guidati dai file

Le gallerie non richiedono l’inserimento manuale di ogni immagine nei template. I file presenti nelle cartelle immagini vengono letti durante la build.

## 2.6 Metadati opzionali ma strutturati

Titolo, testo alternativo, luogo e didascalia possono essere definiti in file JavaScript dedicati. In assenza di metadati espliciti, il sistema genera valori di fallback dal nome del file.

## 2.7 Separazione tra parte pubblica e privata

Le pagine pubbliche sono statiche. Le gallerie private aggiungono un livello di controllo a Cloudflare Edge tramite middleware, cookie firmati e password conservate nelle variabili d’ambiente.

---

# 3. Stack tecnologico

| Tecnologia | Versione o modalità | Ruolo |
|---|---:|---|
| Eleventy | `^3.1.6` | Generazione del sito statico |
| Nunjucks | integrato in Eleventy | Template HTML |
| Node.js | ambiente CommonJS per la build | Esecuzione di Eleventy e utility |
| npm | package manager | Dipendenze e script |
| esbuild | `^0.28.1` | Bundle e minificazione CSS |
| image-size | `^2.0.2` | Lettura delle dimensioni delle fotografie |
| HTML5 | nativo | Struttura semantica |
| CSS | modulare | Presentazione |
| JavaScript ES Modules | nativo browser | Interazioni frontend |
| Cloudflare Pages | hosting | Pubblicazione del sito |
| Cloudflare Pages Functions | runtime edge | Login e protezione gallerie |
| Web Crypto API | runtime Cloudflare | HMAC e SHA-256 |
| Git | versionamento | Cronologia e rollback |

## 3.1 Dipendenze dichiarate

Il file `package.json` contiene:

```json
{
  "dependencies": {
    "@11ty/eleventy": "^3.1.6",
    "image-size": "^2.0.2"
  },
  "devDependencies": {
    "esbuild": "^0.28.1"
  }
}
```

Gli script disponibili sono:

```json
{
  "dev": "eleventy --serve",
  "build": "eleventy"
}
```

## 3.2 Modello di moduli

Il package usa:

```json
"type": "commonjs"
```

Di conseguenza:

- `.eleventy.js`;
- file in `src/_data/`;
- utility in `utils/`;

usano `require()` e `module.exports`.

Le Cloudflare Functions usano invece sintassi ESM:

```js
import { ... } from "./_lib/auth.js";
export function onRequest() {}
```

Il frontend usa ES Modules attraverso:

```html
<script type="module" src="/js/main.js"></script>
```

Questa coesistenza è intenzionale perché i file vengono eseguiti in ambienti differenti.

---

# 4. Struttura reale delle cartelle

La struttura rilevata è la seguente:

```text
project-fv/
├── .eleventy.js
├── .gitignore
├── package.json
├── package-lock.json
├── site.webmanifest
│
├── assets/
│   └── images/
│       ├── sicily/
│       ├── travel/
│       ├── waterfalls/
│       ├── woods/
│       ├── private/
│       │   └── dance-2026/
│       ├── social/
│       └── [immagini di copertina e immagini editoriali]
│
├── css/
│   ├── style.css
│   ├── base/
│   │   ├── animations.css
│   │   ├── reset.css
│   │   ├── typography.css
│   │   └── variables.css
│   ├── components/
│   │   └── lightbox.css
│   ├── effects/
│   │   ├── cursor.css
│   │   ├── lightbox.css
│   │   ├── preloader.css
│   │   ├── reveal.css
│   │   └── transitions.css
│   ├── layout/
│   │   ├── footer.css
│   │   └── header.css
│   ├── pages/
│   │   ├── 404.css
│   │   ├── about.css
│   │   ├── awards.css
│   │   ├── collections.css
│   │   ├── contact.css
│   │   ├── home.css
│   │   ├── travel.css
│   │   └── work.css
│   ├── responsive/
│   │   ├── about.css
│   │   ├── awards.css
│   │   ├── collections.css
│   │   ├── contact.css
│   │   ├── footer.css
│   │   ├── header.css
│   │   ├── home.css
│   │   ├── travel.css
│   │   └── work.css
│   └── utils/
│       └── private.css
│
├── functions/
│   ├── _middleware.js
│   ├── private-login.js
│   └── _lib/
│       └── auth.js
│
├── js/
│   ├── main.js
│   └── modules/
│       ├── custom-cursor.js
│       ├── header.js
│       ├── hero.js
│       ├── image-protection.js
│       ├── lightbox.js
│       ├── page-transitions.js
│       ├── preloader.js
│       ├── private-gallery.js
│       └── reveal.js
│
├── src/
│   ├── 404.njk
│   ├── about.njk
│   ├── contact.njk
│   ├── index.njk
│   ├── private.njk
│   ├── robots.njk
│   ├── sitemap.njk
│   ├── work.njk
│   │
│   ├── _data/
│   │   ├── dance2026.js
│   │   ├── sicily.js
│   │   ├── travel.js
│   │   ├── waterfalls.js
│   │   └── woods.js
│   │
│   ├── _includes/
│   │   ├── breadcrumb-schema.njk
│   │   ├── footer.njk
│   │   ├── header.njk
│   │   ├── image-gallery-schema.njk
│   │   ├── layout.njk
│   │   └── components/
│   │       └── collection-row.njk
│   │
│   ├── private/
│   │   └── dance-2026.njk
│   │
│   └── work/
│       ├── sicily.njk
│       ├── travel-stories.njk
│       ├── waterfalls.njk
│       └── woods-and-silence.njk
│
└── utils/
    ├── galleryUtils.js
    └── galleryMetadata/
        ├── sicily.js
        ├── travel.js
        ├── waterfalls.js
        └── woods.js
```

## 4.1 Cartelle non versionate

Il file `.gitignore` esclude:

```text
node_modules/
_site/
.DS_Store
```

Questa configurazione evita di versionare dipendenze, output generato e file di sistema macOS.

## 4.2 Cartelle generate

`_site/` viene creato da Eleventy. Non deve essere modificato manualmente, perché ogni build può sovrascriverlo.

## 4.3 Cartelle non incluse nell’archivio analizzato

Le immagini effettive non erano necessarie per documentare il codice, ma devono essere presenti nella root reale del progetto sotto `assets/`.

---

# 5. Pipeline di build

## 5.1 Avvio in sviluppo

Il comando:

```bash
npm run dev
```

esegue:

```bash
eleventy --serve
```

Eleventy:

1. legge `.eleventy.js`;
2. usa `src/` come input;
3. genera `_site/`;
4. copia gli asset configurati;
5. avvia il server locale;
6. osserva i file sorgente;
7. esegue `buildCss()` dopo ogni build Eleventy.

## 5.2 Build di produzione

Il comando:

```bash
npm run build
```

esegue:

```bash
eleventy
```

Al termine della generazione HTML viene attivato l’evento:

```js
eleventyConfig.on("eleventy.after", async () => {
  await buildCss();
});
```

La funzione `buildCss()` usa esbuild:

```js
await esbuild.build({
  entryPoints: ["css/style.css"],
  bundle: true,
  minify: true,
  outfile: "_site/css/style.css",
  external: ["/assets/*", "../../assets/*"],
  logLevel: "info"
});
```

## 5.3 Ordine effettivo

```text
Eleventy genera _site/
        │
        ├── copia css/ in passthrough
        ├── copia js/
        ├── copia assets/
        ├── copia site.webmanifest
        └── genera le pagine HTML
                │
                ▼
        evento eleventy.after
                │
                ▼
         esbuild legge css/style.css
                │
                ├── risolve gli @import
                ├── crea un bundle
                ├── minifica
                └── sovrascrive _site/css/style.css
```

La copia passthrough di `css/` avviene prima del bundle finale. Il file principale in output viene poi sostituito dalla versione minificata. Gli altri file CSS copiati possono restare presenti nella cartella di output, ma il browser carica solo `/css/style.css`.

## 5.4 Watch CSS

La riga:

```js
eleventyConfig.addWatchTarget("./css/");
```

fa sì che le modifiche ai moduli CSS provochino una nuova build.

## 5.5 Comportamento passthrough in sviluppo

```js
eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
```

migliora il comportamento del server locale per gli asset copiati senza elaborazione.

---

# 6. Configurazione Eleventy

Il file `.eleventy.js` è il punto centrale della build.

## 6.1 Directory

```js
return {
  dir: {
    input: "src",
    output: "_site"
  }
};
```

Eleventy considera:

- `src/` come sorgente dei template;
- `_site/` come output.

## 6.2 Copie passthrough

```js
eleventyConfig.addPassthroughCopy("assets");
eleventyConfig.addPassthroughCopy("css");
eleventyConfig.addPassthroughCopy("js");
eleventyConfig.addPassthroughCopy("site.webmanifest");
```

Questi elementi mantengono lo stesso percorso relativo nella build.

## 6.3 Assenza di plugin Eleventy

Nella configurazione analizzata non risultano plugin Eleventy, shortcode, filtri custom o collezioni definite tramite API. La dinamicità delle gallerie è ottenuta tramite Global Data Files in `src/_data/`.

## 6.4 Considerazioni operative

Quando si aggiunge una nuova cartella statica esterna a `src/`, bisogna aggiungerla esplicitamente a `addPassthroughCopy()`.

Quando si aggiunge un file sotto `src/`, Eleventy lo elabora automaticamente se il formato è supportato.

---

# 7. Architettura Nunjucks

## 7.1 Layout principale

Tutte le pagine principali usano:

```yaml
layout: layout.njk
```

Il file `src/_includes/layout.njk` contiene:

- struttura `<!DOCTYPE html>`;
- metadati;
- favicon;
- manifest;
- canonical;
- Open Graph;
- Twitter Card;
- preload della hero in Home;
- JSON-LD globale;
- CSS;
- preloader;
- cursore personalizzato;
- transizione di pagina;
- header;
- contenuto della pagina;
- footer;
- lightbox;
- JavaScript principale.

## 7.2 Inserimento del contenuto

Il contenuto di ogni pagina viene iniettato con:

```njk
{{ content | safe }}
```

Il filtro `safe` impedisce a Nunjucks di eseguire escaping dell’HTML già generato.

## 7.3 Include condivisi

Il layout include:

```njk
{% include "header.njk" %}
{% include "footer.njk" %}
```

Le pagine delle collezioni possono includere inoltre:

- `breadcrumb-schema.njk`;
- `image-gallery-schema.njk`.

La pagina Work utilizza il componente:

```text
src/_includes/components/collection-row.njk
```

## 7.4 Variabili SEO disponibili

Il layout usa:

- `title`;
- `description`;
- `robots`;
- `ogImage`;
- `ogImageAlt`;
- `ogType`;
- `page.url`.

Il canonical viene costruito così:

```njk
{% set canonicalUrl = "https://www.fabriziovinciguerraph.com" + page.url %}
```

L’immagine social di fallback è:

```text
https://www.fabriziovinciguerraph.com/assets/images/social/og-image.jpg
```

## 7.5 Linguaggio

L’elemento radice dichiara:

```html
<html lang="en">
```

Anche i dati strutturati usano `inLanguage: "en"`.

---

# 8. Struttura delle pagine

## 8.1 Mappa delle pagine

| File sorgente | URL previsto | Funzione |
|---|---|---|
| `src/index.njk` | `/` | Home |
| `src/work.njk` | `/work/` o URL derivato | Indice portfolio |
| `src/work/sicily.njk` | `/work/sicily/` | Collezione Sicily |
| `src/work/travel-stories.njk` | `/work/travel-stories/` | Collezione Travel Stories |
| `src/work/waterfalls.njk` | `/work/waterfalls/` | Collezione Waterfalls |
| `src/work/woods-and-silence.njk` | `/work/woods-and-silence/` | Collezione Woods & Silence |
| `src/about.njk` | `/about/` | Profilo e visione |
| `src/contact.njk` | `/contact/` | Contatti |
| `src/private.njk` | `/private/` | Pagina informativa pubblica |
| `src/private/dance-2026.njk` | `/private/dance-2026/` | Galleria privata |
| `src/404.njk` | `/404.html` | Errore 404 |
| `src/robots.njk` | `/robots.txt` | Direttive crawler |
| `src/sitemap.njk` | `/sitemap.xml` | Sitemap |

Gli URL non specificati con `permalink` vengono derivati da Eleventy in base al percorso del file.

## 8.2 Home

Front Matter:

```yaml
title: "Fabrizio Vinciguerra | Fine Art Photographer & Visual Storyteller"
description: "Fine art photography by Sicilian photographer Fabrizio Vinciguerra..."
```

Il layout esegue il preload di `/assets/images/home.jpg` quando:

```njk
{% if page.url == "/" %}
```

La Home utilizza la hero e le funzioni JavaScript dedicate.

## 8.3 Work

La pagina Work presenta le collezioni principali. Il componente `collection-row.njk` consente di mantenere coerenti struttura, numerazione, copertina e collegamento.

Le collezioni confermate nel codice sono:

1. Woods & Silence;
2. Waterfalls;
3. Sicily;
4. Travel Stories.

## 8.4 Pagine collezione

Ogni pagina di collezione:

- eredita il layout;
- usa dati da `src/_data/`;
- genera una griglia immagini;
- espone titoli e descrizioni SEO specifici;
- può includere schema breadcrumb;
- può includere schema `ImageGallery`.

## 8.5 About

La pagina About contiene:

- hero editoriale;
- storia personale;
- dichiarazione di visione;
- citazione;
- sezione Awards & Recognition;
- immagini riconosciute da 35AWARDS;
- testo conclusivo.

## 8.6 Contact

La pagina Contact ha metadata dedicati e una struttura progettata per richieste, collaborazioni, progetti fotografici e gallerie private.

## 8.7 404

La pagina `404.njk` usa:

```yaml
permalink: 404.html
robots: "noindex, nofollow"
```

La pagina fornisce un collegamento di ritorno alla Home.

## 8.8 Robots e sitemap

I file:

```yaml
eleventyExcludeFromCollections: true
```

non devono essere inclusi in eventuali collezioni Eleventy.

---

# 9. Componenti condivisi

## 9.1 Header

Percorso:

```text
src/_includes/header.njk
```

Lo stile è diviso tra:

- `css/layout/header.css`;
- `css/responsive/header.css`.

Il comportamento JavaScript è in:

```text
js/modules/header.js
```

## 9.2 Footer

Percorso:

```text
src/_includes/footer.njk
```

Stili:

- `css/layout/footer.css`;
- `css/responsive/footer.css`.

## 9.3 Lightbox

Il markup globale è nel layout:

```html
<div class="lightbox" id="lightbox">
  <button class="lightbox-close">×</button>
  <button class="lightbox-prev">‹</button>
  <img src="" alt="">
  <button class="lightbox-next">›</button>
  <div class="lightbox-caption"></div>
  <div class="lightbox-counter" id="lightboxCounter"></div>
</div>
```

Il comportamento è in:

```text
js/modules/lightbox.js
```

Lo stile principale è in:

```text
css/components/lightbox.css
```

È presente anche `css/effects/lightbox.css`, ma non risulta importato da `css/style.css`. Questa duplicazione deve essere verificata prima di eliminare file.

## 9.4 Preloader

Markup nel layout:

```html
<div class="preloader" aria-hidden="true">
```

Codice:

- `js/modules/preloader.js`;
- `css/effects/preloader.css`.

## 9.5 Cursore personalizzato

Markup:

```html
<div class="custom-cursor" aria-hidden="true"></div>
```

Codice:

- `js/modules/custom-cursor.js`;
- `css/effects/cursor.css`.

## 9.6 Transizioni di pagina

Markup:

```html
<div class="page-transition" aria-hidden="true"></div>
```

Codice:

- `js/modules/page-transitions.js`;
- `css/effects/transitions.css`.

## 9.7 Reveal

Gli elementi da animare usano la classe:

```html
class="reveal"
```

Il comportamento è in `js/modules/reveal.js` e lo stile in `css/effects/reveal.css`.

---

# 10. Architettura CSS

## 10.1 Entry point

Il file principale è:

```text
css/style.css
```

Non contiene l’intero stile, ma una lista ordinata di `@import`.

## 10.2 Ordine degli import

```text
1. utility private
2. base
3. effects
4. components
5. layout
6. pages
7. responsive
```

L’ordine è importante perché determina la cascata.

## 10.3 Base

### `variables.css`

Contiene le variabili globali. È il punto corretto per colori, spaziature, dimensioni ricorrenti e token visivi.

### `reset.css`

Normalizza gli stili nativi del browser.

### `typography.css`

Gestisce font, titoli, paragrafi, link e tipografia generale.

### `animations.css`

Contiene keyframe e animazioni condivise.

## 10.4 Effects

- `reveal.css`: comparsa allo scroll;
- `transitions.css`: passaggi tra pagine;
- `cursor.css`: cursore personalizzato;
- `preloader.css`: schermata iniziale.

## 10.5 Components

`components/lightbox.css` contiene il componente visualizzatore.

## 10.6 Layout

- `layout/header.css`;
- `layout/footer.css`.

## 10.7 Pages

Ogni pagina o famiglia di pagine possiede un modulo dedicato:

- Home;
- Work;
- Collections;
- Travel;
- About;
- Contact;
- Awards;
- 404.

## 10.8 Responsive

I responsive override sono separati per area. Questo rende facile individuare il comportamento mobile, ma richiede disciplina: una modifica desktop e la relativa modifica mobile possono trovarsi in file diversi.

## 10.9 Stili gallerie private

`css/utils/private.css` viene importato per primo.

Questo file gestisce gli elementi specifici delle gallerie private e deve essere verificato insieme a:

- `src/private/dance-2026.njk`;
- `js/modules/private-gallery.js`.

## 10.10 Regole di manutenzione CSS

1. Modificare un token globale in `variables.css`.
2. Non aggiungere stili pagina-specifici a `style.css`.
3. Mantenere gli import nello stesso ordine logico.
4. Aggiungere sempre il relativo file responsive se necessario.
5. Evitare selettori troppo generici nelle pagine.
6. Controllare che un nuovo file CSS sia importato.
7. Non modificare `_site/css/style.css`: è generato.

---

# 11. Architettura JavaScript

## 11.1 Entry point

`js/main.js` importa nove moduli:

```js
import { initReveal } from "./modules/reveal.js";
import { initHeader } from "./modules/header.js";
import { initLightbox } from "./modules/lightbox.js";
import { initImageProtection } from "./modules/image-protection.js";
import { initPrivateGallery } from "./modules/private-gallery.js";
import { initPageTransitions } from "./modules/page-transitions.js";
import { initCustomCursor } from "./modules/custom-cursor.js";
import { initPreloader } from "./modules/preloader.js";
import { initHero } from "./modules/hero.js";
```

L’inizializzazione avviene in:

```js
function initSite() {
  initPreloader();
  initReveal();
  initHeader();
  initLightbox();
  initImageProtection();
  initPrivateGallery();
  initPageTransitions();
  initCustomCursor();
  initHero();
}
```

Il codice gestisce correttamente sia il caricamento anticipato sia una pagina già pronta:

```js
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite, { once: true });
} else {
  initSite();
}
```

## 11.2 Responsabilità dei moduli

| Modulo | Responsabilità |
|---|---|
| `preloader.js` | schermata iniziale |
| `reveal.js` | attivazione animazioni allo scroll |
| `header.js` | stato e interazioni header |
| `lightbox.js` | visualizzazione immagini |
| `image-protection.js` | deterrenti lato client contro azioni comuni |
| `private-gallery.js` | interazioni specifiche galleria privata |
| `page-transitions.js` | animazioni durante la navigazione |
| `custom-cursor.js` | cursore desktop personalizzato |
| `hero.js` | comportamento della hero |

## 11.3 Regola fondamentale

Ogni funzione `init...()` deve essere sicura anche quando gli elementi relativi non esistono nella pagina.

Esempio concettuale:

```js
export function initFeature() {
  const element = document.querySelector(".feature");

  if (!element) {
    return;
  }

  // inizializzazione
}
```

## 11.4 Nessun bundle JavaScript

A differenza del CSS, il JavaScript non viene elaborato da esbuild. La cartella `js/` viene copiata tale e quale e il browser risolve gli import ES Modules.

Conseguenze:

- i nomi dei file e i percorsi devono restare corretti;
- il server deve servire i file con MIME type JavaScript;
- non si possono usare import Node nel frontend;
- ogni modulo produce una richiesta HTTP separata, anche se HTTP/2 o HTTP/3 riducono il costo.

---

# 12. Gestione delle immagini

## 12.1 Posizione

Le immagini vengono conservate sotto:

```text
assets/images/
```

Le gallerie pubbliche usano:

```text
assets/images/sicily/
assets/images/travel/
assets/images/waterfalls/
assets/images/woods/
```

La galleria privata usa:

```text
assets/images/private/dance-2026/
```

## 12.2 Formati supportati dal loader

`galleryUtils.js` accetta:

```text
.jpg
.jpeg
.png
.webp
```

I file TIFF non vengono inclusi.

## 12.3 Ordinamento

I file vengono ordinati con:

```js
localeCompare(..., {
  numeric: true,
  sensitivity: "base"
})
```

Questo consente un ordinamento naturale:

```text
sicily-2.jpg
sicily-10.jpg
```

invece di un ordinamento alfabetico puro.

## 12.4 Dimensioni e orientamento

Il loader legge il file in buffer:

```js
const buffer = fs.readFileSync(filePath);
const dimensions = imageSize(buffer);
```

Poi classifica:

```js
const isPortrait = dimensions.height > dimensions.width;
```

La classe restituita è:

```js
private-portrait
```

oppure:

```js
private-landscape
```

Il nome delle classi è usato anche per gallerie pubbliche. È funzionale, ma semanticamente legato alle gallerie private. Una futura revisione potrebbe rinominarle in `image-portrait` e `image-landscape`.

## 12.5 Immagini editoriali

Alcune immagini vengono inserite direttamente nei template, per esempio:

- copertine;
- Home hero;
- immagini About;
- immagini premi 35AWARDS;
- immagini social Open Graph.

Queste non passano necessariamente da `galleryUtils.js`.

## 12.6 Convenzioni consigliate

Per garantire ordinamento e fallback leggibili:

```text
sicily-01-lone-pine.webp
sicily-02-etna-clouds.webp
waterfalls-01-frost-water.webp
travel-01-cappadocia-balloon.webp
```

Evitare:

```text
DSCF1234.JPG
finale-definitiva-2.jpg
foto nuova copia.jpg
```

---

# 13. Gallerie dinamiche

## 13.1 Flusso

```text
Cartella immagini
    │
    ▼
src/_data/[nome].js
    │
    ▼
utils/galleryUtils.js
    │
    ├── legge file
    ├── filtra estensioni
    ├── ordina
    ├── misura immagini
    ├── carica metadati
    └── costruisce oggetti
            │
            ▼
     array disponibile in Nunjucks
            │
            ▼
        pagina collezione
```

## 13.2 Global Data Files

Esempio Sicily:

```js
const getGallery = require("../../utils/galleryUtils");

module.exports = getGallery("sicily", "Sicily");
```

Il nome del file determina la variabile Nunjucks:

```text
src/_data/sicily.js → sicily
```

Le variabili disponibili sono:

- `sicily`;
- `travel`;
- `waterfalls`;
- `woods`;
- `dance2026`.

## 13.3 Oggetto immagine

Ogni elemento generato contiene:

```js
{
  src,
  filename,
  title,
  alt,
  location,
  caption,
  class
}
```

## 13.4 Cartella mancante

Se la cartella non esiste, il sistema:

- scrive un warning;
- restituisce `[]`;
- non interrompe la build.

## 13.5 Metadati mancanti

Se il file metadata non esiste o genera errore:

- viene usato `{}`;
- la galleria continua a funzionare;
- vengono creati fallback dai nomi file.

## 13.6 Cache dei moduli metadata

Prima di ricaricare un file metadata:

```js
delete require.cache[require.resolve(metadataPath)];
```

Questo evita di usare dati obsoleti durante il server di sviluppo.

## 13.7 Aggiunta di una nuova galleria pubblica

Passaggi minimi:

1. creare `assets/images/new-gallery/`;
2. aggiungere immagini con naming ordinato;
3. creare `src/_data/newGallery.js`;
4. opzionalmente creare `utils/galleryMetadata/new-gallery.js`;
5. creare `src/work/new-gallery.njk`;
6. aggiungere la collezione in `src/work.njk`;
7. aggiungere SEO, breadcrumb e schema immagini;
8. aggiungere gli stili solo se la struttura differisce dalle altre collezioni.

---

# 14. Metadati fotografici e SEO delle immagini

## 14.1 Posizione

I metadati si trovano in:

```text
utils/galleryMetadata/
```

Sono presenti file per:

- Sicily;
- Travel;
- Waterfalls;
- Woods.

La galleria privata Dance 2026 non ha un file metadata dedicato nell’archivio analizzato.

## 14.2 Chiave di associazione

La chiave deve corrispondere al nome file senza estensione.

Esempio:

```text
assets/images/sicily/sicily-01-lone-pine.webp
```

richiede:

```js
module.exports = {
  "sicily-01-lone-pine": {
    title: "...",
    alt: "...",
    location: "...",
    caption: "..."
  }
};
```

## 14.3 Fallback leggibile

`createReadableName()`:

1. rimuove il prefisso cartella;
2. rimuove il numero iniziale;
3. sostituisce trattini e underscore;
4. normalizza gli spazi;
5. rende maiuscola la prima lettera.

Esempio:

```text
sicily-01-lone-pine
```

diventa:

```text
Lone pine
```

## 14.4 Fallback alt

In assenza di `alt` esplicito:

```text
[Readable name], fine art photograph from the [Label] collection by Fabrizio Vinciguerra
```

Questo fallback è migliore di un alt vuoto, ma non può sostituire una descrizione fotografica specifica quando l’immagine è importante.

## 14.5 Campi

### `title`

Titolo editoriale della fotografia.

### `alt`

Descrizione accessibile e semanticamente utile.

### `location`

Luogo, se rilevante.

### `caption`

Didascalia mostrata o utilizzata nella lightbox/schema.

## 14.6 Regola editoriale

L’alt deve descrivere ciò che si vede. Non deve diventare una lista artificiale di keyword.

Corretto:

```text
Ancient chestnut tree emerging from fog in a Sicilian woodland.
```

Debole:

```text
Sicily fine art photographer landscape photography best Etna photo.
```

---

# 15. Gallerie private e autenticazione

## 15.1 Architettura

La protezione non è soltanto lato client. Il progetto usa Cloudflare Pages Functions per controllare:

- pagine private;
- file immagine privati;
- sessione;
- password;
- cache;
- indicizzazione.

## 15.2 File coinvolti

```text
functions/_middleware.js
functions/private-login.js
functions/_lib/auth.js
src/private/dance-2026.njk
src/_data/dance2026.js
assets/images/private/dance-2026/
js/modules/private-gallery.js
js/modules/image-protection.js
css/utils/private.css
```

## 15.3 Configurazione ambiente

Sono richieste almeno due variabili Cloudflare:

```text
GALLERY_CONFIG
GALLERY_SESSION_SECRET
```

### `GALLERY_CONFIG`

JSON che associa slug e password:

```json
{
  "dance-2026": "password-condivisa-con-il-cliente"
}
```

### `GALLERY_SESSION_SECRET`

Segreto lungo e casuale usato per firmare i token HMAC.

Non deve essere inserito nel repository.

## 15.4 Durata sessione

Nel file `auth.js`:

```js
const SESSION_DURATION_SECONDS = 60 * 60 * 2;
```

La sessione dura due ore.

## 15.5 Cookie

Il cookie usa prefisso:

```text
fv_gallery_
```

Esempio:

```text
fv_gallery_dance-2026
```

Attributi:

```text
Path=/
Max-Age=7200
HttpOnly
Secure
SameSite=Lax
```

## 15.6 Token

Formato:

```text
expiresAt.signature
```

La firma è HMAC SHA-256 calcolata su:

```text
gallerySlug.expiresAt
```

Il token non contiene la password.

## 15.7 Login

### GET `/private-login`

1. legge `returnTo`;
2. accetta solo percorsi locali che iniziano con `/private/[slug]`;
3. verifica che lo slug esista in `GALLERY_CONFIG`;
4. restituisce la pagina di login;
5. imposta `Cache-Control: no-store`.

### POST `/private-login`

1. legge password, returnTo e gallery;
2. valida la coerenza degli slug;
3. recupera la password attesa;
4. esegue SHA-256 di entrambe le password;
5. usa un confronto a tempo costante;
6. genera il token sessione;
7. imposta il cookie;
8. risponde con `303` verso la galleria.

## 15.8 Middleware

Il middleware riconosce:

```text
/private/[slug]/
```

e:

```text
/assets/images/private/[slug]/...
```

La pagina `/private/` resta pubblica.

## 15.9 Utente non autenticato

Per una pagina privata:

```text
302 → /private-login?returnTo=...
```

Per un’immagine privata:

```text
401 Authentication required
```

Questo impedisce l’accesso diretto ai file senza cookie valido.

## 15.10 Risposte protette

Il middleware aggiunge:

```text
Cache-Control: private, no-store
X-Robots-Tag: noindex, nofollow, noimageindex
```

## 15.11 Limiti reali

La protezione:

- controlla l’accesso lato server/edge;
- impedisce link diretti senza sessione;
- evita indicizzazione;
- non impedisce a un utente autorizzato di fare screenshot;
- non impedisce di fotografare lo schermo;
- non sostituisce un sistema DRM;
- usa password condivise, non account individuali;
- non registra selezioni in un database;
- non include revoca selettiva per singolo cliente.

## 15.12 Aggiunta di una nuova galleria privata

1. creare `assets/images/private/[slug]/`;
2. creare `src/_data/[nome].js` con `getGallery("private/[slug]", "...")`;
3. creare `src/private/[slug].njk`;
4. aggiungere lo slug a `GALLERY_CONFIG`;
5. testare login;
6. testare URL diretto di una foto senza cookie;
7. verificare `noindex`;
8. verificare scadenza sessione;
9. non inserire la password nel codice.

---

# 16. SEO tecnico e dati strutturati

## 16.1 Canonical

Ogni pagina riceve:

```html
<link rel="canonical" href="[dominio + page.url]">
```

## 16.2 Meta robots

Default:

```text
index, follow, max-image-preview:large
```

Può essere sovrascritto dal Front Matter.

Le pagine private e 404 usano `noindex`.

## 16.3 Open Graph

Il layout genera:

- `og:title`;
- `og:description`;
- `og:type`;
- `og:url`;
- `og:site_name`;
- `og:locale`;
- `og:image`;
- `og:image:alt`.

## 16.4 Twitter/X

Il layout usa:

```text
summary_large_image
```

e replica titolo, descrizione, immagine e alt.

## 16.5 JSON-LD globale

Il layout genera un grafo con:

- `WebSite`;
- `Person`;
- `WebPage`.

## 16.6 Entità Person

L’entità contiene:

- nome;
- URL;
- immagine;
- professione;
- descrizione;
- Instagram;
- Facebook;
- riconoscimenti 35AWARDS;
- aree di competenza;
- nazionalità;
- località.

## 16.7 Premi dichiarati nello schema

Nel codice sono presenti:

- `35AWARDS Top 200 Landscape — 2025`;
- `35AWARDS Official Catalogue Selection — 2025`;
- `35AWARDS Top 100 Landscape — Daytime — 2026`;
- `35AWARDS Top 35 Italy — 2026`.

Questi dati devono essere mantenuti coerenti con la pagina About e con le prove documentali.

## 16.8 Schema breadcrumb

Il file:

```text
src/_includes/breadcrumb-schema.njk
```

serve a descrivere la gerarchia delle pagine collezione.

## 16.9 Schema galleria immagini

Il file:

```text
src/_includes/image-gallery-schema.njk
```

serve a rappresentare semanticamente le collezioni fotografiche.

## 16.10 Sitemap

La sitemap viene generata da `src/sitemap.njk`. Quando si aggiunge una pagina con `noindex`, verificare che non venga inclusa impropriamente.

## 16.11 Robots

`src/robots.njk` genera `/robots.txt`.

La protezione delle gallerie private non deve dipendere esclusivamente da `robots.txt`: il middleware è il controllo reale.

---

# 17. Performance

## 17.1 Punti di forza

- HTML statico;
- CDN Cloudflare;
- CSS minificato;
- nessun framework frontend;
- nessun database;
- immagini con `loading="lazy"` dove previsto;
- `decoding="async"` in varie immagini;
- preload della hero Home;
- JavaScript modulare nativo;
- asset cacheabili, eccetto contenuti privati.

## 17.2 CSS

Esbuild produce un bundle unico minificato. Questo riduce il numero di richieste CSS.

## 17.3 JavaScript

I moduli restano separati. Il vantaggio è la manutenibilità; lo svantaggio è un numero maggiore di richieste.

## 17.4 Immagini

Il principale costo prestazionale del sito è rappresentato dalle fotografie.

Regole consigliate:

- esportare in sRGB;
- rimuovere metadati non necessari;
- usare WebP o JPEG ottimizzati;
- evitare file più grandi della dimensione reale di visualizzazione;
- verificare qualità al 100%;
- mantenere un master esterno al repository;
- non usare PNG per fotografie salvo necessità.

## 17.5 Hero

Il preload di `home.jpg` è corretto perché l’immagine principale è presumibilmente above-the-fold.

## 17.6 Gallerie private

Le risposte private usano `no-store`, scelta necessaria per la privacy ma incompatibile con caching aggressivo.

## 17.7 Possibile evoluzione

Il progetto non usa ancora un image pipeline Eleventy con generazione automatica di:

- `srcset`;
- dimensioni multiple;
- AVIF;
- width/height automatici;
- placeholder.

Questa è una delle evoluzioni più importanti.

---

# 18. Accessibilità

## 18.1 Elementi positivi

- `lang="en"`;
- pulsanti lightbox con `aria-label`;
- elementi decorativi con `aria-hidden="true"`;
- alt text per fotografie;
- struttura semantica con `main`;
- focus nel form login;
- label esplicita per password;
- meta viewport.

## 18.2 Lightbox

La lightbox deve garantire:

- chiusura con Escape;
- navigazione tastiera;
- focus visibile;
- blocco dello scroll;
- focus trap;
- ritorno del focus alla miniatura;
- alt coerente con l’immagine.

Il markup fornisce la base, ma il comportamento completo dipende da `lightbox.js`.

## 18.3 Animazioni

Reveal, preloader, cursore e transizioni devono rispettare:

```css
@media (prefers-reduced-motion: reduce)
```

Se non già presente nei moduli CSS, va aggiunto.

## 18.4 Cursore custom

Il cursore nativo non deve diventare inutilizzabile su:

- touch;
- dispositivi con puntatore grossolano;
- utenti con preferenze di accessibilità;
- controlli form.

## 18.5 Testi alternativi

Gli alt generati automaticamente sono fallback. Le fotografie principali devono avere descrizioni editoriali dedicate.

---

# 19. Deploy su Cloudflare Pages

## 19.1 Build prevista

Impostazioni da verificare nella dashboard:

```text
Build command: npm run build
Build output directory: _site
Root directory: /
```

Queste impostazioni sono coerenti con il codice, ma non erano presenti nei file forniti.

## 19.2 Versione Node

La versione Node non è fissata in `package.json` tramite `engines` e non è presente un file `.nvmrc` nell’archivio.

È consigliato aggiungere, dopo aver verificato la versione usata localmente:

```json
"engines": {
  "node": ">=20"
}
```

oppure un `.nvmrc`.

## 19.3 Pages Functions

Cloudflare rileva automaticamente la cartella root:

```text
functions/
```

Il middleware si applica alle richieste secondo le convenzioni Pages Functions.

## 19.4 Variabili ambiente

Configurare sia Preview sia Production, se necessario:

```text
GALLERY_CONFIG
GALLERY_SESSION_SECRET
```

Il segreto di sessione deve essere diverso da ogni password galleria.

## 19.5 Dominio

Il codice usa in modo hardcoded:

```text
https://www.fabriziovinciguerraph.com
```

Una modifica dominio richiede aggiornamenti in:

- canonical;
- Open Graph;
- JSON-LD;
- sitemap;
- eventuali URL assoluti nelle pagine;
- configurazione Cloudflare.

## 19.6 Preview deployments

Le preview Cloudflare possono avere un dominio differente, ma canonical e social URL continueranno a puntare al dominio di produzione. Questo è generalmente corretto per evitare indicizzazione delle preview.

## 19.7 Controlli post-deploy

1. Home caricata correttamente.
2. CSS minificato disponibile.
3. ES Modules caricati senza 404.
4. sitemap valida.
5. robots corretto.
6. canonical corretti.
7. immagini social raggiungibili.
8. login privato funzionante.
9. immagine privata non accessibile senza cookie.
10. pagina 404 servita correttamente.
11. nessuna password presente nel bundle.
12. nessun errore console.

---

# 20. Workflow Git e manutenzione

## 20.1 File da versionare

Versionare:

- `src/`;
- `css/`;
- `js/`;
- `functions/`;
- `utils/`;
- `.eleventy.js`;
- `package.json`;
- `package-lock.json`;
- `site.webmanifest`;
- immagini pubblicate;
- questo documento.

## 20.2 File da non versionare

Già esclusi:

- `node_modules/`;
- `_site/`;
- `.DS_Store`.

Non versionare inoltre:

- password;
- segreti;
- file `.env` con valori reali;
- esportazioni RAW;
- cache di editor.

## 20.3 Flusso consigliato

```bash
git status
git add .
git commit -m "Descrizione chiara"
git push
```

Prima del commit:

```bash
npm run build
```

## 20.4 Commit

Esempi:

```text
Add Sicily gallery metadata
Improve private gallery authentication
Refine mobile layout for collections
Update structured data and awards
Add Cyclone Henry lightbox sequence
```

## 20.5 Manutenzione periodica

Mensile o dopo modifiche importanti:

- eseguire build pulita;
- controllare link;
- controllare console;
- verificare Lighthouse;
- verificare immagini mancanti;
- aggiornare questo documento;
- controllare dipendenze npm;
- verificare gallerie private.

---

# 21. Roadmap e debito tecnico

## 21.1 Pipeline immagini responsive

Priorità alta.

Obiettivo:

- generare più dimensioni;
- usare `srcset`;
- aggiungere `width` e `height`;
- ridurre CLS;
- produrre WebP/AVIF;
- mantenere fallback JPEG.

## 21.2 Rinominare classi orientamento

Le classi:

```text
private-portrait
private-landscape
```

sono usate come concetto generale. Valutare:

```text
image-portrait
image-landscape
```

## 21.3 Eliminare duplicazioni lightbox CSS

Sono presenti:

```text
css/components/lightbox.css
css/effects/lightbox.css
```

Solo il primo è importato nel file principale. Verificare se il secondo è obsoleto.

## 21.4 Versione Node esplicita

Aggiungere `.nvmrc` o `engines`.

## 21.5 Configurazione dominio centralizzata

Il dominio è ripetuto nel layout. Potrebbe essere spostato in un file dati globale:

```text
src/_data/site.js
```

## 21.6 Dati globali del sito

Un futuro `site.js` potrebbe contenere:

```js
module.exports = {
  name: "Fabrizio Vinciguerra Photography",
  url: "https://www.fabriziovinciguerraph.com",
  language: "en",
  author: "Fabrizio Vinciguerra",
  social: { ... }
};
```

## 21.7 Autenticazione evoluta

L’attuale sistema è adatto a password condivise. Possibili evoluzioni:

- password hashate a riposo;
- link firmati;
- scadenza per galleria;
- revoca sessione;
- rate limiting;
- log accessi;
- account cliente;
- selezioni salvate server-side.

## 21.8 Content Security Policy

Non risultano file `_headers` o configurazioni CSP nell’archivio. Valutare header:

- `Content-Security-Policy`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- `X-Content-Type-Options`;
- `Strict-Transport-Security`.

## 21.9 Test automatici

Non risultano test automatici. Possibili test:

- build smoke test;
- verifica sitemap;
- verifica URL immagini;
- test auth;
- test slug;
- test metadata;
- controllo HTML.

---

# 22. Procedure operative

## 22.1 Avviare il sito in locale

```bash
cd project-fv
npm install
npm run dev
```

Non modificare file dentro `_site/`.

## 22.2 Eseguire una build pulita

```bash
rm -rf _site
npm run build
```

## 22.3 Aggiungere una foto a una galleria pubblica

1. esportare la fotografia;
2. rinominarla secondo convenzione;
3. copiarla nella cartella corretta;
4. aggiungere metadati;
5. avviare `npm run dev`;
6. verificare ordine, orientamento, alt e lightbox;
7. eseguire build.

## 22.4 Rimuovere una foto

1. eliminare il file immagine;
2. eliminare la relativa voce metadata;
3. verificare che non sia usata come copertina o Open Graph;
4. eseguire build.

## 22.5 Cambiare l’ordine

L’ordine deriva dal filename. Cambiare il prefisso numerico:

```text
sicily-01-...
sicily-02-...
```

Dopo una rinomina, aggiornare la chiave metadata.

## 22.6 Aggiungere una pagina

1. creare file `.njk` sotto `src/`;
2. aggiungere Front Matter;
3. usare `layout.njk`;
4. definire title e description;
5. aggiungere Open Graph;
6. collegare la pagina;
7. verificare sitemap;
8. aggiungere CSS dedicato solo se necessario.

## 22.7 Aggiungere una galleria privata

Seguire la procedura del capitolo 15.12.

## 22.8 Cambiare password

Aggiornare `GALLERY_CONFIG` nella dashboard Cloudflare.

Le sessioni esistenti restano valide fino alla scadenza perché il token è firmato sullo slug e sulla scadenza, non sulla password. Per invalidarle immediatamente è necessario cambiare `GALLERY_SESSION_SECRET`, invalidando tutte le sessioni private.

## 22.9 Cambiare durata sessione

Modificare:

```js
const SESSION_DURATION_SECONDS = 60 * 60 * 2;
```

in `functions/_lib/auth.js`, poi eseguire deploy.

## 22.10 Aggiornare i premi

Verificare e aggiornare insieme:

- pagina About;
- JSON-LD Person;
- eventuali didascalie;
- immagini premio;
- descrizioni SEO.

---

# 23. Troubleshooting

## 23.1 Le immagini non compaiono

Controllare:

- cartella corretta;
- estensione supportata;
- maiuscole/minuscole;
- percorso in `getGallery()`;
- output warning in terminale;
- presenza di `assets/` nella build;
- nome file non duplicato.

## 23.2 Ordine errato

Rinominare con numeri a due cifre:

```text
01
02
03
```

Anche se l’ordinamento è numerico, una convenzione uniforme rende più leggibile il repository.

## 23.3 Errore image-size

Verificare che il file sia un’immagine valida e non corrotto. `imageSize(buffer)` viene eseguito per ogni file selezionato.

## 23.4 CSS non aggiornato

1. verificare che il modulo sia importato da `css/style.css`;
2. controllare output esbuild;
3. riavviare `npm run dev`;
4. cancellare `_site/`;
5. fare hard refresh del browser.

## 23.5 JavaScript 404

Controllare:

- nome file;
- estensione `.js`;
- percorso relativo nell’import;
- maiuscole/minuscole;
- presenza del file copiato in `_site/js/modules/`.

## 23.6 Login restituisce 404

Controllare:

- `returnTo`;
- slug valido;
- slug presente in `GALLERY_CONFIG`;
- JSON valido;
- URL `/private/[slug]/`.

## 23.7 Login restituisce 500

Probabile assenza di:

```text
GALLERY_SESSION_SECRET
```

oppure configurazione ambiente incompleta.

## 23.8 Password corretta ma accesso negato

Controllare:

- cookie bloccati;
- HTTPS;
- dominio;
- ambiente Preview vs Production;
- segreto differente tra richieste;
- ora del dispositivo;
- cookie scaduto.

## 23.9 Immagine privata visibile senza login

È una criticità. Controllare:

- che l’immagine sia sotto `/assets/images/private/[slug]/`;
- che il middleware sia stato distribuito;
- che non esista una copia pubblica;
- che Cloudflare Pages Functions sia attivo;
- che il percorso rispetti la regex dello slug.

## 23.10 SEO non aggiornato

Controllare:

- Front Matter;
- output HTML in `_site`;
- canonical;
- cache Cloudflare;
- immagine Open Graph;
- JSON-LD;
- sitemap.

---

# 24. Registro delle modifiche

## Versione 1.0 — luglio 2026

- Prima documentazione completa dell’architettura.
- Descritta la struttura reale Eleventy.
- Documentata la pipeline CSS con esbuild.
- Documentati i moduli JavaScript.
- Documentato il sistema di gallerie dinamiche.
- Documentato il sistema di metadati.
- Documentata la protezione server-side delle gallerie private.
- Documentati SEO, dati strutturati e Cloudflare Pages.
- Aggiunte procedure operative e troubleshooting.
- Registrati debito tecnico e roadmap.

---

# 25. Appendici tecniche

## 25.1 Variabili ambiente

| Variabile | Obbligatoria | Segreta | Descrizione |
|---|---:|---:|---|
| `GALLERY_CONFIG` | per gallerie private | sì | JSON slug/password |
| `GALLERY_SESSION_SECRET` | per gallerie private | sì | firma HMAC token |

## 25.2 Regex slug

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Valide:

```text
dance-2026
client-gallery
event-01
```

Non valide:

```text
Dance-2026
dance_2026
dance 2026
/dance-2026
```

## 25.3 Percorsi protetti

Pagine:

```regex
^/private/([a-z0-9]+(?:-[a-z0-9]+)*)(?:/|$)
```

Immagini:

```regex
^/assets/images/private/([a-z0-9]+(?:-[a-z0-9]+)*)/
```

## 25.4 Cookie

```text
Nome: fv_gallery_[slug]
Durata: 2 ore
HttpOnly: sì
Secure: sì
SameSite: Lax
Path: /
```

## 25.5 Output oggetto galleria

```js
{
  src: "/assets/images/[folder]/[file]",
  filename: "[file senza estensione]",
  title: "...",
  alt: "...",
  location: "...",
  caption: "...",
  class: "private-portrait | private-landscape"
}
```

## 25.6 Checklist nuova pubblicazione

```text
[ ] npm install completato
[ ] npm run build senza errori
[ ] Home verificata
[ ] Menu verificato
[ ] Collezioni verificate
[ ] Lightbox verificata
[ ] Mobile verificato
[ ] Console pulita
[ ] Sitemap valida
[ ] Robots valido
[ ] Canonical corretti
[ ] Open Graph corretto
[ ] Immagini ottimizzate
[ ] Login privato testato
[ ] Immagine privata testata senza sessione
[ ] Variabili Cloudflare configurate
[ ] Commit Git creato
[ ] Documento architettura aggiornato
```

## 25.7 File non presenti nei materiali analizzati

Non risultavano presenti nell’archivio:

- `_headers`;
- `_redirects`;
- `wrangler.toml`;
- `.nvmrc`;
- `.env.example`;
- configurazione esportata della dashboard Cloudflare;
- workflow GitHub Actions;
- test automatici;
- README.

La loro assenza nell’archivio non prova necessariamente che non esistano nel repository corrente. Prima di aggiungerli o documentarli come definitivi, verificare la root reale del progetto e la dashboard Cloudflare.

---

# Conclusione

FV Portfolio è un progetto statico strutturato, modulare e già più evoluto di un semplice sito Eleventy.

La parte pubblica sfrutta la semplicità della generazione statica. La parte privata aggiunge un livello edge reale tramite Cloudflare Pages Functions. Le gallerie vengono costruite automaticamente dai file, i metadati sono separati dalle pagine e l’interfaccia è organizzata in moduli CSS e JavaScript indipendenti.

Le priorità future più importanti sono:

1. pipeline immagini responsive;
2. header di sicurezza;
3. versione Node esplicita;
4. centralizzazione dei dati globali;
5. test automatici;
6. revisione delle duplicazioni CSS;
7. ulteriore evoluzione delle gallerie private.

Questo file deve essere aggiornato ogni volta che cambia una parte strutturale del progetto.
