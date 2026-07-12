class ViewRouter extends HTMLElement {

    constructor() {
        super();
        this.views = {};
        this.navBar = document.querySelector("nav-bar");
    }

    connectedCallback() {
        [...this.children].forEach((view) => {
            view.hidden = true;
            this.views[view.localName] = {
                viewNode: view,
                scrollCache: 0
            };
        });
        
        const activeView = this.views[this.navBar.view].viewNode;
        this.navigate(activeView, activeView);

        document.addEventListener("view-navigation", this.switchView);
        document.addEventListener("reaction-selected", this.navigateHome);
    }

    switchView = (event) => {
        const targetView = this.views[event.detail.targetView].viewNode;
        const currentView = this.views[event.detail.currentView].viewNode;
        
        this.navigate(currentView, targetView);
    }

    navigateHome = (event) => {
        this.navigate(event.target, this.views[event.detail.targetView].viewNode);
    }

    navigate(currentView, targetView) {
        this.views[currentView.localName].scrollCache = window.scrollY;

        currentView.hidden = true;
        targetView.hidden = false;

        window.scrollTo({
            top: this.views[targetView.localName].scrollCache,
            left: 0,
            behavior: "instant"
        });

        if (!targetView.initialized) targetView.initialize();
        this.navBar.view = targetView.localName;
    }
}


customElements.define("view-router", ViewRouter);