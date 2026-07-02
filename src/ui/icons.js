const ICONS = new CSSStyleSheet();

const ICON_DIR = new URL("../../assets/icons/", import.meta.url).href;


ICONS.replaceSync(`
    :root {
        --src-theme-icon: url(${ICON_DIR}moon.svg);
        --src-menu-icon: url(${ICON_DIR}menu.svg);
        --src-close-icon: url(${ICON_DIR}close.svg);
        --src-copy-icon: url(${ICON_DIR}copy.svg);
        --src-check-icon: url(${ICON_DIR}check.svg);
        --src-cross-icon: url(${ICON_DIR}cross.svg);
        --src-chevron-icon: url(${ICON_DIR}chevron.svg);
        --src-dropdown-icon: url(${ICON_DIR}dropdown.svg);
        --src-search-icon: url(${ICON_DIR}search.svg);
        --src-filter-icon: url(${ICON_DIR}filter.svg);
    }
    
    :root[data-theme="dark"] {
        --src-theme-icon: url(${ICON_DIR}sun.svg);
    }
`);


document.adoptedStyleSheets = [...document.adoptedStyleSheets, ICONS];