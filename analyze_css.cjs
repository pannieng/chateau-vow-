const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(process.cwd(), 'src', 'App.tsx');
const appCssPath = path.join(process.cwd(), 'src', 'App.css');

const appTsx = fs.readFileSync(appTsxPath, 'utf8');
const appCss = fs.readFileSync(appCssPath, 'utf8');

// Function to extract class names from a selector string
function extractClasses(selector) {
    // Remove comments within selector (if any)
    selector = selector.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Split by comma to handle selector groups, but we process tokens globally for the block
    // Actually, we want to know which *rule* is unused.
    // A rule might have multiple selectors: .a, .b { ... }
    // If .a is unused but .b is used, we shouldn't comment the whole block?
    // Or we should split them. For simplicity, we'll flag the whole block if *all* selectors are unused,
    // or flag individual selectors if we were rewriting.
    // The user asked to "comment it", usually meaning the whole rule if it's dead code.
    // If `.a, .b` and `.a` is dead but `.b` is alive, we should probably leave it or remove `.a`.
    // Let's assume we check if *any* part of the selector chain is valid.
    
    // Regex to find all .class-name
    const matches = selector.match(/\.[-a-zA-Z0-9_]+/g) || [];
    return matches.map(c => c.substring(1)); // remove dot
}

function extractIds(selector) {
    const matches = selector.match(/#[-a-zA-Z0-9_]+/g) || [];
    return matches.map(i => i.substring(1)); // remove hash
}

// Simple CSS parser
// This is not a full parser, it assumes standard formatting
// We look for "selector {"
const rules = [];
let buffer = '';
let inBlock = false;
let currentSelector = '';
let braceDepth = 0;

// Tokenize roughly by braces
// This is tricky with nested braces (media queries, keyframes).
// We'll use a regex to find blocks.
// But keyframes are different.
// Let's assume standard CSS structure.

// Heuristic: Split by `}` to find end of blocks, then look back for `{`.
// Better: regex for `([^{]+)\{`
// But we need to handle nested blocks (media queries).
// If we just want to find unused *classes*, maybe we can just search for all defined classes in CSS,
// check if they are used, and if not, find their location and comment them.

// Let's try to find all unused classes first.
const definedClasses = new Set();
const definedIds = new Set();

// Remove comments from CSS
const cleanCss = appCss.replace(/\/\*[\s\S]*?\*\//g, '');

// Find all .class and #id definitions
// Matches: .classname followed by space, comma, :, ., #, >, +, ~, or {
// But avoiding things inside { ... } (property values).
// This is hard with regex.
// However, class definitions usually appear at the start of a line or after a } or ,.
// Let's iterate over the file line by line to map selectors? No, multi-line selectors.

// Let's use a simpler approach:
// 1. Get ALL strings that look like classes from CSS.
// 2. Filter out those that appear in property values (e.g. .5em, or content: ".class").
//    Actually, classes in CSS are selectors.
//    Selectors appear before `{`.
//    So we can strip everything between `{` and `}` (handling nesting for media queries is hard).

// Let's try to match selectors.
// 1. Remove content inside `{ ... }` *unless* it's a media query or keyframes?
//    Actually, if we remove everything inside `{ ... }`, we might miss nested rules (if using CSS nesting, but this is standard CSS).
//    Standard CSS doesn't have nested rules except in @media.
//    Inside @media { selector { ... } }
//    So we can strip the innermost `{ ... }` blocks first?

// Alternative:
// Just regex for `\.([a-zA-Z0-9_-]+)` and check context?
// Let's just grab ALL words starting with `.` in App.css, and assume they are classes.
// Then verify if they are used in App.tsx.
// If `.foo` is in CSS, and `foo` is NOT in TSX, then `.foo` is unused.
// We can then search for the *rules* containing `.foo` and comment them.

const cssClasses = new Set();
// Regex to find .class-name
// We exclude obvious numbers like .5
const classMatches = cleanCss.match(/\.[a-zA-Z_][a-zA-Z0-9_-]*/g) || [];
classMatches.forEach(c => cssClasses.add(c.substring(1)));

const cssIds = new Set();
const idMatches = cleanCss.match(/#[a-zA-Z_][a-zA-Z0-9_-]*/g) || [];
idMatches.forEach(i => cssIds.add(i.substring(1)));

console.log(`Found ${cssClasses.size} unique classes in CSS.`);
console.log(`Found ${cssIds.size} unique IDs in CSS.`);

// Check usage in TSX
const unusedClasses = [];
const unusedIds = [];

// Helper to check if a token exists in TSX
function isUsed(token) {
    return appTsx.includes(token);
}

cssClasses.forEach(c => {
    if (!isUsed(c)) {
        unusedClasses.push(c);
    }
});

cssIds.forEach(i => {
    if (!isUsed(i)) {
        unusedIds.push(i);
    }
});

console.log('Unused Classes:', unusedClasses);
console.log('Unused IDs:', unusedIds);

// Filter out dynamic classes
const safeUnusedClasses = unusedClasses.filter(c => {
    // Exclude dialogue-state-*
    if (c.startsWith('dialogue-state-')) return false;
    // Exclude other potentially dynamic classes if suspicious
    return true;
});

// Modify App.css content
let newCss = appCss;

safeUnusedClasses.forEach(cls => {
    // Regex to match a rule starting with .cls
    // Matches: whitespace, .cls, word boundary, any chars until {, block
    // We strictly match rules where .cls is the *first* selector part or the main subject
    // This catches .cls { ... }, .cls:hover { ... }, .cls .child { ... }
    // It avoids .other .cls { ... } (which is safer to leave if .other is used)
    const re = new RegExp('^\\s*\\.' + cls + '\\b[^{]*\\{[\\s\\S]*?\\}', 'gm');
    
    newCss = newCss.replace(re, (match) => {
        // Check if already commented
        if (match.trim().startsWith('/*')) return match;
        return '/* ' + match + ' */';
    });
});

unusedIds.forEach(id => {
     // Exclude hex colors mistaken as IDs (usually 6 chars, hex)
     if (/^[0-9a-fA-F]{6}$/.test(id)) return;

    const re = new RegExp('^\\s*#' + id + '\\b[^{]*\\{[\\s\\S]*?\\}', 'gm');
    newCss = newCss.replace(re, (match) => {
        if (match.trim().startsWith('/*')) return match;
        return '/* ' + match + ' */';
    });
});

fs.writeFileSync(appCssPath, newCss, 'utf8');
console.log('Updated App.css with comments for unused classes.');
