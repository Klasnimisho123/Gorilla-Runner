export type ObstacleType = "html" | "js" | "angular" | "css"

export interface Obstacle {
  id: number;
  type: ObstacleType
  x: number;
  width: number;
  passed: boolean;
}