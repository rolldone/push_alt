export default function (urlString: string, array: Array<any>) {
  for (var a = 0; a < array.length; a++) {
    for (var key in array[a]) {
      if (urlString.match(key)) {
        var re = new RegExp(key, "g");
        urlString = urlString.replace(re, array[a][key]);
      }
    }
  }
  return urlString;
}