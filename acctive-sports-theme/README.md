# ACCTIVE Sports Industries — Shopify Theme

A professional, production-ready **Shopify OS 2.0** theme for ACCTIVE Sports Industries — factory-direct custom sportswear from Meerut, UP, India.

---

## 🚀 GitHub → Shopify Import (Step by Step)

### Step 1: Push this theme to GitHub

```bash
cd acctive-sports-theme
git init
git add .
git commit -m "Initial theme commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/acctive-sports-theme.git
git push -u origin main
```

### Step 2: Connect GitHub to Shopify

1. Go to **Shopify Admin → Online Store → Themes**
2. Click **Add theme → Connect from GitHub**
3. Authorize the Shopify GitHub app
4. Select your repository: `acctive-sports-theme`
5. Select branch: `main`
6. Click **Connect**
7. The theme will appear — click **Customize** or **Publish**

---

## ⚙️ Required Shopify Admin Setup

After importing the theme, complete these steps in Shopify Admin:

### 1. Create Navigation Menus

Go to **Online Store → Navigation** and create:

| Menu Handle | Menu Name | Links |
|---|---|---|
| `main-menu` | Main Menu | Shop → /collections/all, About → /pages/about, Contact → /pages/contact |
| `footer` | Footer | Home, Shop All, About Us, Contact, Custom Order |
| `footer-collections` | Footer Collections | Collar T-Shirts, Round Neck T-Shirts, Shorts, Lowers, Tracksuits, Track Jackets |

### 2. Create Collections

Go to **Products → Collections** and create:

| Collection Name | Handle |
|---|---|
| Collar T-Shirts | `collar-t-shirts` |
| Round Neck T-Shirts | `round-neck-t-shirts` |
| Shorts | `shorts` |
| Lowers | `lowers` |
| Tracksuits | `tracksuits` |
| Track Jackets | `track-jackets` |
| Featured | `featured` |
| New Arrivals | `new-arrivals` |

### 3. Create Metafield Definitions

Go to **Settings → Custom Data → Products** and add:

| Field Name | Namespace & Key | Type |
|---|---|---|
| Fabric | `custom.fabric` | Single line text |
| Sport | `custom.sport` | Single line text |
| MOQ | `custom.moq` | Integer |
| Back Image | `custom.back_image` | File (image) |

### 4. Set Up Bulk Discount (50% for 5+ pieces)

Go to **Discounts → Create discount → Automatic discount**:
- Type: **Percentage**
- Percentage: **50%**
- Minimum purchase: **Minimum quantity of items** → **5**
- Applies to: **All products**
- Name: "5+ Pieces Bulk Discount"

> The theme shows the notice and preview — the actual checkout deduction requires this Shopify Automatic Discount.

### 5. Install Shopify Search & Discovery App

Go to **Apps → Shopify App Store** → Install **Search & Discovery (free)**.

Then configure filters:
- **Availability** — enabled
- **Price** — enabled
- **Product type** — enabled
- **custom.fabric** — label "Fabric"
- **custom.sport** — label "Sport"

### 6. Upload Logo

Go to **Online Store → Themes → Customize → Theme Settings → Brand** and upload your logo.

---

## 📁 Theme Structure

```
acctive-sports-theme/
├── assets/
│   ├── base.css          # Design tokens, reset, typography
│   ├── theme.css         # All component styles
│   └── theme.js          # Interactive functionality
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
├── layout/
│   └── theme.liquid       # Root layout
├── locales/
│   └── en.default.json
├── sections/
│   ├── announcement-bar.liquid
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero.liquid
│   ├── trust-bar.liquid
│   ├── collection-grid.liquid
│   ├── featured-products.liquid
│   ├── shop-by-sport.liquid
│   ├── custom-order-process.liquid
│   ├── why-choose-us.liquid
│   ├── faq.liquid
│   ├── newsletter.liquid
│   ├── main-collection.liquid
│   ├── main-product.liquid
│   ├── main-cart.liquid
│   ├── main-page.liquid
│   └── main-search.liquid
├── snippets/
│   ├── product-card.liquid
│   ├── price.liquid
│   ├── size-selector.liquid
│   ├── whatsapp-button.liquid
│   ├── breadcrumb.liquid
│   ├── pagination.liquid
│   └── meta-tags.liquid
└── templates/
    ├── index.json
    ├── collection.json
    ├── product.json
    ├── cart.json
    ├── page.json
    ├── search.json
    └── 404.liquid
```

---

## 🎨 Brand Colors

| Token | Color | Hex |
|---|---|---|
| Primary | Deep Navy | `#0B1F33` |
| Accent | Sports Orange | `#FF6B1A` |
| Accent Hover | Dark Orange | `#E85A0C` |
| Background | Soft White | `#F8FAFC` |
| Card BG | White | `#FFFFFF` |
| Text | Charcoal | `#17212B` |
| Muted | Slate Gray | `#64748B` |
| Border | Light Gray | `#E2E8F0` |

---

## 📞 Contact Details (pre-configured)

- **WhatsApp:** +91 99971 00375
- **Email:** activesportswears@gmail.com
- **Location:** Meerut, Uttar Pradesh, India

---

## 🔧 Theme Editor

All sections are fully editable without code in **Shopify Admin → Online Store → Themes → Customize**:
- Announcement bar text, colors, dismissible toggle
- Hero heading, subheading, images, and CTAs
- Collection cards (pick any collection)
- Sport tags with emoji and URLs
- Custom order steps
- FAQ questions and answers
- Newsletter copy
- Footer menus and branding

---

## ✅ Checklist Before Going Live

- [ ] Logo uploaded in Theme Settings
- [ ] All 8 collections created with products
- [ ] Metafield definitions created (fabric, sport, MOQ, back_image)
- [ ] Automatic 50% bulk discount created in Discounts
- [ ] Search & Discovery app installed and filters configured
- [ ] Navigation menus created (main-menu, footer, footer-collections)
- [ ] Contact page created at `/pages/contact`
- [ ] Custom Order page created at `/pages/custom-order`
- [ ] WhatsApp number verified
- [ ] Test on mobile — 375px, 768px
- [ ] Test add to cart, cart drawer, checkout flow

---

*Built for ACCTIVE Sports Industries, Meerut — Since 2003* 🇮🇳
