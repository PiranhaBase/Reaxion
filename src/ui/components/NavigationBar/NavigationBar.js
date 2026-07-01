import style from "./NavigationBar.css" with { type: "css" };


class NavigationLink extends HTMLElement {

    constructor() {
        super();
    }
}


class NavigationBar extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
    }

    get view() {
        return this.shadowRoot.querySelector("[part~='active-link']").dataset.view;
    }

    set view(targetView) {
        this.shadowRoot.querySelectorAll(`[part~="active-link"]`).forEach(link => {
            link.part.remove("active-link");
        });
        this.shadowRoot.querySelectorAll(`[data-view="${targetView}"]`).forEach(link => {
            link.part.add("active-link");
        });
    }

    connectedCallback() {
        const navBar = document.createElement("header");
        navBar.setAttribute("part", "navbar-base");
        const sideBar = document.createElement("aside");
        sideBar.setAttribute("part", "sidebar-base");
        const navLinks = document.createElement("nav");
        const sideLinks = document.createElement("nav");
        for (const link of this.querySelectorAll("nav-link")) {
            const navLink = document.createElement("a");
            navLink.textContent = link.textContent;
            navLink.part.add("navbar-link");
            if (link.hasAttribute("active")) navLink.part.add("active-link");
            navLink.dataset.view = link.getAttribute("view");
            navLinks.appendChild(navLink);
            const sideLink = navLink.cloneNode(true);
            sideLink.part.remove("navbar-link");
            sideLink.part.add("sidebar-link");
            sideLinks.appendChild(sideLink);
            link.remove();
        }
        const title = document.createElement("h1");
        title.setAttribute("part", "title");
        title.textContent = this.getAttribute("title") ?? "";
        this.removeAttribute("title");
        const sideHeader = document.createElement("header");
        const themeButton = document.createElement("button");
        const menuButton = document.createElement("button");
        const closeButton = document.createElement("button");
        themeButton.classList.add("theme");
        menuButton.classList.add("menu");
        closeButton.classList.add("close");
        themeButton.setAttribute("aria-label", "Switch theme");
        menuButton.setAttribute("aria-label", "View sidebar");
        closeButton.setAttribute("aria-label", "Close sidebar");
        const themeIcon = document.createElement("vector-icon");
        const menuIcon = document.createElement("vector-icon");
        const closeIcon = document.createElement("vector-icon");
        themeIcon.part.add("icon");
        menuIcon.part.add("icon");
        closeIcon.part.add("icon");
        themeIcon.setAttribute("name", "theme");
        menuIcon.setAttribute("name", "menu");
        closeIcon.setAttribute("name", "close");
        themeButton.appendChild(themeIcon);
        menuButton.appendChild(menuIcon);
        closeButton.appendChild(closeIcon);
        navBar.append(title, navLinks, themeButton, menuButton);
        sideHeader.append(themeButton.cloneNode(true), closeButton);
        sideBar.append(sideHeader, sideLinks);
        const backdrop = document.createElement("div");
        backdrop.part.add("backdrop");
        this.shadowRoot.append(navBar, backdrop, sideBar);
        menuButton.addEventListener("click", this.viewSidebar);
        closeButton.addEventListener("click", this.hideSidebar);
        backdrop.addEventListener("click", this.hideSidebar);
        this.shadowRoot.querySelectorAll("button.theme").forEach(themeButton => {
            themeButton.addEventListener("click", this.dispatchThemeEvent);
        });
        navLinks.addEventListener("click", this.dispatchNavigationEvent);
        sideLinks.addEventListener("click", this.dispatchNavigationEvent);
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector("button.menu").removeEventListener("click", this.viewSidebar);
        this.shadowRoot.querySelector("button.close").removeEventListener("click", this.hideSidebar);
        this.shadowRoot.querySelector("[part='backdrop']").removeEventListener("click", this.hideSidebar);
        this.shadowRoot.querySelectorAll("button.theme").forEach(themeButton => {
            themeButton.removeEventListener("click", this.dispatchThemeEvent);
        });
        this.shadowRoot.querySelector("[part='navbar-base'] > nav").removeEventListener("click", this.dispatchNavigationEvent);
        this.shadowRoot.querySelector("[part='sidebar-base'] > nav").removeEventListener("click", this.dispatchNavigationEvent);
    }

    viewSidebar = (event) => {
        this.shadowRoot.querySelector("[part='backdrop']").setAttribute("data-visible", "");
        this.shadowRoot.querySelector("[part='sidebar-base']").setAttribute("data-visible", "");
    }

    hideSidebar = (event) => {
        this.shadowRoot.querySelector("[part='backdrop']").removeAttribute("data-visible");
        this.shadowRoot.querySelector("[part='sidebar-base']").removeAttribute("data-visible", "");
    }

    dispatchThemeEvent = (event) => {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("theme-change", {
            bubbles: true,
            composed: true
        }));
    }

    dispatchNavigationEvent = (event) => {
        event.stopPropagation();
        if (!event.target.hasAttribute("part")) return;
        this.hideSidebar();
        if (event.target.dataset.view === this.view) return;
        this.dispatchEvent(new CustomEvent("view-navigation", {
            bubbles: true,
            composed: true,
            detail: {
                currentView: this.view,
                targetView: event.target.dataset.view
            }
        }));
    }
}


customElements.define("nav-link", NavigationLink);
customElements.define("nav-bar", NavigationBar);