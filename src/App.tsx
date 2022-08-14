import React, { useState } from "react";
import { SwipeCardCase } from "@jigi-station/ts-swipeable-cards-react";

import { TestCards } from "../src/components";
const MockCardList = [
  {
    id: 0,
    bgColor: "#ff0000",
  },
  {
    id: 1,
    bgColor: "#ff9900",
  },
  {
    id: 2,
    bgColor: "#51ff00",
  },
  {
    id: 3,
    bgColor: "#00ff88",
  },
];
function App() {
  const [testCardList, setTestCardList] = useState(MockCardList);
  const handleCardSwipeDone = (data) => {
    const {
      swipeCardId,
      direction: { left, right },
    } = data;
    setTestCardList((prev) => {
      if (left || right) {
        return prev.filter((item) => {
          return item.id !== swipeCardId;
        });
      } else {
        return prev;
      }
    });
  };
  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 800,
          height: 700,
          border: "1px solid #cccccc",
          marginTop: 75,
        }}
      >
        <SwipeCardCase
          initialSettings={{
            // cardCaseWidth: 400,
            // cardCaseHeight: 400,
            // cardWidth: 150,
            // cardHeight: 250,
            cardPositionX: 50,
            cardPositionY: 50,
            swipeProgress: 25,
            cardMaxRotate: 45,
            unstable_cardCaseOverflow: "hidden",
            cardEscapeGutter: 0,
            cardTransition: {
              duration: 0.25,
              timing: "ease-in-out",
              delay: 0,
            },
            unstable_onCardSwipeStart: () => {},
            unstable_onCardSwipeMove: () => {},
            onCardSwipeEnd: handleCardSwipeDone,
          }}
        >
          {testCardList.map(({ id, bgColor }) => (
            <TestCards swipeCardId={id} key={id} bgColor={bgColor} />
          ))}
        </SwipeCardCase>
      </div>
    </div>
  );
}

export default App;
