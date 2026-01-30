/* ============================================
   PC GILMORE - Single Article Page JavaScript
   Google Sheets (Published CSV) Integration
   ============================================ */

// Keep these in sync with articles.js
const ARTICLES_GOOGLE_SHEET_PUBLISH_KEY = '2PACX-1vRYYlyhEfnpRhDAuXL8xQ0LOPPR4wT-p4GfE1jKfU0U1Y_OmCYo8qjCRAOiG6BddvgSY1jVTv_APdm2';
const ARTICLES_SHEET_GID = '0';

document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
});

async function loadArticle() {
    const slug = new URLSearchParams(window.location.search).get('slug') || '';
    const titleEl = document.getElementById('articleTitle');
    const summaryEl = document.getElementById('articleSummary');
    const metaEl = document.getElementById('articleMeta');
    const contentEl = document.getElementById('articleContent');
    const coverEl = document.getElementById('articleCover');

    if (!slug) {
        if (titleEl) titleEl.textContent = 'Article not found';
        if (contentEl) contentEl.innerHTML = `<p>Missing article slug.</p>`;
        return;
    }

    try {
        const url = `https://docs.google.com/spreadsheets/d/e/${ARTICLES_GOOGLE_SHEET_PUBLISH_KEY}/pub?gid=${ARTICLES_SHEET_GID}&single=true&output=csv`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch articles CSV');

        const csvText = await response.text();
        const items = parseCSVData(csvText).map(normalizeArticle);

        const article = items.find(a => a.slug === slug);
        if (!article) throw new Error('Article not found in sheet');

        // Set page title
        document.title = `${article.title} | PC Gilmore`;

        if (titleEl) titleEl.textContent = article.title;
        if (summaryEl) {
            summaryEl.textContent = article.summary || '';
            summaryEl.style.display = article.summary ? 'block' : 'none';
        }
        if (metaEl) {
            metaEl.textContent = article.dateDisplay ? `Published: ${article.dateDisplay}` : '';
            metaEl.style.display = 'block';
        }

        if (coverEl && article.cover_image) {
            coverEl.innerHTML = `<img src="${escapeHtml(article.cover_image)}" alt="${escapeHtml(article.title)}">`;
            coverEl.style.display = 'block';
        }

        if (contentEl) {
            contentEl.innerHTML = renderContent(article.content);
        }
    } catch (e) {
        console.error('[Article] load failed:', e);
        if (titleEl) titleEl.textContent = 'Article not available';
        if (summaryEl) summaryEl.style.display = 'none';
        if (metaEl) metaEl.style.display = 'none';
        if (contentEl) contentEl.innerHTML = `<p>We couldn't load this article right now. Please try again later.</p>`;
    }
}

function renderContent(text) {
    // Simple renderer:
    // - blank line => paragraph break
    // - lines starting with "- " => bullet list
    // - lines starting with "## " => h2
    // - lines starting with "### " => h3
    const lines = String(text || '').split(/\r?\n/);
    const out = [];
    let listOpen = false;

    function closeList() {
        if (listOpen) {
            out.push('</ul>');
            listOpen = false;
        }
    }

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();

        if (line.trim() === '') {
            closeList();
            continue;
        }

        if (line.startsWith('### ')) {
            closeList();
            out.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ''))}</h3>`);
            continue;
        }

        if (line.startsWith('## ')) {
            closeList();
            out.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ''))}</h2>`);
            continue;
        }

        if (line.startsWith('- ')) {
            if (!listOpen) {
                out.push('<ul>');
                listOpen = true;
            }
            out.push(`<li>${escapeHtml(line.replace(/^-+\s+/, ''))}</li>`);
            continue;
        }

        closeList();
        out.push(`<p>${escapeHtml(line)}</p>`);
    }

    closeList();
    return out.join('\n');
}

function normalizeArticle(raw) {
    const slug = (raw.slug || '').trim();
    const title = (raw.title || '').trim();
    const dateRaw = (raw.date || '').trim();
    const summary = (raw.summary || '').trim();
    const content = (raw.content || '').trim();
    const cover_image = (raw.cover_image || '').trim();

    const dateInfo = parseDate(dateRaw);

    return {
        slug,
        title,
        dateRaw,
        dateDisplay: dateInfo.display,
        dateSort: dateInfo.sort,
        summary,
        content,
        cover_image
    };
}

function parseDate(dateRaw) {
    if (!dateRaw) return { display: '', sort: 0 };
    const t = Date.parse(dateRaw);
    if (!Number.isFinite(t)) return { display: dateRaw, sort: 0 };
    const d = new Date(t);
    const display = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return { display, sort: t };
}

function parseCSVData(csvText) {
    const rows = parseCSVRows(csvText);
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const items = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        const item = {};
        headers.forEach((header, idx) => {
            item[header] = values[idx] || '';
        });
        if (item.slug || item.title) items.push(item);
    }

    return items;
}

function parseCSVRows(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                currentRow.push(currentField.trim());
                if (currentRow.some(f => f !== '')) rows.push(currentRow);
                currentRow = [];
                currentField = '';
                if (char === '\r') i++;
            } else if (char !== '\r') {
                currentField += char;
            }
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== '')) rows.push(currentRow);
    }

    return rows;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}