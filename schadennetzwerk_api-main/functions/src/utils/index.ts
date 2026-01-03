export { default as generateKeywords } from "./generateKeywords";

export const generateRandPassword = () => {
  const randPassword = Math.random().toString(36).slice(-8);
  return randPassword;
};
