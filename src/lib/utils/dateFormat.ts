import { format } from "date-fns";
import { ko } from "date-fns/locale";

const dateFormat = (
  date: Date | string,
  // pattern: string = "dd MMM, yyyy",
  pattern: string = "yyyy년 M월 d일",
): string => {
  const dateObj = new Date(date);
  const output = format(dateObj, pattern, { locale: ko });
  return output;
};

export default dateFormat;
