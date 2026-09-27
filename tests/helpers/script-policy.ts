// Script policy: every <script> is a module that is either inlined by Astro
// or loaded from a local path — never from an external host. In the built
// site, a script with a `src` must live under `<base>_astro/`.

export interface ScriptTag {
  attrs: string;
  src: string | undefined;
}

export function scriptTags(html: string): ScriptTag[] {
  return [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => ({
    attrs: m[1],
    src: /\bsrc="([^"]*)"/.exec(m[1])?.[1],
  }));
}

/** Violations of the policy; empty when compliant. Pass `builtBase` to also require `<base>_astro/`. */
export function scriptPolicyViolations(html: string, builtBase?: string): string[] {
  const problems: string[] = [];
  for (const s of scriptTags(html)) {
    if (!/\btype="module"/.test(s.attrs)) problems.push(`not type="module": <script${s.attrs}>`);
    if (s.src === undefined) continue;
    if (/^(https?:)?\/\//i.test(s.src) || !s.src.startsWith('/')) {
      problems.push(`non-local src: ${s.src}`);
    } else if (builtBase !== undefined && !s.src.startsWith(`${builtBase.replace(/\/?$/, '/')}_astro/`)) {
      problems.push(`src outside ${builtBase}_astro/: ${s.src}`);
    }
  }
  if (/\bsrc="(https?:)?\/\//i.test(html)) problems.push('an element loads from an external host');
  return problems;
}
