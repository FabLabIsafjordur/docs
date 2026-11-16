---
title: Contributing
icon: lucide/pencil
---

# Contributing

This documentation is an open and collaborative
knowledge base.

Anyone is welcome to contribute useful information,
share projects, document experiments, or improve
existing pages.

Documentation doesn't need to be perfect or complete.
The important thing is to share what we learn.

## Getting started

There are two ways to contribute:

**Make a pull request.** Anyone with a GitHub account can do this.
For small fixes, click the pencil icon at the top of any page. It opens the
page on GitHub, where you can edit it and propose the change. For new pages,
fork the [repository](https://github.com/FabLabIsafjordur/docs), add your
page, and open a pull request.

**Join the organization.** If you'll be contributing regularly, ask a
[staff member](https://www.fabisa.is/Um-smiðjuna/starfsfolk) to add you to the
FabLabIsafjordur organization on GitHub. Then you can edit and add pages
directly.

### Adding a new page

1. Pick the section and topic folder your page belongs in.
2. Copy a template from the [templates folder](https://github.com/FabLabIsafjordur/docs/tree/main/templates).
3. Write your page and add your images (see [Where things go](#where-things-go)).
4. Preview it locally with `zensical serve`.
5. Open a pull request, or push it if you're in the organization.

## Where things go

Pages are grouped by topic inside each section. Images go in a shared `img/`
folder in the section, in a subfolder named after the page.

```
docs/experiments/
├── img/
│   └── beehive-beam/          # images for one page
├── machine-building/          # topic folder
│   └── beehive-beam.md        # the page
└── index.md                   # section page with cards
```

- Write image paths relative to the `.md` file, for example
  `../img/beehive-beam/photo.jpg`. This also applies to HTML tags like `<video>`.
- Resize photos to about 1200 px wide before adding them.
- New pages show up in the menu automatically. Also add a card for your page
  on the section's `index.md`.

## Documentation templates

Templates are available in the
[GitHub repository](https://github.com/FabLabIsafjordur/docs/tree/main/templates).

## Writing guidelines

- Write in clear, simple English.
- Use descriptive headings.
- Include enough information to reproduce your work.
- Document failures as well as successes.
- Distinguish tested procedures from experiments.
- Link to original sources when possible.

## Reference

- [Markdown Reference](markdown.md)
- [Formatting Examples](formatting.md)
