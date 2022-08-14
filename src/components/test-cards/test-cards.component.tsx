import React from "react";
import styles from "./test-cards.style.module.css";

interface TestCardsProps {
  swipeCardId: string | number;
  bgColor: string;
}
const TestCards: React.FC<TestCardsProps> = ({ bgColor }) => {
  return (
    <>
      <div
        className={styles.testCards}
        style={{
          background: bgColor,
        }}
      >
        <p className={styles.testP}>Card</p>
      </div>
    </>
  );
};

export { TestCards };
