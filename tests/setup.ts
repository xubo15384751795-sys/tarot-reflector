import "@testing-library/jest-dom";

/**
 * jsdom 不实现 window.matchMedia。
 * useReducedMotion（以及任何读媒体查询的组件）在测试里会直接抛
 * "window.matchMedia is not a function"，所以在这里补一个最小实现。
 *
 * 默认返回 matches: false —— 即「不要求减弱动效」，跑的是正常动效分支。
 * 需要测 reduced-motion 分支的用例，自行 stub 这个方法。
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    media: query,
    matches: false,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
