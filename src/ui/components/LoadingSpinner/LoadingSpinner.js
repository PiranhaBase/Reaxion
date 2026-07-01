import style from "./LoadingSpinner.css" with { type: "css" };

class LoadingSpinner extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [style];
        
        const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const spinner = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const stroke = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        track.part.add("track");
        stroke.part.add("stroke");
        spinner.append(track, stroke);
        wrapper.setAttribute("viewBox", "0 0 100 100");
        wrapper.appendChild(spinner);
        this.setAttribute("role", "status");
        this.shadowRoot.appendChild(wrapper);
    }

    static get observedAttributes() {
        return ["active"];
    }

    connectedCallback() {
        this.setAttribute("aria-label", this.textContent || "Loading");
        this.replaceChildren();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue === null) {
            this.shadowRoot.querySelector("svg").removeAttribute("active");
        }
        else this.shadowRoot.querySelector("svg").setAttribute("active", "");
    }
}

customElements.define("loading-spinner", LoadingSpinner);