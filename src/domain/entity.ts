import { v4 as uuidv4 } from "uuid";

// TODO: add domain events
// import { EventEmitter } from 'events'; // NodeJS built-in library

// Decision: use of abstract class instead of interface because:
//   1. we want to define method implementation and attributes common to all sub-classes.
//   2. we should never instantiate the base class

export abstract class Entity {
  protected readonly id: string; // protected access, so that sub-class instances can access it.

  constructor(id?: string) {
    this.id = id ? id : uuidv4;
  }
}
