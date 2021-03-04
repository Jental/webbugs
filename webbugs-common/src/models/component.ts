import { Cell } from "./cell";
import { FullCoordinates } from "./coordinates";

export interface Component {
  id: string;
  isActive: boolean;
  walls: Cell[]
  wall_ids?: FullCoordinates[]
}