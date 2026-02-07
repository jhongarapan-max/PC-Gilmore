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
        if (contentEl) contentEl.innerHTML = '<p>Missing article slug.</p>';
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
            const resolvedCover = resolveMediaUrl(article.cover_image, 'image');
            if (resolvedCover && resolvedCover.type === 'img') {
                coverEl.innerHTML = `<img src="${escapeHtml(resolvedCover.src)}" alt="${escapeHtml(article.title)}" data-original="${escapeHtml(article.cover_image)}">`;
            } else if (resolvedCover && resolvedCover.type === 'iframe') {
                coverEl.innerHTML = `<div class="video-wrap"><iframe src="${escapeHtml(resolvedCover.src)}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen data-original="${escapeHtml(article.cover_image)}"></iframe></div>`;
            } else {
                coverEl.innerHTML = `<img src="${escapeHtml(article.cover_image)}" alt="${escapeHtml(article.title)}" data-original="${escapeHtml(article.cover_image)}">`;
            }
            coverEl.style.display = 'block';
        } else if (coverEl) {
            coverEl.style.display = 'none';
        }

        if (contentEl) {
            contentEl.innerHTML = renderContent(article.content);
            attachMediaFallbacks(contentEl);
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

function renderContent(text) {
    // Simple renderer: blank line => paragraph, ## => h2, ### => h3, - => list, [image]path|alt[/image] => img, [video] => iframe
    const lines = String(text || '').split(/\r?\n/);
    const out = [];
    let listOpen = false;

    const imageTagRe = /^\[image\]([^\|\]]+)(?:\|([^\]]*))?\[\/image\]$/i;
    const videoTagRe = /^\[video\]([^\|\]]+)(?:\|([^\]]*))?\[\/video\]$/i;

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

        // video tag
        const videoMatch = line.match(videoTagRe);
        if (videoMatch) {
            closeList();
            const path = videoMatch[1].trim();
            const caption = (videoMatch[2] || '').trim();
            if (path) {
                out.push('<figure class="article-inline-video">');
                const resolved = resolveMediaUrl(path, 'video');
                if (resolved && resolved.type === 'iframe') {
                    out.push(`<div class="video-wrap"><iframe src="${escapeHtml(resolved.src)}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen data-original="${escapeHtml(path)}"></iframe></div>`);
                } else {
                    out.push(`<p><a href="${escapeHtml(path)}" target="_blank" rel="noopener">Open video</a></p>`);
                }
                if (caption) out.push(`<figcaption>${escapeHtml(caption)}</figcaption>`);
                out.push('</figure>');
            }
            continue;
        }

        // image tag
        const imageMatch = line.match(imageTagRe);
        if (imageMatch) {
            closeList();
            const path = imageMatch[1].trim();
            const alt = (imageMatch[2] || '').trim() || 'Article image';
            if (path) {
                out.push('<figure class="article-inline-image">');
                const resolved = resolveMediaUrl(path, 'image');
                if (resolved && resolved.type === 'img') {
                    out.push(`<img src="${escapeHtml(resolved.src)}" alt="${escapeHtml(alt)}" loading="lazy" data-original="${escapeHtml(path)}">`);
                } else if (resolved && resolved.type === 'iframe') {
                    out.push(`<div class="video-wrap"><iframe src="${escapeHtml(resolved.src)}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen data-original="${escapeHtml(path)}"></iframe></div>`);
                } else {
                    out.push(`<img src="${escapeHtml(path)}" alt="${escapeHtml(alt)}" loading="lazy">`);
                }
                if (imageMatch[2] && imageMatch[2].trim()) {
                    out.push(`<figcaption>${escapeHtml(imageMatch[2].trim())}</figcaption>`);
                }
                out.push('</figure>');
            }
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

        if (line.startsWith('- ') || line.startsWith('* ')) {
            if (!listOpen) {
                out.push('<ul>');
                listOpen = true;
            }
            out.push(`<li>${escapeHtml(line.replace(/^[-*]\s+/, ''))}</li>`);
            continue;
        }

        closeList();
        out.push(`<p>${escapeHtml(line)}</p>`);
    }

    closeList();
    return out.join('\n');
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

// ---- Google Drive helpers ----
function isDriveLink(url) {
    return typeof url === 'string' && /drive\.google\.com/.test(url);
}

function extractDriveId(url) {
    if (!url) return null;
    // /d/FILE_ID/ pattern
    let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    // ?id=FILE_ID pattern
    m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    return null;
}

function driveImageUrl(id) {
    return `https://drive.google.com/uc?export=view&id=${id}`;
}

function driveVideoPreviewUrl(id) {
    return `https://drive.google.com/file/d/${id}/preview`;
}

function resolveMediaUrl(url, preferred) {
    // preferred: 'image' or 'video'
    try {
        if (isDriveLink(url)) {
            const id = extractDriveId(url);
            if (!id) return { type: preferred === 'video' ? 'iframe' : 'img', src: url };
            if (preferred === 'video') return { type: 'iframe', src: driveVideoPreviewUrl(id) };
            // prefer image
            return { type: 'img', src: driveImageUrl(id) };
        }
    } catch (e) {
        return null;
    }
    // fallback: return original URL as img for images, iframe for video
    if (preferred === 'video') return { type: 'iframe', src: url };
    return { type: 'img', src: url };
}

// Attach runtime fallbacks for media that may be blocked by Drive sharing/CORS.
function attachMediaFallbacks(container) {
    try {
        const root = container || document.getElementById('articleContent');
        if (!root) return;

        // Images: if load fails, replace with a link to the original Drive URL and a note.
        const imgs = Array.from(root.querySelectorAll('img'));
        imgs.forEach(img => {
            let tries = 0;
            const original = img.getAttribute('data-original') || img.src;

            function tryFallback() {
                tries++;
                // First try: if we have a Drive share URL, try the `uc?export=view` form
                if (tries === 1 && isDriveLink(original)) {
                    const id = extractDriveId(original);
                    if (id) {
                        const alt = driveImageUrl(id);
                        if (alt && alt !== img.src) {
                            img.src = alt;
                            return;
                        }
                    }
                }

                // Second try: attempt the download endpoint
                if (tries === 2 && isDriveLink(original)) {
                    const id = extractDriveId(original);
                    if (id) {
                        const alt2 = `https://drive.google.com/uc?export=download&id=${id}`;
                        if (alt2 && alt2 !== img.src) {
                            img.src = alt2;
                            return;
                        }
                    }
                }

                // Final: mark as unavailable and show a non-clickable note (avoid forcing a link)
                img.classList.add('media-unavailable');
                const note = document.createElement('div');
                note.className = 'media-unavailable-note';
                note.textContent = 'Image unavailable — check Drive sharing permissions.';
                if (img.parentNode && !img.parentNode.querySelector('.media-unavailable-note')) {
                    img.parentNode.appendChild(note);
                }
            }

            img.addEventListener('error', () => {
                tryFallback();
            });
        });

        // Iframes (videos): append an explicit open link below the iframe so users can open if embedding is blocked.
        const iframes = Array.from(root.querySelectorAll('iframe'));
        iframes.forEach(frame => {
            const original = frame.getAttribute('data-original') || frame.src;
            const link = document.createElement('p');
            link.className = 'media-fallback-link';
            link.innerHTML = `<a href="${escapeHtml(original)}" target="_blank" rel="noopener">Open video in a new tab</a>`;
            if (frame.parentNode) frame.parentNode.insertBefore(link, frame.nextSibling);
        });
    } catch (e) {
        // silent
    }
}