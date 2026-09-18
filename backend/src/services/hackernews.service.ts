function formatDistanceToNow(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (seconds < 60) return rtf.format(-seconds, "second");
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), "day");
  if (seconds < 31536000) return rtf.format(-Math.floor(seconds / 2592000), "month");
  return rtf.format(-Math.floor(seconds / 31536000), "year");
}

const BASE_URL = "https://hacker-news.firebaseio.com/v0";

export const getHackerNewsTrending = async () => {
  try {
    const idsResponse = await fetch(`${BASE_URL}/topstories.json`);

    if (!idsResponse.ok) {
      console.warn(`Hacker News topstories returned ${idsResponse.status}`);
      return [];
    }

    const ids: number[] = await idsResponse.json();
    const topIds = ids.slice(0, 10);

    const stories = await Promise.all(
      topIds.map(async (id) => {
        try {
          const res = await fetch(`${BASE_URL}/item/${id}.json`);
          if (!res.ok) return null;
          return res.json();
        } catch {
          return null;
        }
      })
    );

    return stories
      .filter((story: any) => story && story.title)
      .map((story: any) => ({
        platform: "hackernews",
        source: "Hacker News",
        time: formatDistanceToNow(new Date(story.time * 1000)),
        title: story.title,
        description:
          `Trending Hacker News discussion with ${
            story.score ?? 0
          } upvotes and ${
            story.descendants ?? 0
          } comments from the developer community.`,
        likes: story.score?.toString() ?? "0",
        comments: story.descendants?.toString() ?? "0",
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      }));
  } catch (err) {
    console.warn("Failed to fetch Hacker News discussions:", err);
    return [];
  }
};