import { Cell } from "./cell";

export interface Component {
  id: string;
  isActive: boolean;
  walls: Cell[]
}