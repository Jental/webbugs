import { Component } from '../models/component';
import { Field } from '../models/field';

export interface DataContract {
  field? : Field,
  components?: Record<string, Component>
}