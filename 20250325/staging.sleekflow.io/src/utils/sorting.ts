//We have many multi select components through out the app. This function is to improve the display order of the options.
//We need to sort the display order by the length of the display name in order to get the most similar result.
//And put those selected options at the top to enhance user experience.

export const sortBySimilarities = <T = { [key: string]: any }>(
  data: T[],
  getName = (x: any) => x.name,
  getSelected = (x: any) => x.selected,
) => {
  return data
    .sort((a, b) => getName(a)?.length - getName(b)?.length)
    .sort((a, b) => getSelected(b) - getSelected(a))
    .sort();
};

export const sortBySimilaritiesWithoutName = <T = { [key: string]: any }>(
  data: T[],
  getSelected = (x: any) => x.selected,
) => {
  return data.sort((a, b) => getSelected(b) - getSelected(a)).sort();
};
