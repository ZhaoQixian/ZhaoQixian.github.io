import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const pageFiles = ['index.html', 'resume.html'];
const errors = [];

function getAttribute(tag, name) {
    const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
    return match ? match[1] : null;
}

function hasId(html, id) {
    return new RegExp(`\\bid\\s*=\\s*["']${id.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}["']`).test(html);
}

for (const pageFile of pageFiles) {
    const pagePath = resolve(root, pageFile);
    const html = readFileSync(pagePath, 'utf8');
    const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) {
        errors.push(`${pageFile}: missing html lang attribute`);
    }
    if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) {
        errors.push(`${pageFile}: missing title`);
    }
    if (!/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["']/i.test(html)) {
        errors.push(`${pageFile}: missing meta description`);
    }
    if (duplicateIds.length > 0) {
        errors.push(`${pageFile}: duplicate ids: ${[...new Set(duplicateIds)].join(', ')}`);
    }

    for (const tagMatch of html.matchAll(/<(a|img|link|script)\b[^>]*>/gi)) {
        const tag = tagMatch[0];
        const tagName = tagMatch[1].toLowerCase();
        const href = getAttribute(tag, 'href');
        const src = getAttribute(tag, 'src');
        const target = href || src;

        if (tagName === 'img' && !getAttribute(tag, 'alt')) {
            errors.push(`${pageFile}: image is missing alt text`);
        }

        if (tagName === 'a' && getAttribute(tag, 'target') === '_blank') {
            const rel = getAttribute(tag, 'rel') || '';
            if (!/\bnoopener\b|\bnoreferrer\b/i.test(rel)) {
                errors.push(`${pageFile}: target=_blank link is missing noopener/noreferrer`);
            }
        }

        if (!target || /^(https?:|mailto:|tel:|javascript:|data:|blob:)/i.test(target)) {
            continue;
        }

        const normalized = target.startsWith('/') ? target.slice(1) : target;
        const [pathPart, fragment] = normalized.split('#');
        const targetPath = pathPart ? resolve(root, pathPart) : pagePath;

        if (!existsSync(targetPath)) {
            errors.push(`${pageFile}: missing local target ${target}`);
            continue;
        }

        if (fragment && targetPath.endsWith('.html')) {
            const targetHtml = readFileSync(targetPath, 'utf8');
            if (!hasId(targetHtml, fragment)) {
                errors.push(`${pageFile}: missing fragment target ${target}`);
            }
        }
    }
}

const css = readFileSync(resolve(root, 'styles.css'), 'utf8');
if (css.split('{').length !== css.split('}').length) {
    errors.push('styles.css: unbalanced braces');
}

if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
}

console.log('Site checks passed.');
