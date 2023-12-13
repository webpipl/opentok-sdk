export interface ConnectionEvent {
  connection: OT.Connection;
  // ... other properties
}
export interface IOpentokStreamType extends OT.Stream {
  me?: true | false;
}

export interface IKeyValueStore {
  [key: string]: any;
}
export interface IOpentokSessionType extends OT.Session {
  data?: IKeyValueStore;
}
