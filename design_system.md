# Design System: JobGiga Admin Portal

This document outlines the core design tokens, layout structures, components, and CSS class definitions utilized to construct pages inside the JobGiga workspace (such as [CustomizePage.tsx](file:///Users/muddassirmatakhir/Desktop/jg-hypercare/src/pages/CustomizePage.tsx)). Use this reference to maintain styling consistency when building subsequent pages.

---

## 🎨 Color Palette

| Usage | Color Value | Description | CSS Classes |
| :--- | :--- | :--- | :--- |
| **Primary Theme** | `#009698` | Core brand Teal. Used for buttons, active state accents, toggles, and highlights. | `.active`, `.add-teal-btn`, `.q-tag-name` |
| **Primary Theme Dark** | `#008080` | Deep teal. Used for hover states on buttons and primary action controls. | `.add-opt-btn:hover` |
| **Theme Light Bg** | `#f0fdfa` | Clean, subtle teal tint. Used for informational boxes and banner backgrounds. | `.ai-banner-teal`, `.nav-item:hover` |
| **Background (Main)** | `#f4f7f6` | Warm light-gray canvas background for the entire page body. | `body`, `.jobgiga-dashboard` |
| **Card / Surface Bg**| `#ffffff` | Pure white. Used for sidebar, top header, content panels, inputs, and modals.| `.card-box`, `.modal-container` |
| **Primary Text** | `#111827` | Dark charcoal. Applied to main titles, active headings, and bold labels. | `.modal-title`, `.main-form-title` |
| **Secondary Text** | `#4b5563` | Medium gray. Used for helper text, descriptive labels, and normal nav labels. | `.nav-item`, `.field-col label` |
| **Muted Text** | `#9ca3af` | Light gray. Used for placeholders, secondary indicators, and icons. | `.search-icon`, `::placeholder` |
| **Danger / Accent** | `#ef4444` | Red accent. Used for error highlights, delete operations, and close tags. | `.remove-opt-btn`, `.label-req::after` |

---

## 🔤 Typography

The typography system uses the **Inter** font family for all text across the interface.

* **Primary/Body Font**: `Inter`, sans-serif (imported via Google Fonts in [index.html](file:///Users/muddassirmatakhir/Desktop/jg-hypercare/index.html) and configured globally on the `body`).
* **Heading Font**: `Inter`, sans-serif (defined via CSS variables `--heading` and `--sans` in [index.css](file:///Users/muddassirmatakhir/Desktop/jg-hypercare/src/index.css)).
* **Monospace/Code Font**: `ui-monospace`, `Consolas`, monospace (defined via CSS variable `--mono` in [index.css](file:///Users/muddassirmatakhir/Desktop/jg-hypercare/src/index.css)).

---

## 📐 Layout & Containers

### Dashboard Layout Structure
The main container follows a flexbox row structure combining a sidebar and a vertical main panel content stack.
```html
<div class="jobgiga-dashboard">
  <aside class="sidebar">...</aside>
  <div class="main-panel">
    <nav class="navbar">...</nav>
    <main class="content-container">
      <div class="content-header-title">...</div>
      <!-- Core page body grid / form -->
    </main>
  </div>
</div>
```

* **Sidebar Width**: `240px` (fixed width, white background, right border: `1px solid #e5e7eb`).
* **Navbar Height**: `60px` (fixed height, white background, bottom border: `1px solid #e5e7eb`).
* **Content Container**: Padded `20px 28px` with scrolling enabled.
* **Form Grid**: A two-column grid (`.post-job-grid`) with `grid-template-columns: 1fr 1fr` and a `20px` spacing gap.

---

## 🧩 Core Components

### 1. Cards (`.card-box`)
White cards with rounded corners hosting specific form fields and sections.
* **Classes**: `.card-box`
* **CSS Properties**:
  ```css
  .card-box {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 20px 24px;
    border: 1px solid #e5e7eb;
  }
  ```

### 2. Form Inputs & Select fields
* **Inputs (`.input-field`)**:
  - Height: `38px`
  - Border: `1px solid #d1d5db` (transitions to border-color `#009698` on `:focus`)
  - Border Radius: `8px`
* **Select Wrappers (`.select-wrapper` & `.select-field`)**:
  - Standardized dropdown styling using an SVG chevron background icon.

### 3. Action Buttons & Badges
* **Primary Button (`.action-btn-continue`)**:
  - Teal background (`#009698`), white text, bold, `8px` border radius.
* **Secondary Back Button (`.action-btn-back`)**:
  - White background, dark border (`#d1d5db`), dark gray text.
* **Interactive Option Badges (`.question-badge-btn`)**:
  - Small pills (`padding: 8px 16px`, border radius `20px`).
  - Active state sets teal background and white text.

### 4. Toggle Switches (`.custom-switch-btn`)
Rounded slider toggles using clean CSS transition states.
* **Structure**:
  ```html
  <button class="custom-switch-btn active">
    <span class="switch-knob"></span>
  </button>
  ```

### 5. Interactive Modal dialogs
* **Overlay (`.modal-overlay`)**: Centered fixed positioning (`position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000;`).
* **Modal Card Container (`.modal-container`)**:
  - Max width: `620px`
  - Max height: `90vh`
  - Body box (`.modal-content-body`): Scrollable content area with `max-height: 550px`.

---

## 🛠️ Design System Class Quick Reference

```css
/* Quick utilities */
.mt-8 { margin-top: 8px; }
.mt-12 { margin-top: 12px; }
.mt-16 { margin-top: 16px; }
.mb-8 { margin-bottom: 8px; }
.mb-12 { margin-bottom: 12px; }
.flex-1 { flex: 1; }

/* AI Recommended Banners */
.ai-banner-teal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0fdfa;
  border: 1px dashed #009698;
  border-radius: 8px;
  padding: 10px 14px;
}
```
