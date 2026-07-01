const Theme = Object.freeze({
    LIGHT: "light",
    DARK: "dark"
});


let THEME = document.documentElement.dataset.theme;


function updateTheme() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        if (THEME === Theme.LIGHT) toggleTheme();
    }
    else if (THEME === Theme.DARK) toggleTheme();
}


function toggleTheme() {
    THEME = (THEME === Theme.LIGHT) ? Theme.DARK : Theme.LIGHT;
    document.documentElement.dataset.theme = THEME;
}


document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("nav-bar").addEventListener("theme-change", toggleTheme);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);
});


updateTheme();