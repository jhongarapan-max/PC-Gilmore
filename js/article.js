/* ============================================
   PC GILMORE - Single Article Page JavaScript
   Loads from data/articles.json (built from Markdown files)
   ============================================ */

const ARTICLES_JSON_URL = 'data/articles.json';

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
        if (contentEl) contentEl.innerHTML = '<p>Missing article slug.</p>';
        return;
    }

    try {
        const response = await fetch(ARTICLES_JSON_URL);
        if (!response.ok) throw new Error('Failed to fetch articles');

        const data = await response.json();
        const articles = Array.isArray(data) ? data : [];
        const article = articles.find(a => a.slug === slug);

        if (!article) throw new Error('Article not found');

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
        } else if (coverEl) {
            coverEl.style.display = 'none';
        }

        if (contentEl) {
            contentEl.innerHTML = article.content || '<p>No content.</p>';
        }
    } catch (e) {
        console.error('[Article] load failed:', e);
        if (titleEl) titleEl.textContent = 'Article not available';
        if (summaryEl) summaryEl.style.display = 'none';
        if (metaEl) metaEl.style.display = 'none';
        if (coverEl) coverEl.style.display = 'none';
        if (contentEl) contentEl.innerHTML = '<p>We couldn\'t load this article right now. Please try again later.</p>';
    }
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}