/**
 * News feed utilities — fetches politics articles from GNews API
 * and Chinese news sources via RSS (proxied through rss2json).
 *
 * Env var required:  REACT_APP_GNEWS_API_KEY
 * Get one free at:   https://gnews.io
 */

const GNEWS_KEY = process.env.REACT_APP_GNEWS_API_KEY || '';
const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

const CHINESE_RSS_FEEDS = [
  { name: 'China Daily – World', url: 'http://www.chinadaily.com.cn/rss/world_rss.xml', source: 'China Daily' },
  { name: 'BBC News – China', url: 'https://feeds.bbci.co.uk/news/world/asia/china/rss.xml', source: 'BBC News' },
  { name: 'China Digital Times', url: 'https://chinadigitaltimes.net/feed', source: 'China Digital Times' },
];

/* ── Helpers ── */

const normalizeGNewsArticle = (item) => ({
  id: item.url,
  slug: encodeURIComponent(item.title?.slice(0, 60) || 'article'),
  title: item.title || 'Untitled',
  excerpt: item.description || '',
  category: 'international',
  source: item.source?.name || 'Unknown',
  date: item.publishedAt?.slice(0, 10) || '',
  imageUrl: item.image || null,
  externalUrl: item.url,
});

const normalizeRSSItem = (item, feedSource) => ({
  id: item.link || item.guid,
  slug: encodeURIComponent((item.title || 'article').slice(0, 60)),
  title: item.title || 'Untitled',
  excerpt: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 250),
  category: 'international',
  source: feedSource,
  date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : '',
  imageUrl: item.enclosure?.link || item.thumbnail || null,
  externalUrl: item.link,
});

/* ── Fetchers ── */

/**
 * Fetch politics articles from GNews API.
 * Returns [] if no API key or on error.
 */
export const fetchGNews = async ({ query = 'politics', lang = 'en', max = 10 } = {}) => {
  if (!GNEWS_KEY) {
    console.warn('[newsFeed] REACT_APP_GNEWS_API_KEY not set — skipping GNews fetch.');
    return [];
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&max=${max}&apikey=${GNEWS_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GNews ${res.status}`);
    const data = await res.json();
    return (data.articles || []).map(normalizeGNewsArticle);
  } catch (err) {
    console.error('[newsFeed] GNews fetch failed:', err);
    return [];
  }
};

/**
 * Fetch a single RSS feed via the rss2json proxy.
 */
const fetchRSSFeed = async (feedUrl, feedSource) => {
  try {
    const url = `${RSS2JSON}?rss_url=${encodeURIComponent(feedUrl)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`RSS proxy ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'RSS parse error');
    return (data.items || []).map((item) => normalizeRSSItem(item, feedSource));
  } catch (err) {
    console.error(`[newsFeed] RSS fetch failed for ${feedSource}:`, err);
    return [];
  }
};

/**
 * Fetch all Chinese RSS feeds in parallel.
 */
export const fetchChineseRSS = async () => {
  const results = await Promise.allSettled(
    CHINESE_RSS_FEEDS.map((feed) => fetchRSSFeed(feed.url, feed.source))
  );
  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
};

/**
 * Fetch all news (GNews + Chinese RSS), merged and sorted by date descending.
 */
export const fetchAllNews = async ({ query = 'politics', lang = 'en', max = 10 } = {}) => {
  const [gnews, chinese] = await Promise.all([
    fetchGNews({ query, lang, max }),
    fetchChineseRSS(),
  ]);

  return [...gnews, ...chinese].sort((a, b) => (b.date > a.date ? 1 : -1));
};
