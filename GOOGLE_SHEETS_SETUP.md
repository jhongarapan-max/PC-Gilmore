# Google Sheets Product Database Setup

This guide will help you set up Google Sheets as a database for your PC Gilmore products.

## Step 1: Create the Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "PC Gilmore Products"

## Step 2: Set Up the Columns

In the first row (Row 1), add these column headers **exactly as shown**:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| name | category | price | description | badge | image | images | shopee | specs |

### 📸 Using Google Drive Images (Recommended)

Instead of storing images locally, you can use Google Drive:

1. **Upload your product images to Google Drive**
2. **Right-click the image** → **"Get link"** → Set to **"Anyone with the link can view"**
3. **Copy the share link** (looks like: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`)
4. **Paste it directly in the `image` or `images` column** in your spreadsheet
5. The code will **automatically convert** it to a direct image URL!

**Example:**
- Google Drive share link: `https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view?usp=sharing`
- Just paste it in the spreadsheet - no conversion needed!

**Column descriptions:**

- **name** - Product name (e.g., "Intel Core i9-14900K")
- **category** - Use: `processors`, `graphics`, `motherboards`, `memory`, `storage`, `peripherals`
- **price** - Price with peso sign (e.g., "₱34,999")
- **description** - Full product description (can be long, will be truncated on cards but shown fully in modal)
- **badge** - Optional: "Popular", "New", "Best Seller", or leave empty
- **image** - Main image URL. Can be:
  - Local path: `assets/image/products/intel-i9.png`
  - Google Drive share link: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing` (automatically converted)
  - Direct image URL: `https://example.com/image.jpg`
- **images** - Comma-separated list of all image URLs for gallery (same formats as above)
- **shopee** - Shopee product link (e.g., "https://shopee.ph/product/123456")
- **specs** - Product specifications separated by `|` (e.g., "24 Cores | 32 Threads | 5.8GHz Boost | LGA 1700")

## Step 3: Add Your Products

Add products starting from Row 2. Example:

| name | category | price | description | badge | image | images | shopee | specs |
|------|----------|-------|-------------|-------|-------|--------|--------|-------|
| Intel Core i9-14900K | processors | ₱34,999 | The Intel Core i9-14900K is a powerful 24-core desktop processor featuring 8 performance cores and 16 efficiency cores. Perfect for gaming, content creation, and heavy multitasking. | Popular | assets/image/products/intel-i9.png | assets/image/products/intel-i9.png | https://shopee.ph/product/123 | 24 Cores (8P+16E) | 32 Threads | 5.8GHz Boost | LGA 1700 Socket | 125W TDP |
| NVIDIA RTX 4090 | graphics | ₱109,999 | The ultimate gaming GPU with incredible ray tracing performance and DLSS 3.0 support. Designed for 4K gaming and professional workloads. | Hot | assets/image/products/rtx-4090.png | assets/image/products/rtx-4090.png | https://shopee.ph/product/456 | 24GB GDDR6X | 16384 CUDA Cores | 2.52GHz Boost | 450W TDP | PCIe 4.0 |

## Step 4: Publish the Spreadsheet

1. Click **File** → **Share** → **Publish to web**
2. In the dialog:
   - Select **"Entire Document"**
   - Choose **"Comma-separated values (.csv)"** format
   - Click **Publish**
3. Copy the URL that appears (looks like):

   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1vT.../pub?output=csv
   ```

## Step 5: Get the Publish Key

From the published URL, extract the key (the long string after `/e/` and before `/pub`):

Example URL:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vTHibla5KZj1UUjt.../pub?output=csv
```

The publish key is:

```
2PACX-1vTHibla5KZj1UUjt...
```

## Step 6: Update the JavaScript

1. Open `js/products.js`
2. Find this line near the top:

   ```javascript
   const GOOGLE_SHEET_PUBLISH_KEY = '2PACX-1vTHibla5KZj1UUjt...';
   ```

3. Replace with YOUR publish key from Step 5
4. Save the file

## Step 7: Test It

1. Open your products page in a browser
2. Products should load automatically from Google Sheets
3. If there's an error, fallback sample data will show
4. Check browser console (F12 → Console) for any errors

---

## Managing Products

### To Add a New Product

1. Open the Google Sheet
2. Add a new row with product details
3. Refresh the website - the new product appears!

### To Edit a Product

1. Edit the product row in Google Sheets
2. Refresh the website - changes appear immediately

### To Delete a Product

1. Delete the row in Google Sheets
2. Refresh the website

---

## Category Slugs Reference

Use these exact category slugs in the spreadsheet:

| Display Name | Slug (use in spreadsheet) |
|--------------|---------------------------|
| Processors | `processors` |
| Graphics Cards | `graphics` |
| Motherboards | `motherboards` |
| Memory | `memory` |
| Storage | `storage` |
| Peripherals | `peripherals` |
| Cooler Fan | `cooler-fan` |
| Computer Accessories | `computer-accessories` |
| CCTV/IP Camera | `cctv-ip-camera` |
| Earphone/Headset | `earphone-headset` |
| Network Components | `network-components` |

---

## Troubleshooting

### Products not loading?

1. Make sure the spreadsheet is published as CSV (Step 4)
2. Check that the publish key is correct
3. Verify column headers are exactly: `name`, `category`, `price`, `description`, `badge`, `image`, `images`
4. Check browser console for errors (F12 → Console)

### Images not showing?

1. **Local images**: Use paths like `assets/image/products/product-name.png` and make sure files exist
2. **Google Drive images**: 
   - Upload image to Google Drive
   - Right-click → "Get link" → Set to "Anyone with the link can view"
   - Copy the share link (e.g., `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`)
   - Paste it in the spreadsheet - it will automatically convert to a direct image URL
3. **Direct URLs**: Use any direct image URL from the web (e.g., `https://example.com/image.jpg`)

### Still not working?

The fallback sample data should show if Google Sheets fails. Check:

1. Internet connection
2. Published URL is correct
3. Sheet is set to "Anyone with link can view"

---

## Your Current Setup

Your publish key is already configured:

```
2PACX-1vTHibla5KZj1UUjt3lhnNS0yHu2EPZFB4zes-Ku187LNPUOf7HUhUXMLuvIKOs_VNDpCXKwhffayvps
```

Make sure your Google Sheet has the correct column headers in Row 1!
