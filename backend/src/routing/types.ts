import { PrismaClient } from "../generated/prisma/client.js";

export enum QueryType {
  READ = "READ",
  WRITE = "WRITE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  TRANSACTION = "TRANSACTION",
}

export interface QueryIntent {
  type: QueryType;
  entity: string;
  operation: string;
  category?: string;
  filters?: Record<string, unknown>;
  data?: Record<string, unknown>;
  shardHint?: number;
}

export enum RoutingStrategy {
  SHARD_KEY = "SHARD_KEY",
  GEOLOCATION = "GEOLOCATION",
  LOAD_BALANCED = "LOAD_BALANCED",
  PRIMARY_ONLY = "PRIMARY_ONLY",
  READ_REPLICA = "READ_REPLICA",
}

export type TargetShard = {
  id: number;
  type: "primary" | "replica";
  connectionString?: string;
};

export interface QueryPlan {
  intent: QueryIntent;
  strategy: RoutingStrategy;
  targetShards: TargetShard[];
  fallbackShards?: TargetShard[];
}

export interface RoutingResult<T> {
  plan: QueryPlan;
  success: boolean;
  message?: string;
  results: T[];
  failedShards: number[];
}