import React, { useRef } from "react";
const useElementStack = <Element>() => {
  const stackElRef = useRef<Element[]>([]);

  const register = (refName: number) => (element: Element) => {
    stackElRef.current[refName] = element;
  };
  return [stackElRef, register] as const;
};

export { useElementStack };
