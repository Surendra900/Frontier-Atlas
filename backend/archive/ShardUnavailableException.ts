export class ShardUnavailableException extends Error {
  public readonly shardId: number;

  constructor(shardId: number) {
    super(`Shard ${shardId} is currently unavailable`);

    this.name = "ShardUnavailableException";
    this.shardId = shardId;
  }
}