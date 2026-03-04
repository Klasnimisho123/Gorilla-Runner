export type ObstacleType = "html" | "js" | "angular" | "css"

export interface Obstacle {
  id: number;
  type: ObstacleType
  x: number;
  flying: boolean;
  width: number;
  passed: boolean;
}