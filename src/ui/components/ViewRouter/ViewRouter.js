class ViewRouter extends HTMLElement {

    constructor() {
        super();
        this.scrollCache = new Map();
    }

    connectedCallback() {
        Array.from(this.children).forEach((view) => {
            view.hidden = true;
            this.scrollCache.set(view, 0);
        });
        const activeView = this.querySelector(document.querySelector("nav-bar").view);
        this.navigate(activeView, activeView);

        document.addEventListener("view-navigation", this.switchView);
        document.addEventListener("reaction-selected", this.navigateHome);
    }

    switchView = (event) => {
        const targetView = this.querySelector(event.detail.targetView);
        const currentView = this.querySelector(event.detail.currentView);
        
        this.navigate(currentView, targetView);
    }

    navigateHome = (event) => {
        this.navigate(event.target, this.querySelector("home-view"));
    }

    navigate(currentView, targetView) {
        this.scrollCache.set(currentView, window.scrollY);

        currentView.hidden = true;
        targetView.hidden = false;

        window.scrollTo({
            top: this.scrollCache.get(targetView),
            left: 0,
            behavior: "instant"
        });

        if (!targetView.initialized) targetView.initialize();
        document.querySelector("nav-bar").view = targetView.localName;
    }
}


customElements.define("view-router", ViewRouter);