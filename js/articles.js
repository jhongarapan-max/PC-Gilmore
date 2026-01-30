/* ============================================
   PC GILMORE - Articles Page JavaScript
   Google Sheets (Published CSV) Integration
   ============================================ */

const ARTICLES_GOOGLE_SHEET_PUBLISH_KEY = '2PACX-1vRYYlyhEfnpRhDAuXL8xQ0LOPPR4wT-p4GfE1jKfU0U1Y_OmCYo8qjCRAOiG6BddvgSY1jVTv_APdm2';

// Set this to the GID of your "Articles" sheet tab (open the tab, check URL: .../edit#gid=123456789)
const ARTICLES_SHEET_GID = '0';

// In your sheet, use headers (row 1): slug | title | date | summary | content | cover_image

let allArticles = [];

document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    initSearch();
});

async function loadArticles() {
    const listEl = document.getElementById('articlesList');
    if (!listEl) return;

    listEl.innerHTML = `
        <div class="articles-empty" style="grid-column: 1 / -1;">
            <h3>Loading articles...</h3>
            <p>Please wait.</p>
        </div>
    `;

    try {
        const url = `https://docs.google.com/spreadsheets/d/e/${ARTICLES_GOOGLE_SHEET_PUBLISH_KEY}/pub?gid=${ARTICLES_SHEET_GID}&single=true&output=csv`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch articles CSV');

        const csvText = await response.text();
        allArticles = parseCSVData(csvText)
            .map(normalizeArticle)
            .filter(a => a.slug && a.title);

        allArticles.sort((a, b) => (b.dateSort || 0) - (a.dateSort || 0));
        renderArticles(allArticles);
    } catch (e) {
        console.error('[Articles] load failed:', e);
        allArticles = [];
        renderArticles(allArticles);
    }
}

function renderArticles(articles) {
    const listEl = document.getElementById('articlesList');
    const emptyEl = document.getElementById('articlesEmpty');
    if (!listEl) return;

    if (!articles || articles.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    listEl.innerHTML = articles.map(a => {
        const cover = a.cover_image ? `
            <span class="article-card-cover">
                <img src="${escapeHtml(a.cover_image)}" alt="${escapeHtml(a.title)}">
            </span>
        ` : `<span class="article-card-cover"></span>`;

        return `
            <div class="article-card">
                ${cover}
                <div class="article-card-body">
                    <div class="article-card-meta">${escapeHtml(a.dateDisplay || '—')}</div>
                    <h3 class="article-card-title">
                        <a href="article.html?slug=${encodeURIComponent(a.slug)}">${escapeHtml(a.title)}</a>
                    </h3>
                    <p class="article-card-summary">${escapeHtml(a.summary || '')}</p>
                </div>
                <div class="article-card-footer">
                    <a class="article-readmore" href="article.html?slug=${encodeURIComponent(a.slug)}">
                        Read more →
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function initSearch() {
    const input = document.getElementById('articleSearch');
    if (!input) return;

    input.addEventListener('input', () => {
        const q = (input.value || '').trim().toLowerCase();
        if (!q) {
            renderArticles(allArticles);
            return;
        }

        const filtered = allArticles.filter(a => {
            const hay = `${a.title} ${a.summary} ${a.content || ''}`.toLowerCase();
            return hay.includes(q);
        });
        renderArticles(filtered);
    });
}

function normalizeArticle(raw) {
    const slug = (raw.slug || raw.SLUG || '').trim();
    const title = (raw.title || raw.TITLE || '').trim();
    const dateRaw = (raw.date || raw.DATE || '').trim();
    const summary = (raw.summary || raw.SUMMARY || '').trim();
    const content = (raw.content || raw.CONTENT || '').trim();
    const cover_image = (raw.cover_image || raw.coverimage || raw.cover || raw.image || '').trim();

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