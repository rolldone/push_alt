import { toNumber } from "lodash";

export default function (input: any, fixed = 0) {
  
  let result = parseFloat(toNumber(input).toFixed(fixed));
  return result;
}