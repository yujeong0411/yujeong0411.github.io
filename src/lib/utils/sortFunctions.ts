// sort by date
export const sortByDate = (array: any[]) => {
  const sortedArray = array.sort(
    (a: any, b: any) => {
      // 날짜가 없으면 현재 시간으로 설정 (맨 위로 정렬됨)
      const dateA = a.data.date ? new Date(a.data.date) : new Date();
      const dateB = b.data.date ? new Date(b.data.date) : new Date();

      return dateB.valueOf() - dateA.valueOf(); // 최신순 정렬
    }
  );
  return sortedArray;
};

// sort product by weight
export const sortByWeight = (array: any[]) => {
  const withWeight = array.filter(
    (item: { data: { weight: any } }) => item.data.weight,
  );
  const withoutWeight = array.filter(
    (item: { data: { weight: any } }) => !item.data.weight,
  );
  const sortedWeightedArray = withWeight.sort(
    (a: { data: { weight: number } }, b: { data: { weight: number } }) =>
      a.data.weight - b.data.weight,
  );
  const sortedArray = [...new Set([...sortedWeightedArray, ...withoutWeight])];
  return sortedArray;
};
