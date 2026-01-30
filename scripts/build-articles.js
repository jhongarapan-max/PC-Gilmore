/**
 * Build articles from Markdown files into data/articles.json
 * Run: node scripts/build-articles.js
 * No npm install needed.
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');
const OUT_FILE = path.join(__dirname, '..', 'data', 'articles.json');

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { front: {}, body: raw.trim() };
    const front = {};
    const frontText = match[1].trim();
    frontText.split(/\r?\n/).forEach(line => {
        const colon = line.indexOf(':');
        if (colon === -1) return;
        const key = line.slice(0, colon).trim().toLowerCase().replace(/\s+/g, '_');
        let val = line.slice(colon + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
            val = val.slice(1, -1);
        front[key] = val;
    });
    return { front, body: match[2].trim() };
}

function markdownToHtml(text) {
    const lines = String(text || '').split(/\r?\n/);
    const out = [];
    let listOpen = false;

    function closeList() {
        if (listOpen) {
            out.push('</ul>');
            listOpen = false;
        }
    }

    function inlineFormat(s) {
        return s
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    }

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();

        if (line.trim() === '') {
            closeList();
            continue;
        }

        if (line.startsWith('### ')) {
            closeList();
            out.push('<h3>' + escapeHtml(line.replace(/^###\s+/, '')) + '</h3>');
            continue;
        }
        if (line.startsWith('## ')) {
            closeList();
            out.push('<h2>' + escapeHtml(line.replace(/^##\s+/, '')) + '</h2>');
            continue;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
            if (!listOpen) {
                out.push('<ul>');
                listOpen = true;
            }
            const content = inlineFormat(escapeHtml(line.replace(/^[-*]\s+/, '')));
            out.push('<li>' + content + '</li>');
            continue;
        }

        closeList();
        out.push('<p>' + inlineFormat(escapeHtml(line)) + '</p>');
    }
    closeList();
    return out.join('\n');
}

function formatDate(dateRaw) {
    if (!dateRaw) return { display: '', sort: 0 };
    const t = Date.parse(dateRaw);
    if (!Number.isFinite(t)) return { display: dateRaw, sort: 0 };
    const d = new Date(t);
    const display = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return { display, sort: t };
}

function build() {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.log('No content/articles folder found. Creating empty data/articles.json.');
        const dataDir = path.dirname(OUT_FILE);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(OUT_FILE, JSON.stringify([], null, 2), 'utf8');
        return;
    }

    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const articles = [];

    for (const file of files) {
        const slug = path.basename(file, '.md');
        const filePath = path.join(CONTENT_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf8');
        const { front, body } = parseFrontmatter(raw);

        const title = (front.title || slug).trim();
        if (!title) continue;

        const dateRaw = (front.date || '').trim();
        const dateInfo = formatDate(dateRaw);
        const summary = (front.summary || '').trim();
        const cover_image = (front.cover_image || '').trim();
        const contentHtml = markdownToHtml(body);

        articles.push({
            slug,
            title,
            dateRaw,
            dateDisplay: dateInfo.display,
            dateSort: dateInfo.sort,
            summary,
            content: contentHtml,
            cover_image: cover_image || ''
        });
    }

    articles.sort((a, b) => (b.dateSort || 0) - (a.dateSort || 0));

    const dataDir = path.dirname(OUT_FILE);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(articles, null, 2), 'utf8');
    console.log('Built ' + articles.length + ' articles -> data/articles.json');
}

build();