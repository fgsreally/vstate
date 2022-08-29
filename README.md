# vState
<a href="https://github.com/fgsreally/vstate/blob/main/README.zh-CN.md">中文</a>,
A finite state machine based on vue, inspired by<a href="https://github.com/statelyai/xstate">xstate</a>,

--For now, it's just a try. Don't use in the production environment

#### goal

- typescript support
- More lightweight
- Restore XState's basic operations as much as possible
- Code generator that can reuse XState (vscode/ Web)
- Tree structure, easy to understand
- responsive

## What is a finite state machine

If I have one of these states, "eating," "sleeping," and "checking my phone," and I have one or only one of these states in the middle of the day, then I can plan for that in the morning. If you can clearly identify each state in a project or component, it will be easier to complete the code and maintain it later.

## state node

In vState, each state is a node on the tree, and there are various relationships between nodes.

There are several relationships:

- Parallel 

- Affiliations

There are the following nodes,

- Normal: independent state

- Parallel:  states can exist at the same time

- end node:the end of a subtree-state

- History node

There are the following state switches

- on: manually controls the status switch

- always:always behavior

- invoke: asynchronous behavior

- after: timer behavior

- initial: init 

State switching works like this: Each switch has one or more steps, each of which is divided into three parts (except initial)
- Target state
- guard
- Event

Only after the guard is passed does the actual switch take place and the event is executed, with the first failure taking the second step (if any) and the success not

Of course, these three parts can also be left blank. For example, there can be no guards or no targets at this time

## context/event

Everything can't be represented as a state, like a number on a counter. You can't set every number to a state.
You can put it in context and change the context by events.

Events can be triggered during these procedures

- All state switches (except Initial)

- enter:  executed when enters the state

- exit:  executed when exit the state

## tree structure

In VState, it goes like this: If I want to go from "looking at my phone while eating" to "falling asleep", I must first go from "looking at my phone while eating" to eating, and then from eating to "going back to my room", and then judge the specific situation. In short, it means that when you have to switch from one subtree to another, you have to go back from one of its subtrees. The steps will be more complex, but also more controlled
(not like xstate)

## start from pinia 

In fact, the state, actions, and getter in Pinia can be easily incorporated into VState. In other words, vState is a finite-state Pinia.

You can convert Pinia to VState with a simple AST substitution


