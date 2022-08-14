import React, { PointerEventHandler, TransitionEventHandler } from "react";

import styles from "./swipe-card-case.module.css";

interface SwipeCardProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  onPointerDown?: PointerEventHandler;
  onPointerMove?: PointerEventHandler;
  onPointerUp?: PointerEventHandler;
  onTransitionEnd?: TransitionEventHandler;
}
const SwipeCard = React.forwardRef<HTMLDivElement, SwipeCardProps>(
  (
    {
      className,
      children,
      style,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onTransitionEnd,
    },
    RootRef
  ) => {
    return (
      <div
        ref={RootRef}
        style={{ ...style }}
        className={`${className} ${styles.CardContents}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onTransitionEnd={onTransitionEnd}
      >
        {children}
      </div>
    );
  }
);

export { SwipeCard };
