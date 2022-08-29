import {
  vStateInit,
  vStateParams,
  actionType,
  guardType,
  serviceType,
  activityType,
  allStateType,
  eventListType,
  vStateEvent,
  vStateContext,
  nodeState,
  singleStateType,
  stateTrigger,
} from "./types";
import colors from "colors";
import { sigleton, onFormat, arrayFormat } from "./utils";
export class vState<C, E extends string, S extends string> {
  actions: actionType<C, vStateEvent<E>> | undefined;
  guards: guardType<C, vStateEvent<E>> | undefined;
  services: serviceType<C, vStateEvent<E>> | undefined;
  activities: activityType<C, vStateEvent<E>> | undefined;
  id: string;
  allState: allStateType;
  cacheStack: string[];
  stateStatus: Map<string, boolean>;
  cacheActivties: { [key: string]: any };
  cacheTimer: { [key: string]: any };
  eventList: eventListType<E>;
  ctx: C;

  constructor(state: vStateInit<C, S>, options: vStateParams<C, E> = {}) {
    this.actions = options.actions;
    this.guards = options.guards;
    this.activities = options.activities;
    this.id = state.id || "";
    // this.actions=options.actions
    this.services = options.services;
    this.allState = {};
    this.cacheStack = [];
    this.stateStatus = new Map();
    this.eventList = {};

    this.cacheActivties = {};
    this.ctx = state.context;
    this.cacheTimer = {};

    this.getState(state as any);

    this.init();
  }
  get currentState() {
    let curArr = [];
    for (let i of this.stateStatus) {
      if (i[1]) curArr.push(i[0]);
    }
    return curArr;
  }

  getState(
    state: nodeState<S>,
    cur = "#",
    parentNode: singleStateType | any = null
  ) {
    this.stateStatus.set(cur, false);
    let curStateNode: any = (this.allState[cur] = {
      stack: parentNode ? [cur, ...parentNode.stack] : [cur],
      after: onFormat(state.after),
      always: arrayFormat(state.always),
      on: onFormat(state.on),
      exit: arrayFormat(state.exit, false),
      entry: arrayFormat(state.entry, false),
      activities: arrayFormat(state.activites, false),
      invoke: arrayFormat(state.invoke, false),
      type: state.type,
      status: null,
      onDone: arrayFormat(state.onDone),
      name: cur,
      meta: state.meta || null,
      initial:
        state.type === "parallel" ? Object.keys(state.states) : state.initial,
    });

    if (state.on) {
      for (let i in state.on) {
        !this.eventList[i as E] && (this.eventList[i as E] = []);
        (this.eventList[i as E] as any).push(cur); //出发点
      }
    }
    if (!state.states) {
      // curStateNode.isLeaf = true;
      if (state.type === "history") {
        if (!parentNode.history) {
          parentNode.history = true;
          parentNode.historyStack = [];
        }

        curStateNode.parentNode = parentNode;
        // console.log(colors.blue(parentNode));
      }
      if (state.type === "final") {
        state.parent = parentNode;
      }
    } else {
      for (let i in state.states) {
        this.getState(state.states[i], cur + "." + i, curStateNode);
      }
    }
  }
  traverse(cur: any[], event: vStateEvent<E> | any = { name: "INITIAL" }) {
    // if (this.allState[targetStateName].initial) {
    //  let targetStateName = i.replace(/\-(\w*)$/, "-" + j.target);
    //   this.beforeLeave(oldState, event, targetStateName);

    //   this.beforeEnter(this.allState[targetStateName], event, targetStateName);
    // } else {
    //   return targetStateName;
    // }
    let dataSet = [];
    do {
      let item = cur.shift();

      //   this.beforeLeave(this.allState, event, item);
      if (this.allState[item].initial) {
        if (Array.isArray(this.allState[item].initial)) {
          cur.push(
            ...(this.allState[item].initial as any[]).map((i) => {
              let key = item + "." + i;

              this.beforeEnter(this.allState[key], event, key, item);
              return key;
            })
          );
        } else {
          let key = item + "." + this.allState[item].initial;

          this.beforeEnter(this.allState[key], event, key, item);
          cur.push(key);
        }
      } else {
        dataSet.push(item);
      }
    } while (cur.length > 0);

    return dataSet;
  }
  init() {
    this.traverse([`#`]);
  }
  update() {
    console.log("update");
  }
  emitCond(trigger: stateTrigger, event: vStateEvent<E>, name: string) {
    //   if(this.allState[i].on[key].cond?.());
    //   this.allState[test]?.exit();
    //   activities[test].forEach((i) => i());
    if (trigger.cond) {
      console.log(`exec cond in ${name} -to ${trigger.target}`);

      if (Array.isArray(trigger.cond)) {
        for (let i of trigger.cond) {
          if (this.guards?.[i]?.(this.ctx, event)) {
            console.log(`pass success -to ${trigger.target}`);
            return true;
          }
          console.log(`pass fail  -to ${trigger.target}`);
        }
        return false;
      } else {
        if (this.guards?.[trigger.cond](this.ctx, event)) {
          console.log(`pass success  -to ${trigger.target}`);
          return true;
        } else {
          console.log(`pass fail  -to ${trigger.target}`);
          return false;
        }
      }
    }

    return true;
  }

  emitExit(oldState: singleStateType, event: vStateEvent<E>, name: string) {
    if (!oldState.exit) {
      return false;
    }
    console.log(`exec exit in ${name}`);
    for (let i of oldState.exit) {
      this.actions?.[i](this.ctx, event);
    }
  }
  emitEntry(state: singleStateType, event: vStateEvent<E>, name: string) {
    if (!state.entry) {
      return false;
    }
    console.log(`exec entry in ${name}`);
    for (let i of state.entry) {
      this.actions?.[i](this.ctx, event);
    }
  }
  startActivities(state: singleStateType, event: vStateEvent<E>, name: string) {
    if (!state.activities) {
      return false;
    }
    console.log(`start activity in ${name}`);
    this.cacheActivties[name] = state.activities.map((i) =>
      this.activities?.[i](this.ctx, event)
    );
  }
  endActivities(event: vStateEvent<E>, name: string) {
    if (this.cacheActivties[name]) {
      console.log(`end activity from ${name} `);

      this.cacheActivties[name].forEach((i: any) => {
        if (i instanceof Function) {
          i(this.ctx, event);
        }
      });
    }
  }
  clearTimer(name: string) {
    if (!this.cacheTimer[name]) {
      return false;
    }
    console.log(`clear ${name} timer`);

    this.cacheTimer[name].forEach((i: number) => {
      clearTimeout(i);
    });
    this.cacheTimer[name] = undefined;
  }

  emitAfter(state: singleStateType, event: vStateEvent<E>, name: string) {
    if (!state.after) {
      return false;
    }

    this.cacheTimer[name] = [];
    console.log("after", state.after);
    for (let i in state.after) {
      this.cacheTimer[name].push(
        setTimeout(() => {
          for (let j of (state as any).after[i]) {
            let ret = false;
            console.log(`exec after in ${name}(delay:${i}) `);

            ret = this.trigger(event, j, this.allState[name], name, "after");
            if (ret) {
              break;
            }
          }
        }, Number(i))
      );
    }
  }
  emitAlways(state: singleStateType, event: vStateEvent<E>, name: string) {
    if (!state.always) {
      return false;
    }

    console.log(`exec always in ${name} `);
    // let ret = false;
    for (let i of state.always) {
      if (this.emitCond(i, event, name)) {
        this.beforeLeave(state, event, name);
        this.trigger(event, i, this.allState[name], name, "always");
        break;
      }
    }
  }
  emitInvoke(state: singleStateType, event: vStateEvent<E>, name: string) {
    if (!state.invoke) {
      return false;
    }
    let isFinish = false;
    for (let i of state.invoke) {
      console.log(`${name} invoke ${i.id}`);

      this.services?.[i.src](this.ctx, event)
        .then((res) => {
          if (!sigleton(isFinish)) return;
          this.update();
          isFinish = true;
          console.log(`invoke id:${i.id} from ${name} success`);
          event.data = res;
          if (!i.onDone) throw new Error(`invoke miss onDone Callback`);

          for (let j of arrayFormat(i.onDone)) {
            let ret = this.trigger(
              event,
              j,
              this.allState[name],
              name,
              "invoke"
            );
            if (ret) {
              //   this.update();
              break;
            }
          }
        })
        .catch((e) => {
          if (!sigleton(isFinish)) return;
          isFinish = true;
          this.update();
          console.log(`invoke id:${i.id} from ${name} fail`);

          event.data = e;
          if (!i.onError) throw new Error(`invoke miss onError Callback`);
          for (let j of arrayFormat(i.onError)) {
            let ret = this.trigger(
              event,
              j,
              this.allState[name],
              name,
              "invoke"
            );
            if (ret) {
              //   this.update();
              break;
            }
          }
        });
    }
  }
  emitHistory(targetName: string) {
    if (this.allState[targetName].type === "history") {
      let parentNode = this.allState[targetName].parentNode;
      for (let i of this.stateStatus) {
        if (i[1] && i[0].startsWith(parentNode.name)) {
          this.stateStatus.set(i[0], false);
        }
      }
      parentNode.historyStack.map((i: string) => {
        this.stateStatus.set(i, true);
      });
      return true;
    }
  }
  beforeLeave(oldState: singleStateType, event: vStateEvent<E>, name: string) {
    console.log(`beforeleave ${name}`);
    this.stateStatus.set(name, false);
    this.emitExit(oldState, event, name);
    this.endActivities(event, name);
    this.clearTimer(name);
  }

  beforeEnter(
    state: singleStateType,
    event: vStateEvent<E>,
    targetStateName: string,
    oldStateName: string
  ) {
    if (this.emitHistory(targetStateName)) {
      return false;
    }
    console.log(`beforeEnter ${targetStateName}`);
    this.stateStatus.set(oldStateName, false);
    this.stateStatus.set(targetStateName, true);
    this.startActivities(state, event, targetStateName);
    this.emitEntry(state, event, targetStateName);
    if (
      state.type === "final" &&
      this.emitOnDone(state, event, targetStateName)
    ) {
      return false;
    }
    this.emitAfter(state, event, targetStateName);
    this.emitAlways(state, event, targetStateName);
    // this.emitAlways(state, event, targetStateName);
    this.emitInvoke(state, event, targetStateName);
    return true;
  }
  emitOnDone(state: singleStateType, event: vStateEvent<E>, name: string) {
    if (!this.allState[state.stack[1]].onDone) {
      console.warn(`${name}'s parent didn't have an onDone callback`);
    }
    this.beforeLeave(state, event, name);
    let ret = false;
    for (let i of arrayFormat(this.allState[state.stack[1]].onDone)) {
      ret = this.emitCond(i, event, name);
      if (ret) {
        this.trigger(
          event,
          i,
          this.allState[state.stack[1]],
          state.stack[1],
          "onDone"
        );
        break;
      }
    }
    return ret;
  }
  emitActions(
    actions: string[] | null,
    event: vStateEvent<E>,
    state: singleStateType,
    name: string,
    from: "event" | "invoke" | "always" | "onDone" | "after"
  ) {
    if (!actions) return false;
    console.log(`exec actions from ${name}`);

    for (let i of arrayFormat(actions, false)) {
      this.actions?.[i](this.ctx, event);
    }
    if (from === "event") this.emitAlways(state, event, name);
  }

  trigger(
    event: vStateEvent<E>,
    vStep: stateTrigger,
    oldState: singleStateType,
    name: string,
    from: "event" | "invoke" | "always" | "onDone" | "after"
  ) {
    this.filter(name, event);
    this.emitActions(vStep.actions, event, oldState, name, from);
    event.meta = oldState.meta;
    if (vStep.target) {
      let targetStateName = name.replace(/\.[^\.]*?$/, "." + vStep.target);
      // from === "event" &&
      if (
        this.beforeEnter(
          this.allState[targetStateName],
          event,
          targetStateName,
          name
        )
      )
        this.traverse([targetStateName], event);

      return true;
    }
    return false;
  }
  filter(triggerState: string, event: vStateEvent<E>) {
    let leaveStack: string[] = [];
    let eventStack: any = {};
    let updateStates = this.currentState.filter((i) => {
      if (i.startsWith(triggerState)) {
        eventStack[i] = triggerState; //每个现在需要更新的状态节点，对应需要更改的父节点
        return true;
      }
    });
    updateStates.forEach((i) => {
      for (let j of this.allState[i].stack) {
        if (!leaveStack.includes(j)) {
          leaveStack.push(j);

          if (this.allState[j].history && i.startsWith(j)) {
            this.allState[j]?.historyStack?.push(i);
          }
          this.beforeLeave(this.allState[j], event, j);
        }

        if (j === eventStack[i]) {
          break;
        }
      }
    });
  }
  transition(name: E) {
    console.log(`transition`, name);
    let event = { name: name };
    if (!this.eventList[name]) return;
    //发生改变的状态集
    for (let i of this.eventList[name] as string[]) {
      // 每个作用点
      let eventsSet = (this.allState[i] as any).on[name];
      //作用方式选择
      let ret = false;
      let vStep;
      if (Array.isArray(eventsSet)) {
        for (let j of eventsSet) {
          vStep = j;
          ret = this.emitCond(vStep, event, i);

          if (ret) {
            break;
          }
        }
      } else {
        ret = this.emitCond(eventsSet, event, i);
        vStep = eventsSet;
      }
      if (ret) {
        console.log("vstep", vStep);
        this.trigger(event, vStep, this.allState[i], i, "event");
      }
    }

    return;
  }
}

export function createMachine<
  TContext,
  TEvent extends string,
  TState extends string
>(
  state: vStateInit<TContext, TState>,
  options: vStateParams<TContext, TEvent>
): vState<TContext, TEvent, TState> {
  return new vState(state, options);
}
