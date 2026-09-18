export interface ShardDatabaseUrls {
  SHARD_1_DATABASE_URL: string;
  SHARD_2_DATABASE_URL: string;
  SHARD_3_DATABASE_URL: string;
  SHARD_4_DATABASE_URL: string;
  SHARD_5_DATABASE_URL: string;
}

export function validateShardUrls(urls: Partial<ShardDatabaseUrls>): asserts urls is ShardDatabaseUrls {
  const required = [
    "SHARD_1_DATABASE_URL",
    "SHARD_2_DATABASE_URL",
    "SHARD_3_DATABASE_URL",
    "SHARD_4_DATABASE_URL",
    "SHARD_5_DATABASE_URL",
  ] as const;

  for (const key of required) {
    if (!urls[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}