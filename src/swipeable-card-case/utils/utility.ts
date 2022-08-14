function pointXY(x: number = 0, y: number = 0): { x: number; y: number } {
  return { x: x, y: y };
}
type DirectionObj<V> = {
  top: V;
  right: V;
  bottom: V;
  left: V;
};

function directionObj<V>(directionValue: V): DirectionObj<V> {
  return {
    top: directionValue,
    right: directionValue,
    bottom: directionValue,
    left: directionValue,
  };
}

interface MatrixObject {
  translateX: number;
  translateY: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
}
function matrixObj(matrixObjValue?: MatrixObject) {
  const {
    translateX = 0,
    translateY = 0,
    rotate = 0,
    scaleX = 0,
    scaleY = 0,
  } = matrixObjValue ?? {};
  return {
    translateX,
    translateY,
    rotate,
    scaleX,
    scaleY,
  };
}

function calcPercent(
  absoluteValue: number,
  relativeValue: number,
  reversePercent = false,
  fractionDigits = 5
): number {
  const percent = (absoluteValue / relativeValue) * 100;
  const resultPercent = !reversePercent ? percent : 100 - percent;
  return parseFloat(resultPercent.toFixed(fractionDigits));
}
function calcArrivalPercent(absoluteValue: number, relativeValue: number) {
  return (relativeValue * (absoluteValue || 1 / relativeValue)) / 100;
}
function calcReduceRotate(
  [absoluteValue, relativeValue]: [number, number],
  relativeRotate: number
) {
  const centerPoint = relativeValue / 2;
  const percentFromMiddlePoint =
    ((absoluteValue - centerPoint) / centerPoint) * 100 * -1;

  const percentRotate = calcArrivalPercent(
    percentFromMiddlePoint,
    relativeRotate
  );

  return percentRotate;
}
function calcRemainRect(
  targetElement: HTMLElement,
  relativeElement: HTMLElement
) {
  const { width: targetWidth, x: targetX } =
    targetElement.getBoundingClientRect();
  const { width: relativeWidth, x: relativeX } =
    relativeElement.getBoundingClientRect();

  // const remainTop =
  // const remainBottom =
  const remainLeft = relativeX - targetX;
  const remainRight = relativeWidth + relativeX - (targetWidth + targetX);

  return {
    left: remainLeft,
    right: remainRight,
  };
}

function radian(angle: number) {
  return (angle * Math.PI) / 180;
}

function calcRemainRotateWidth(targetElement: HTMLElement, rotate: number) {
  const { offsetWidth: width, offsetHeight: height } = targetElement;
  const w1R = radian(rotate);
  const w2R = radian(90 - rotate);

  const w1W = Math.cos(w1R) * width;
  const w2W = Math.cos(w2R) * height;

  const toBeW = Math.abs(w1W) + Math.abs(w2W);
  const remainW = (toBeW - width) / 2;
  return remainW;
}

const utility = {
  pointXY,
  directionObj,
  matrixObj,
  calcPercent,
  calcArrivalPercent,
  calcReduceRotate,
  calcRemainRect,
  calcRemainRotateWidth,
};

export default utility;
export type { DirectionObj };
