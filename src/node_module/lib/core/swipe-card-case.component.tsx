import React, { useRef } from "react";
import { useCallback } from "react";

// styles
import styles from "./swipe-card-case.module.css";

// components
import { SwipeCard } from "./swipe-card.component";

// hooks
import { useConditionEffect, useElementStack } from "../hooks";
// utils
import { domController, utility, DirectionObj } from "../utils";

interface CardInformRef {
  direction: DirectionObj<boolean>;
}

interface OnCardPropsData {
  swipeCardId: string | number;
  direction: DirectionObj<boolean>;
}
interface SwipeCardCaseInitialSettings {
  cardCaseWidth?: string | number;
  cardCaseHeight?: string | number;
  cardWidth?: string | number;
  cardHeight?: string | number;
  cardPositionX?: number /** 0 ~ 100 */;
  cardPositionY?: number /** 0 ~ 100 */;
  swipeProgress?: number /** 0 ~ 100 */;
  cardMaxRotate?: number;
  unstable_cardCaseOverflow?: "hidden" /*| "visible" | "auto"*/;
  cardEscapeGutter?: number;
  cardTransition?: {
    duration?: number /** seconds */;
    timing?: string /** timing function */;
    delay?: number /** seconds */;
  };
  unstable_onCardSwipeStart?: () => void;
  unstable_onCardSwipeMove?: () => void;
  onCardSwipeEnd?: (data: OnCardPropsData) => void;
}
interface SwipeCardCaseProps {
  children: React.ReactNode;
  initialSettings: SwipeCardCaseInitialSettings;
}

const SwipeCardCase = React.forwardRef<HTMLDivElement, SwipeCardCaseProps>(
  function (props, ref) {
    // props
    const { children, initialSettings } = props ?? {};

    // init-values
    const {
      cardCaseWidth = "100%",
      cardCaseHeight = "100%",
      cardWidth = "auto",
      cardHeight = "auto",
      cardPositionX = 50,
      cardPositionY = 50,
      swipeProgress = 33,
      cardMaxRotate = 45,
      unstable_cardCaseOverflow = "hidden",
      cardEscapeGutter = 0,
      cardTransition: {
        duration: cardTransitionDuration = 0.25,
        timing: cardTransitionTiming = "linear",
        delay: cardTransitionDelay = 0,
      } = {},
      unstable_onCardSwipeStart,
      onCardSwipeEnd,
      unstable_onCardSwipeMove,
    } = initialSettings ?? {};

    // dom-ref
    const [stackCardsRef, setStackCardsRef] = useElementStack<HTMLDivElement>();
    const cardCaseElRef = useRef<HTMLDivElement | null>(null);
    const cardContainerElRef = useRef<HTMLDivElement | null>(null);
    const targetCardElRef = useRef<HTMLElement | null>(null);

    // is-values
    const isSwipeCardCaseRenderRef = useRef<boolean>(false);
    const isTransitionRef = useRef<boolean>(false);

    const isCardDownRef = useRef<boolean>(false);
    const isCardCaseDownRef = useRef<boolean>(false);
    const isWindowDownRef = useRef<boolean>(false);

    // card-inform-ref / to provide client
    const cardInformRef = useRef<CardInformRef>({
      direction: utility.directionObj(false),
    });

    // values-ref / to save
    const cardRectRef = useRef({
      down: {
        remain: utility.directionObj<number>(0),
        transform: utility.matrixObj(),
      },
      move: {
        remain: utility.directionObj<number>(0),
        transform: utility.matrixObj(),
      },
      up: {
        remain: utility.directionObj<number>(0),
        transform: utility.matrixObj(),
      },
    });

    // point px - ref
    const cardPointRef = useRef({
      down: utility.pointXY(),
      move: utility.pointXY(),
      up: utility.pointXY(),
      moveTemp: utility.pointXY(),
    });
    const windowPointRef = useRef({
      down: utility.pointXY(),
      move: utility.pointXY(),
      up: utility.pointXY(),
      moveTemp: utility.pointXY(),
    });

    // point percent - ref
    const cardPointPercentRef = useRef({
      down: utility.pointXY(),
      move: utility.pointXY(),
      up: utility.pointXY(),
    });
    const windowPointPercentRef = useRef({
      down: utility.pointXY(),
      move: utility.pointXY(),
      up: utility.pointXY(),
    });

    /**
     * Effects
     */

    useConditionEffect(
      () => {
        initSwipeCardCase();
        isSwipeCardCaseRenderRef.current = true;
        return () => {
          isSwipeCardCaseRenderRef.current = false;
          unLoadSwipeCardCase();
        };
      },
      [],
      {
        componentDidUpdateCondition: false,
      }
    );

    /**
     * initial
     */
    const initSwipeCardCase = () => {
      initAddEvents();
      initCardSettings();
    };
    const unLoadSwipeCardCase = () => {
      unLoadRemoveEvents();
    };

    // initial
    const initAddEvents = useCallback(() => {
      window.addEventListener("pointerdown", onWindowDown);
      window.addEventListener("pointermove", onWindowMove);
      window.addEventListener("pointerup", onWindowUp);
      window.addEventListener("resize", onWindowResize);

      stackCardMapper(stackCardsRef.current, (cardItem) => {
        cardItem.addEventListener("transitionstart", onCardTransitionStart);
      });
    }, []);

    const initCardSettings = () => {
      cardSizeSettings();
    };

    // unload
    const unLoadRemoveEvents = useCallback(() => {
      window.removeEventListener("pointerdown", onWindowDown);
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("resize", onWindowResize);

      stackCardMapper(stackCardsRef.current, (cardItem) => {
        cardItem.removeEventListener("transitionstart", onCardTransitionStart);
      });
    }, []);

    /**
     * methods
     */
    const isHardBlockEvent = () => {
      if (!isSwipeCardCaseRenderRef.current) return true;
      if (isTransitionRef.current) return true;
      return false;
    };
    const stackCardMapper = (
      cards: HTMLDivElement[],
      callback: (el: HTMLElement) => void
    ) => {
      if (!cards || cards?.length < 0) return;
      cards.map((cardItem) => {
        callback(cardItem);
      });
    };
    const cardSizeSettings = () => {
      if (cardWidth === "auto" && cardHeight === "auto") {
        let cardMaxWidth = 0;
        let cardMaxHeight = 0;
        stackCardMapper(stackCardsRef.current, (cardItem: HTMLElement) => {
          if (cardItem.children && cardItem.children.length > 1) {
            // not allowed
            alert("not allowed");
            throw new Error("not allowed");
          }
          const { width, height } =
            cardItem.children[0].getBoundingClientRect();
          cardItem.style.width = `${width}px`;
          cardItem.style.height = `${height}px`;
          cardMaxWidth = cardMaxWidth > width ? cardMaxWidth : width;
          cardMaxHeight = cardMaxHeight > height ? cardMaxHeight : height;
        });
        if (cardContainerElRef.current) {
          cardContainerElRef.current.style.width = `${cardMaxWidth}px`;
          cardContainerElRef.current.style.height = `${cardMaxHeight}px`;
        }
      }
    };

    /**
     * Handler
     */

    // card
    const onCardDown = useCallback((event: React.PointerEvent) => {
      if (isHardBlockEvent()) return;
      if (!cardCaseElRef.current) return;

      isCardDownRef.current = true;

      // get-values
      const targetElement = event.currentTarget as HTMLElement;
      const { offsetX, offsetY } = event.nativeEvent;

      // calc-values
      const calcPercentY = utility.calcPercent(
        offsetY,
        targetElement.offsetHeight
      );

      // save-values
      targetCardElRef.current = targetElement;

      cardPointRef.current.down.x = offsetX;
      cardPointRef.current.down.y = offsetY;
      cardPointPercentRef.current.down.y = calcPercentY;
    }, []);
    const onCardMove = useCallback(() => {
      if (isHardBlockEvent()) return;
      if (!isCardDownRef.current) return;
    }, []);
    const onCardUp = useCallback(() => {
      if (isHardBlockEvent()) return;

      isCardDownRef.current = false;
    }, []);

    // card-case
    const onCardCaseDown = useCallback(() => {
      if (isHardBlockEvent()) return;
      isCardCaseDownRef.current = true;
    }, []);
    const onCardCaseMove = useCallback(() => {
      if (isHardBlockEvent()) return;
      if (!isCardCaseDownRef.current) return;
    }, []);
    const onCardCaseUp = useCallback(() => {}, []);

    // window
    const onWindowDown = useCallback((event: PointerEvent) => {
      if (isHardBlockEvent()) return;
      if (!isCardCaseDownRef.current) return;
      if (!targetCardElRef.current) return;
      if (!cardCaseElRef.current) return;

      isWindowDownRef.current = true;

      const { clientX, clientY } = event;

      // calc-values
      const matrix = domController.getTransformMatrix(targetCardElRef.current);

      const { left: remainLeft, right: remainRight } = utility.calcRemainRect(
        targetCardElRef.current,
        cardCaseElRef.current
      );

      // save-values
      windowPointRef.current.down = utility.pointXY(clientX, clientY);
      cardRectRef.current.down.transform = matrix;

      cardRectRef.current.down.remain.left = remainLeft;
      cardRectRef.current.down.remain.right = remainRight;

      // dom-controll
      domController.transition(targetCardElRef.current);
    }, []);

    const onWindowMove = useCallback((event: PointerEvent) => {
      if (isHardBlockEvent()) return;
      if (!isCardCaseDownRef.current) return;
      if (!isWindowDownRef.current) return;
      if (!cardCaseElRef.current) return;
      if (!targetCardElRef.current) return;

      // get-values
      const { clientX, clientY } = event;
      const { offsetWidth: caseWidth, offsetHeight: caseHeight } =
        cardCaseElRef.current;
      const { offsetWidth: cardWidth, offsetHeight: cardHeight } =
        targetCardElRef.current;

      // calc-values
      const calcTranslateX =
        clientX -
        windowPointRef.current.down.x +
        cardRectRef.current.down.transform.translateX;

      const calcTranslatePercentX = utility.calcPercent(
        clientX - windowPointRef.current.down.x,
        cardCaseElRef.current.offsetWidth
      );
      const { left: remainLeft, right: remainRight } = utility.calcRemainRect(
        targetCardElRef.current,
        cardCaseElRef.current
      );

      const calcRotate = utility.calcReduceRotate(
        [cardPointRef.current.down.y, targetCardElRef.current.offsetHeight],
        cardMaxRotate
      );

      /* s: keep */
      // card direction check
      if (calcTranslatePercentX < 0) {
        // INFO: left direction
        cardInformRef.current.direction.left = true;
        const calcRemainLeftPercent = utility.calcPercent(
          remainLeft - cardWidth,
          cardRectRef.current.down.remain.left - cardWidth,
          true,
          1
        );

        const calcArrivalRotatePercent = utility.calcArrivalPercent(
          calcRemainLeftPercent,
          -calcRotate
        );
        cardRectRef.current.move.transform.rotate = calcArrivalRotatePercent;
      } else if (calcTranslatePercentX > 0) {
        // INFO: right direction
        cardInformRef.current.direction.right = true;
        const calcRemainRightPercent = utility.calcPercent(
          remainRight + cardWidth,
          cardRectRef.current.down.remain.right + cardWidth,
          true
        );
        const calcArrivalRotatePercent = utility.calcArrivalPercent(
          calcRemainRightPercent,
          calcRotate
        );
        cardRectRef.current.move.transform.rotate = calcArrivalRotatePercent;
      } else {
        // INFO: none direction
        cardInformRef.current.direction = utility.directionObj(false);
      }

      // dom-controll
      domController.transform(targetCardElRef.current, {
        translateX: calcTranslateX,
        rotate: cardRectRef.current.move.transform.rotate,
      });
      /* e: keep */

      // save-values
      windowPointRef.current.move.x = calcTranslateX;
      windowPointPercentRef.current.move.x = calcTranslatePercentX;

      cardRectRef.current.move.remain.left = remainLeft;
      cardRectRef.current.move.remain.right = remainRight;
    }, []);

    const onWindowUp = useCallback((event: PointerEvent) => {
      if (isHardBlockEvent()) return;
      if (!targetCardElRef.current) return;
      if (!cardCaseElRef.current) return;

      // reset-pre-values
      isWindowDownRef.current = false;
      isCardCaseDownRef.current = false;
      cardInformRef.current.direction = utility.directionObj(false);

      const { clientX, clientY } = event;

      let calcRotate = 0;
      let calcTranslateX = 0;

      // calc-values
      const { left: remainLeft, right: remainRight } = utility.calcRemainRect(
        targetCardElRef.current,
        cardCaseElRef.current
      );

      // save-values
      windowPointRef.current.up = utility.pointXY(clientX, clientY);
      windowPointPercentRef.current.up.x = windowPointPercentRef.current.move.x;

      cardRectRef.current.up.remain.left = remainLeft;
      cardRectRef.current.up.remain.right = remainRight;
      cardRectRef.current.up.transform.rotate = calcRotate;

      /* s: end */

      if (swipeProgress <= Math.abs(windowPointPercentRef.current.up.x)) {
        // INFO: over swipeProgress

        const { offsetWidth: targetCardWidth } = targetCardElRef.current;

        // INFO : left, right 공동
        calcRotate = cardRectRef.current.move.transform.rotate;

        const remainWidth = utility.calcRemainRotateWidth(
          targetCardElRef.current,
          calcRotate
        );

        const addGutter = targetCardWidth + remainWidth + cardEscapeGutter;

        if (windowPointPercentRef.current.up.x < 0) {
          // INFO: left direction;
          cardInformRef.current.direction.left = true;
          calcTranslateX = cardRectRef.current.down.remain.left - addGutter;
        } else if (windowPointPercentRef.current.up.x > 0) {
          // INFO: right direction;
          cardInformRef.current.direction.right = true;
          calcTranslateX = cardRectRef.current.down.remain.right + addGutter;
        }
      } else {
        // INFO: under swipeProgress
        calcTranslateX = 0;
        calcRotate = 0;
      }
      // dom-controll
      domController.transition(targetCardElRef.current, {
        property: "transform",
        duration: cardTransitionDuration,
        timing: cardTransitionTiming,
        delay: cardTransitionDelay,
      });
      domController.transform(targetCardElRef.current, {
        translateX: calcTranslateX,
        rotate: calcRotate,
      });
      /* e: end */

      // reset-values
      windowPointPercentRef.current.move = utility.pointXY();
      windowPointRef.current.down = utility.pointXY();
      cardRectRef.current.down.remain = utility.directionObj(0);
      cardRectRef.current.move.transform = utility.matrixObj();
      targetCardElRef.current = null;
    }, []);

    const onWindowResize = () => {
      cardSizeSettings();
    };

    // provide-client
    const onCardTransitionStart = () => {
      isTransitionRef.current = true;
    };
    const onCardTransitionEnd = ({
      swipeCardId,
    }: {
      swipeCardId: string | number;
    }) => {
      isTransitionRef.current = false;

      if (typeof onCardSwipeEnd === "function")
        onCardSwipeEnd({
          swipeCardId: swipeCardId,
          direction: cardInformRef.current.direction,
        });
    };

    return (
      <div
        className={`swipe-card-case ${styles.CardCase} ${styles.dragLock}`}
        ref={cardCaseElRef}
        style={{
          boxSizing: "border-box",
          width: cardCaseWidth,
          height: cardCaseHeight,
          overflow: unstable_cardCaseOverflow,
        }}
        onPointerDown={onCardCaseDown}
        onPointerMove={onCardCaseMove}
        onPointerUp={onCardCaseUp}
      >
        <div
          className={`swipe-card-container ${styles.CardContainer} ${styles.dragLock}`}
          ref={cardContainerElRef}
          style={{
            boxSizing: "border-box",
            width: cardWidth,
            height: cardHeight,
            left: `${cardPositionX}%`,
            top: `${cardPositionY}%`,
            transform: `translate(-${cardPositionX}%, -${cardPositionY}%)`,
          }}
        >
          {React.Children.map(children, (childrenItem, childrenIndex) => {
            const { key, props } = childrenItem as Readonly<any>;

            const swipeCardId = props?.swipeCardId ?? key;
            return (
              <SwipeCard
                className={`swipe-card ${styles.dragLock}`}
                ref={setStackCardsRef(childrenIndex)}
                style={{
                  boxSizing: "border-box",
                  width: cardWidth,
                  height: cardHeight,
                  zIndex:
                    React.Children.count(children) - 1 - childrenIndex ?? 0,
                  cursor: "grab",
                }}
                onPointerDown={onCardDown}
                onPointerMove={onCardMove}
                onPointerUp={onCardUp}
                onTransitionEnd={() => onCardTransitionEnd({ swipeCardId })}
              >
                {childrenItem}
              </SwipeCard>
            );
          })}
        </div>
      </div>
    );
  }
);

export { SwipeCardCase };
