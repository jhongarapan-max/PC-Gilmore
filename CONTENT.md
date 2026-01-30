# How to Add Articles (Markdown)

Articles are written as **Markdown files** in the project. No Google Sheets needed.

## What you need

- **Any text editor** (Cursor, VS Code, Notepad, etc.)
- **Node.js** installed (only to rebuild the list after adding/editing articles)

## Add a new article

### 1. Create a Markdown file

Create a new file in the folder:

```
content/articles/
```

**Filename** = URL slug. Use lowercase, numbers, and hyphens only.  
Examples: `how-to-choose-ram.md`, `ssd-vs-hdd.md`, `first-post.md`

### 2. Use this structure

At the **top** of the file, add a **frontmatter** block (between `---` lines) with:

- `title` – Article title (shown on the list and article page)
- `date` – Publish date, best as `YYYY-MM-DD` (e.g. `2026-01-30`)
- `summary` – Short text for the card on the articles list
- `cover_image` – Optional. Image URL or path (e.g. `assets/image/articles/my-photo.jpg`). Leave empty or omit if no image.

Then write your article in **Markdown** below the second `---`.

**Example:**

```markdown
---
title: How to Choose the Right RAM for Your PC
date: 2026-01-30
summary: A quick guide to capacity, speed, and compatibility.
cover_image: 
---

Your intro paragraph in **bold** or *italic*...

## Section heading

- List item one
- List item two

More paragraphs and [links](https://example.com).
```

### 3. Supported Markdown

- **Bold**: `**text**`
- *Italic*: `*text*`
- Headings: `## Heading` and `### Subheading`
- Lists: `- item` or `* item`
- Links: `[link text](url)`
- Code: `` `code` ``

### 4. Rebuild the article list

After adding or editing any `.md` file in `content/articles/`, run:

```bash
node scripts/build-articles.js
```

This updates `data/articles.json`. Refresh the site to see your article.

### 5. View the article

- **List**: open `articles.html`
- **Single article**: open `article.html?slug=your-filename` (use the filename without `.md`)

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create `content/articles/your-slug.md` |
| 2 | Add frontmatter (`title`, `date`, `summary`, optional `cover_image`) |
| 3 | Write the body in Markdown |
| 4 | Run `node scripts/build-articles.js` |
| 5 | Refresh the site |

No Google account, no Sheets, no CSV. Just edit a file and run one command.
