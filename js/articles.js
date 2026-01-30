/* ============================================
   PC GILMORE - Articles Page JavaScript
   Loads from data/articles.json (built from Markdown files)
   ============================================ */

const ARTICLES_JSON_URL = 'data/articles.json';

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
        const response = await fetch(ARTICLES_JSON_URL);
        if (!response.ok) throw new Error('Failed to fetch articles');

        const data = await response.json();
        allArticles = Array.isArray(data) ? data : [];
        allArticles = allArticles.filter(a => a.slug && a.title);
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
            const hay = `${a.title} ${a.summary} ${stripHtml(a.content || '')}`.toLowerCase();
            return hay.includes(q);
        });
        renderArticles(filtered);
    });
}

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}