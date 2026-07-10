import BaseElement from "../../../utils/BaseElement.js";
import style from "./NavigationBar.css" with { type: "css" };


class NavigationLink extends HTMLElement {

    constructor() {
        super();
    }
}


class NavigationBar extends BaseElement {

    constructor() {
        super();

        this._heading = this.shadowRoot.querySelector("[part='heading']")
        this._themeButtons = [...this.shadowRoot.querySelectorAll("button.theme")];
        this._menuButton = this.shadowRoot.querySelector("button.menu");
        this._closeButton = this.shadowRoot.querySelector("button.close");
        this._backdrop = this.shadowRoot.querySelector("[part='backdrop']");
        this._sidebar = this.shadowRoot.querySelector("aside");
        this._navbarLinks = this.shadowRoot.querySelector("header > nav");
        this._sidebarLinks = this.shadowRoot.querySelector("aside > nav");

        this._activeView = null;
    }

    static template = `
        <header part="navbar-base">
            <h1 part="heading"></h1>
            <nav></nav>
            <button class="theme" aria-label="Switch theme">
                <vector-icon name="theme" part="icon"></vector-icon>
            </button>
            <button class="menu" aria-label="View sidebar">
                <vector-icon name="menu" part="icon"></vector-icon>
            </button>
        </header>
        <div part="backdrop"></div>
        <aside part="sidebar-base">
            <header>
                <button class="theme" aria-label="Switch theme">
                    <vector-icon name="theme" part="icon"></vector-icon>
                </button>
                <button class="close" aria-label="Close sidebar">
                    <vector-icon name="close" part="icon"></vector-icon>
                </button>
            </header>
            <nav></nav>
        </aside>
    `;

    static styles = [style];

    static get properties() {
        return { "heading": String };
    }

    connectedCallback() {
        super.connectedCallback();
        
        for (const link of this.querySelectorAll("nav-link")) {
            const navbarLink = document.createElement("a");
            navbarLink.textContent = link.textContent;
            navbarLink.dataset.view = link.getAttribute("view");

            if (link.hasAttribute("active")) {
                navbarLink.part.add("active-link");
                this._activeView = navbarLink.dataset.view;
            }
            
            navbarLink.part.add("navbar-link");
            this._navbarLinks.appendChild(navbarLink);

            const sidebarLink = navbarLink.cloneNode(true);
            sidebarLink.part.remove("navbar-link");
            sidebarLink.part.add("sidebar-link");
            this._sidebarLinks.appendChild(sidebarLink);

            link.remove();
        }

        this._menuButton.addEventListener("click", this.viewSidebar);
        this._closeButton.addEventListener("click", this.hideSidebar);
        this._themeButtons.forEach(button => button.addEventListener("click", this.notifyTheme));
        this._backdrop.addEventListener("click", this.hideSidebar);
        this._navbarLinks.addEventListener("click", this.notifyNavigation);
        this._sidebarLinks.addEventListener("click", this.notifyNavigation);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this._heading.textContent = newValue || "";
    }

    disconnectedCallback() {
        this._menuButton.removeEventListener("click", this.viewSidebar);
        this._closeButton.removeEventListener("click", this.hideSidebar);
        this._themeButtons.forEach(button => button.removeEventListener("click", this.notifyTheme));
        this._backdrop.removeEventListener("click", this.hideSidebar);
        this._navbarLinks.removeEventListener("click", this.notifyNavigation);
        this._sidebarLinks.removeEventListener("click", this.notifyNavigation);
    }

    get view() {
        return this._activeView;
    }

    set view(targetView) {
        this._activeView = targetView;

        for (const link of [...this._navbarLinks.children, ...this._sidebarLinks.children]) {
            if (link.part.contains("active-link")) link.part.remove("active-link");
            if (link.dataset.view === targetView) link.part.add("active-link");
        }
    }

    viewSidebar = (event) => {
        this._sidebar.dataset.visible = "";
    }

    hideSidebar = (event) => {
        delete this._sidebar.dataset.visible;
    }

    notifyTheme = (event) => {
        event.stopPropagation();

        this.dispatchEvent(new CustomEvent("theme-change", {
            bubbles: true,
            composed: true
        }));
    }

    notifyNavigation = (event) => {
        event.stopPropagation();
        if (!event.target.closest("[data-view]")) return;
        this.hideSidebar();
        if (event.target.dataset.view === this._activeView) return;

        this.dispatchEvent(new CustomEvent("view-navigation", {
            bubbles: true,
            composed: true,
            detail: {
                currentView: this._activeView,
                targetView: event.target.dataset.view
            }
        }));
    }
}


customElements.define("nav-link", NavigationLink);
customElements.define("nav-bar", NavigationBar);