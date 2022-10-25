// source: https://github.com/prerender/prerender-cloudflare-worker
import { PRERENDERED_DOMAINS, BOT_AGENTS, IGNORE_EXTENSIONS } from './constant';
import { isOneOfThem, containsOneOfThem } from './helper';

/**
 * Function to request the prerendered version of a request.
 */
function prerenderRequest(request: Request, key: string): Promise<Response> {
  const { url, headers } = request;
  const prerenderUrl = `https://service.prerender.io/${url}`;
  const headersToSend = new Headers(headers);

  headersToSend.set('X-Prerender-Token', key);

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: 'manual',
  });

  return fetch(prerenderRequest);
}

function netlifyRequest(request: Request, path: string): Promise<Response> {
  const { headers } = request;
  const prerenderUrl = `https://beta.kodadot.xyz/${path}`;
  const headersToSend = new Headers(headers);

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
  });

  return fetch(prerenderRequest);
}

export interface Env {
  PRERENDER_API_KEY: string;
}

/**
 * This attaches the event listener that gets invoked when CloudFlare receives
 * a request.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { origin, pathname, search } = url;
    const requestUserAgent = (
      request.headers.get('User-Agent') || ''
    ).toLowerCase();
    const xPrerender = request.headers.get('X-Prerender');
    const pathName = url.pathname.toLowerCase();
    const ext = pathName.substring(
      pathName.lastIndexOf('.') || pathName.length
    );

    if (
      containsOneOfThem(BOT_AGENTS, requestUserAgent) &&
      !isOneOfThem(IGNORE_EXTENSIONS, ext) &&
      isOneOfThem(PRERENDERED_DOMAINS, origin)
    ) {
      return await netlifyRequest(request, `${pathname}${search}`);
    }

    // if (
    //   origin === "http://localhost:8787" ||
    //   origin === "https://prerender-workers.preschian-cdn.workers.dev"
    // ) {
    //   return fetch(`https://nft-gallery-5ci.pages.dev${pathname}${search}`);
    // }

    // // if bot or google crawler, return prerendered version
    // if (
    //   !xPrerender &&
    //   containsOneOfThem(BOT_AGENTS, requestUserAgent) &&
    //   !isOneOfThem(IGNORE_EXTENSIONS, ext) &&
    //   isOneOfThem(PRERENDERED_DOMAINS, origin)
    // ) {
    //   return await prerenderRequest(request, env.PRERENDER_API_KEY);
    // }

    return fetch(request.url);
  },
};
