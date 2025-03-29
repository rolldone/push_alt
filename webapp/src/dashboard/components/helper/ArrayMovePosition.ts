export default function ArrayMovePosition(arr: Array<any>, from: number, to: number) {
  let _origin = Object.assign([], arr);
  try {
    if (to > arr.length - 1) {
      return arr;
    }
    arr.splice(from, 1, arr.splice(to, 1, arr[from])[0])
    return arr;
  } catch (error) {
    console.error("ArrayMovePosition - ex :: ", error);
    return arr = _origin;
  }
}