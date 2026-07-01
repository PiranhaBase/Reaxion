let FILTERED = null;
let EXAMPLES = null;


function* getFiltered({ searchInput, categories, elements, types }) {
    for (const example of EXAMPLES) {
        if (!(!types.length || types.includes(example.type))) continue;
        if (!(!categories.length || categories.some(category => example.categories.includes(category)))) continue;
        if (!new RegExp(`${elements.join("[^a-z]|")}[^a-z]`).test(example.reaction)) continue;
        const terms = searchInput.split(/\s+/).filter(term => /[a-z]/i.test(term)).map(term => term.replace(/[^a-z0-9]/ig, ""));
        if (terms.every(term => new RegExp(term, "i").test(example.reaction))) yield example;
    }
}


onmessage = (event) => {
    if (!EXAMPLES) {
        EXAMPLES = event.data;
        return;
    }
    if (event.data.update) FILTERED = getFiltered(event.data.filters);
    else {
        const reactions = [];
        for (let i = 0; i < event.data.limit; ++i) {
            const { value: reaction, done } = FILTERED.next();
            if (done) {
                postMessage({ examples: reactions, finished: true });
                return;
            }
            reactions.push(reaction);
        }
        postMessage({ examples: reactions, finished: false });
    }
}