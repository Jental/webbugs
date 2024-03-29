import { SecureWallsAI } from "./ais/secure_walls"
import { Observable } from "rxjs"
import { Component } from "../webbugs-common/src/models/component"

import { Field } from "../webbugs-common/src/models/field"
import { AI } from "./ai"
import { EatAI } from "./ais/eat"
import { EatNcAI } from "./ais/eat_nc"
import { RandomAI } from "./ais/random"
import { NearAggAI } from "./ais/near_agg"

export enum AIType {
  RandomAI = 'random',
  EatAI = 'eat',
  EatNcAI = 'eatnc',
  SecureWallsAI = 'swalls',
  NearAggAI = 'nearagg'
}

export const createAI = (type: AIType, field$: Observable<Field>, components$: Observable<Record<string, Component>>, playerID: string) : AI => {
  switch (type) {
    case AIType.RandomAI:
      return new RandomAI(field$, components$, playerID);
    case AIType.EatAI:
      return new EatAI(field$, components$, playerID);
    case AIType.EatNcAI:
      return new EatNcAI(field$, components$, playerID);
    case AIType.SecureWallsAI:
      return new SecureWallsAI(field$, components$, playerID);
    case AIType.NearAggAI:
      return new NearAggAI(field$, components$, playerID);
    default:
      return null;
  }
}

export const createAIByID = (type: string, field$: Observable<Field>, components$: Observable<Record<string, Component>>, playerID: string) : AI => {
  switch (type) {
    case AIType.RandomAI:
      return new RandomAI(field$, components$, playerID);
    case AIType.EatAI:
      return new EatAI(field$, components$, playerID);
    case AIType.EatNcAI:
      return new EatNcAI(field$, components$, playerID);
    case AIType.SecureWallsAI:
      return new SecureWallsAI(field$, components$, playerID);
    case AIType.NearAggAI:
      return new NearAggAI(field$, components$, playerID);
    default:
      return null;
  }
}