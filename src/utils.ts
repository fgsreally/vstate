import { stateTrigger } from "./types";
import colors from "colors";


export function onFormat(obj: any) {
  let ret: any = {};
  for (let i in obj) {
    ret[i] = arrayFormat(obj[i]);
  }
  return ret;
}

export function sigleton(entity: any) {
  if (entity) return false;
  return true;
}

export function arrayFormat(
  obj: any | string | object,
  needToBeVstep = true
): stateTrigger[] | any {
  if (obj) {
    if (!Array.isArray(obj)) {
      if (typeof obj === "string" && needToBeVstep) {
        console.log("array", { target: obj });
        return [{ target: obj }];
      }
      return [obj];
    } else {
      return obj.map((i) => {
        if (typeof i === "string" && needToBeVstep) {
          return { target: i };
        }
        return i;
      });
    }
  } else {
    return null;
  }
}
