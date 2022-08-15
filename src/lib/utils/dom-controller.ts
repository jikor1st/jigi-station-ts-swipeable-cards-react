interface TransformOptionsProps {
  translateX?: string | number;
  translateY?: string | number;
  rotate?: number;
  scaleX?: number;
  scaleY?: number;
}
const deg2radians = (Math.PI * 2) / 360;
function transform(
  targetEl: HTMLElement,
  {
    translateX = 0,
    translateY = 0,
    rotate = 0,
    scaleX = 1,
    scaleY = 1,
  }: TransformOptionsProps
) {
  if (!targetEl) return;

  const rad = rotate * deg2radians;
  const costheta = Math.cos(rad);
  const sintheta = Math.sin(rad);

  const calcScaleX = parseFloat(costheta.toFixed(8)) * scaleX;
  const b = parseFloat(sintheta.toFixed(8)) * scaleY;
  const c = parseFloat((sintheta * -1).toFixed(8)) * scaleX;
  const calcScaleY = parseFloat(costheta.toFixed(8)) * scaleY;

  targetEl.style.transform = `matrix(${calcScaleX}, ${b}, ${c}, ${calcScaleY}, ${translateX}, ${translateY})`;
}

function getComputedStyle(targetEl: HTMLElement) {
  if (!targetEl) return;
  return window.getComputedStyle(targetEl);
}

function getTransformMatrix(targetEl: HTMLElement) {
  const transformMatrix =
    getComputedStyle(targetEl)?.getPropertyValue("transform");
  const [getScaleX, b, c, getScaleY, getTranslateX, getTranslateY] =
    transformMatrix
      ?.split("matrix(")[1]
      .split(")")[0]
      .split(",")
      .map((item) => parseFloat(item)) ?? [];

  const rotate = Math.round(Math.atan2(b, getScaleX) * (180 / Math.PI));
  const scaleX = parseFloat(
    Math.sqrt(getScaleX * getScaleX + b * b).toPrecision(2)
  );
  const scaleY = parseFloat(
    Math.sqrt(getScaleY * getScaleY + c * c).toPrecision(2)
  );

  return {
    rotate: rotate,
    scaleX: scaleX,
    scaleY: scaleY,
    translateX: getTranslateX,
    translateY: getTranslateY,
  };
}

interface TransitionOptionsProps {
  property?: string;
  duration?: number;
  timing?: string;
  delay?: number;
}

function transitionObject({
  property = "all",
  duration = 0,
  timing = "linear",
  delay = 0,
}: TransitionOptionsProps) {
  return `${property} ${duration}s ${timing} ${delay}s`;
}
function transition(
  targetEl: HTMLElement,
  transitionValue?: TransitionOptionsProps[] | TransitionOptionsProps
) {
  if (!targetEl) return;
  const transitionOptions =
    transitionValue && Array.isArray(transitionValue)
      ? transitionValue
          .map(({ property, duration, timing, delay }) => {
            return transitionObject({ property, duration, timing, delay });
          })
          .join(",")
      : transitionValue
      ? transitionObject(transitionValue)
      : "none";
  targetEl.style.transition = transitionOptions;
}

const domController = {
  transform,
  transition,
  getTransformMatrix,
};
export default domController;
