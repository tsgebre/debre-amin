export const DEFAULT_SITE = 'https://example.github.io';
export const DEFAULT_BASE = '/';

export interface DeployEnv {
  SITE_URL?: string;
  BASE_PATH?: string;
}

// `||` not `??`: actions/configure-pages reports base_path as '' for
// user/org sites and custom domains, which must fall back to '/'.
export function resolveDeployEnv(env: DeployEnv): { site: string; base: string } {
  return {
    site: env.SITE_URL || DEFAULT_SITE,
    base: env.BASE_PATH || DEFAULT_BASE,
  };
}
