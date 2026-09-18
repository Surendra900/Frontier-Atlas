export enum ShardId {
  SHARD_1 = 1,
  SHARD_2,
  SHARD_3,
  SHARD_4,
  SHARD_5,
}

export const CategoryShardMap: Record<string, ShardId> = {
  language_models: ShardId.SHARD_1,
  coding_agents: ShardId.SHARD_2,
  vision_robotics: ShardId.SHARD_3,
  foundation_models: ShardId.SHARD_4,
  general_archive: ShardId.SHARD_5,
};

export const ShardEnvironmentMap: Record<ShardId, string> = {
  [ShardId.SHARD_1]: "SHARD_1_DATABASE_URL",
  [ShardId.SHARD_2]: "SHARD_2_DATABASE_URL",
  [ShardId.SHARD_3]: "SHARD_3_DATABASE_URL",
  [ShardId.SHARD_4]: "SHARD_4_DATABASE_URL",
  [ShardId.SHARD_5]: "SHARD_5_DATABASE_URL",
};