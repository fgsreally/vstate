export interface vStateInit<T, S extends string> {
  id: string;
  initial: string;
  type?: nodeType;
  states: { [key in S]: nodeState<S> };
  context: T;
}
export type nodeType = "parallel" | "final" | "normal" | "history";
export type nodeState<T extends string> = {
  parent: any;
  history: boolean;
  meta: any;
  always: stateTrigger | stateTrigger[];
  after?: stateTrigger | stateTrigger[];
  on?: onType;
  initial?: string;
  invoke: invokeType;
  activites?: string | string[];
  entry?: string | string[];
  exit?: string | string[];
  type?: nodeType;
  onDone: stateTrigger | stateTrigger[];
  states: { [key in T]: nodeState<T> };
};

export interface vStateContext {
  [key: string]: any;
}
export interface vStateEvent<E> {
  meta?: any;
  name: E;

  data?: any;
}
export interface vStateParams<C, E> {
  actions?: actionType<C, vStateEvent<E>>;
  guards?: guardType<C, vStateEvent<E>>;
  services?: serviceType<C, vStateEvent<E>>;
  activities?: activityType<C, vStateEvent<E>>;
}
export interface activityType<C, E> {
  [key: string]: (ctx: C, event: E) => () => {};
}
export interface actionType<C, E> {
  [key: string]: (ctx: C, event: E) => void;
}
export interface guardType<C, E> {
  [key: string]: (ctx: C, event: E) => Boolean;
}
export interface serviceType<C, E> {
  [key: string]: (ctx: C, event: E) => Promise<any>;
}
export type stateTrigger = {
  target: string;
  actions: string[];
  cond: string[];
};

export type onType = {
  [key: string]: stateTrigger | stateTrigger[];
};
export interface allStateType {
  [key: string]: singleStateType;
}
export interface afterType {
  [key: number]: stateTrigger;
}
export interface singleStateType {
  historyStack?: string[];
  history?: boolean;
  parentNode?: any;
  stack: string[];
  after?: afterType;
  always?: stateTrigger[];
  on?: onType;
  exit?: string[];
  entry?: string[];
  activities?: string[];
  invoke?: invokeType[];
  type?: nodeType;
  status?: null;
  onDone?: stateTrigger | stateTrigger[];
  name?: string;
  meta?: any;
  initial?: string | string[] | null;
}
export interface invokeType {
  onError: Function;
  id: string;
  src: string;
  onDone: Function;
}

export type eventListType<E extends string> = {
  [key in E]?: string[];
};
