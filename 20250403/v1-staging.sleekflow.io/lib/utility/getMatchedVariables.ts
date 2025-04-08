export const getMatchedVariables = (message: string): RegExpMatchArray[] => {
  const regex = /(?:\{\{)(?<pattern>.*?)(?:\}\})/gm;
  return [...message.matchAll(regex)];
};
