import * as ReactDOM from 'react-dom/client';

export default function (render: any,id:string) {
  const rootElement: any = document.getElementById(id);
  if (rootElement.hasChildNodes()) {
    ReactDOM.hydrateRoot(rootElement, render);
  } else {
    ReactDOM.createRoot(rootElement as HTMLElement).render(
      render
    )
  }
}
