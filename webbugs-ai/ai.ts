import _ from 'lodash';
import { Component } from '../webbugs-common/src/models/component';
import { Field } from '../webbugs-common/src/models/field';
import { ClickContract } from '../webbugs-common/src/contract/click_contract';
import { Observable } from 'rxjs';

export abstract class AI implements Iterable<ClickContract> {
  protected field: Field;
  protected components: Record<string, Component>;
  playerID: string;

  constructor(field$: Observable<Field>, components$: Observable<Record<string, Component>>, playerID: string) {
    field$.subscribe(field => { this.field = Field.fromObject(field); });
    components$.subscribe(components => { this.components = components; });
    this.playerID = playerID;
  }

  [Symbol.iterator](): IterableIterator<ClickContract> {
    return this;
  }

  abstract next() : IteratorResult<ClickContract>;
}