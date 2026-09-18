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
export const getGithubTrending = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = yesterday.toISOString().split("T")[0];

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=artificial-intelligence+language:Python+stars:>5000&sort=updated&order=desc&per_page=10`,
      {
        headers: {
          "User-Agent": "FrontierAtlas",
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`GitHub API request returned status ${response.status}`);
      return [];
    }
    const data = await response.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((repo: any) => ({
      platform: "github",
      source: repo.owner?.login || "GitHub",
      time: formatDistanceToNow(new Date(repo.updated_at)),
      title: `${repo.name} has recent development activity`,
      description:
        repo.description ??
        "Open-source project currently trending on GitHub.",
      likes: repo.stargazers_count?.toLocaleString() || "0",
      comments: repo.forks_count?.toLocaleString() || "0",
      url: repo.html_url,
    }));
  } catch (err) {
    console.warn("Failed to fetch GitHub trending discussions:", err);
    return [];
  }
};