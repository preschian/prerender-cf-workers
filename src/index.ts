// source: https://github.com/prerender/prerender-cloudflare-worker
const PRERENDERED_DOMAINS = ["https://kodadot.preschian.xyz"];
const BOT_AGENTS = [
  "googlebot",
  "yahoo! slurp",
  "bingbot",
  "yandex",
  "baiduspider",
  "facebookexternalhit",
  "twitterbot",
  "rogerbot",
  "linkedinbot",
  "embedly",
  "quora link preview",
  "showyoubot",
  "outbrain",
  "pinterest/0.",
  "developers.google.com/+/web/snippet",
  "slackbot",
  "vkshare",
  "w3c_validator",
  "redditbot",
  "applebot",
  "whatsapp",
  "flipboard",
  "tumblr",
  "bitlybot",
  "skypeuripreview",
  "nuzzel",
  "discordbot",
  "google page speed",
  "qwantify",
  "pinterestbot",
  "bitrix link preview",
  "xing-contenttabreceiver",
  "chrome-lighthouse",
  "telegrambot",
];
const IGNORE_EXTENSIONS = [
  ".js",
  ".css",
  ".xml",
  ".less",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".pdf",
  ".doc",
  ".txt",
  ".ico",
  ".rss",
  ".zip",
  ".mp3",
  ".rar",
  ".exe",
  ".wmv",
  ".doc",
  ".avi",
  ".ppt",
  ".mpg",
  ".mpeg",
  ".tif",
  ".wav",
  ".mov",
  ".psd",
  ".ai",
  ".xls",
  ".mp4",
  ".m4a",
  ".swf",
  ".dat",
  ".dmg",
  ".iso",
  ".flv",
  ".m4v",
  ".torrent",
  ".woff",
  ".ttf",
  ".svg",
  ".webmanifest",
];

/**
 * Helper function to check if an array contains an exact match for an element or not.
 */
function isOneOfThem(array: string[], element: string): boolean {
  return array.some((e) => e === element);
}

/**
 * Helper function to check if an array contains an element or not.
 */
function containsOneOfThem(array: string[], element: string): boolean {
  return array.some((e) => element.indexOf(e) !== -1);
}

/**
 * Function to request the prerendered version of a request.
 */
function prerenderRequest(request: Request, key: string): Promise<Response> {
  const { url, headers } = request;
  const prerenderUrl = `https://service.prerender.io/${url}`;
  const headersToSend = new Headers(headers);

  headersToSend.set("X-Prerender-Token", key);

  const prerenderRequest = new Request(prerenderUrl, {
    headers: headersToSend,
    redirect: "manual",
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
      request.headers.get("User-Agent") || ""
    ).toLowerCase();
    const xPrerender = request.headers.get("X-Prerender");
    const pathName = url.pathname.toLowerCase();
    const ext = pathName.substring(
      pathName.lastIndexOf(".") || pathName.length
    );

    if (
      origin === "http://localhost:8787" ||
      origin === "https://prerender-workers.preschian-cdn.workers.dev"
    ) {
      return fetch(`https://nft-gallery-5ci.pages.dev${pathname}${search}`);
    }

    // if bot or google crawler, return prerendered version
    if (
      !xPrerender &&
      containsOneOfThem(BOT_AGENTS, requestUserAgent) &&
      !isOneOfThem(IGNORE_EXTENSIONS, ext) &&
      isOneOfThem(PRERENDERED_DOMAINS, origin)
    ) {
      return await prerenderRequest(request, env.PRERENDER_API_KEY);
    }

    return fetch(request.url);
  },
};
