import style from "./LoadingSpinner.css" with { type: "css" };

class LoadingSpinner extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];

        const svgNs = "http://www.w3.org/2000/svg";
        
        const wrapper = document.createElementNS(svgNs, "svg");
        wrapper.setAttribute("viewBox", "0 0 100 100");

        const spinner = document.createElementNS(svgNs, "g");

        const track = document.createElementNS(svgNs, "circle");
        track.part.add("track");

        const stroke = document.createElementNS(svgNs, "circle");
        stroke.part.add("stroke");

        spinner.append(track, stroke);
        wrapper.append(spinner);
        this.shadowRoot.append(wrapper);
    }

    static get observedAttributes() {
        return ["active"];
    }

    connectedCallback() {
        this.setAttribute("role", "status");

        if (this.hasOwnProperty("active")) {
            const active = this.active;
            delete this.active;
            this.active = active;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "active") {
            if (newValue !== null) {
                this.shadowRoot.querySelector("svg").dataset.active = "";
            }
            else delete this.shadowRoot.querySelector("svg").dataset.active;
        }
    }

    get active() {
        return this.hasAttribute("active");
    }

    set active(value) {
        if (value) this.setAttribute("active", "");
        else this.removeAttribute("active");
    }
}

customElements.define("loading-spinner", LoadingSpinner);