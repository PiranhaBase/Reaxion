const Cache = {
    ELEMENTS: null,
    CATEGORIES: null,
    EXAMPLES: null
}


export async function fetchElements() {
    if (!Cache.ELEMENTS) {
        const elementFile = await fetch(new URL("../../data/elements.json", import.meta.url));
        Cache.ELEMENTS = await elementFile.json();
    }
    return Cache.ELEMENTS;
}


export async function fetchCategories() {
    if (!Cache.CATEGORIES) {
        const categoryFile = await fetch(new URL("../../data/categories.json", import.meta.url));
        Cache.CATEGORIES = await categoryFile.json();
    }
    return Cache.CATEGORIES;
}


export async function fetchExamples() {
    if (!Cache.EXAMPLES) {
        const exampleFile = await fetch(new URL("../../data/examples.json", import.meta.url));
        Cache.EXAMPLES = await exampleFile.json();
    }
    return Cache.EXAMPLES;
}


export async function fetchDocumentation() {
    const docsFile = await fetch(new URL("../../docs/documentation.md", import.meta.url));
    return docsFile.text();
}