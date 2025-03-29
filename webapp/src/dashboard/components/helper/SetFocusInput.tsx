import React from "react";

export default function (ref: typeof React.createRef<HTMLInputElement> | HTMLInputElement, e: any) {
  let gg = ref as HTMLInputElement;
  if(gg.type != "text"){
    alert("This is only work for text not other input type");
  }
  gg.type = 'text';
  gg.focus();
  gg.setSelectionRange(e.target.selectionStart, e.target.selectionStart);
}