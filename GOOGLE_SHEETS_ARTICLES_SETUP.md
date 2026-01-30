# Google Sheets Articles (Simple CMS) Setup

This guide lets you add articles without an admin panel by using Google Sheets as your “CMS”.

## 1) Create an `Articles` sheet tab

In the **same spreadsheet** you already use for products (recommended), create a new tab named:

`Articles`

## 2) Add these column headers (Row 1)

Use these headers **exactly**:

| slug | title | date | summary | content | cover_image |
|------|-------|------|---------|---------|-------------|

### Field notes
- **slug**: unique id for URL (example: `how-to-choose-ram`)
- **title**: article title
- **date**: `YYYY-MM-DD` recommended (example: `2026-01-29`)
- **summary**: short text for the card preview
- **content**: the full article text (multi-line allowed)
- **cover_image**: optional image URL (can be local path or full URL)

## 3) Publish the sheet

1. Google Sheets → **File** → **Share** → **Publish to web**
2. Choose:
   - **Entire Document**
   - Format: **Comma-separated values (.csv)**
3. Click **Publish**

This produces a URL like:

`https://docs.google.com/spreadsheets/d/e/<PUBLISH_KEY>/pub?output=csv`

## 4) Update the website config

Open:
- `js/articles.js`
- `js/article.js`

Update these values:

```js
const ARTICLES_GOOGLE_SHEET_PUBLISH_KEY = '...';
const ARTICLES_SHEET_GID = '...';
```

### How to get `ARTICLES_SHEET_GID`
Open your `Articles` tab and look at the URL:

`.../edit#gid=123456789`

Copy that number.

## 5) Pages you can open

- `articles.html` → list of articles
- `article.html?slug=your-slug` → single article

