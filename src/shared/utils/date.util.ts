import {
  addDays,
  endOfMonth,
  isWithinInterval,
  startOfMonth,
  format,
} from 'date-fns';

export function getCurrentWeekMondayToSaturday(): string[] {
  const today = new Date();
  const dayOfWeek: number = today.getDay(); // 0 (Chủ Nhật) -> 6 (Thứ Bảy)

  // Tìm thứ 2 của tuần hiện tại (lùi về thứ 2 nếu hôm nay không phải thứ 2)
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  // Tạo danh sách từ thứ 2 đến thứ 7
  const days: string[] = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push(date.toISOString().split('T')[0]); // Format YYYY-MM-DD
  }

  return days;
}

export function getDatesOfMonth(data: {
  date: Date;
  endDate?: Date;
  formatString?: string;
  isSkipWeekend?: boolean;
}): Date[] {
  const { date, endDate, formatString } = data;
  const dates = [];
  const firstDay = startOfMonth(date);
  let currentDate = firstDay;

  while (
    isWithinInterval(currentDate, {
      start: firstDay,
      end: endDate || endOfMonth(date),
    })
  ) {
    // Skip weekends if isSkipWeekend is true
    if (data.isSkipWeekend) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate = addDays(currentDate, 1);
        continue;
      }
    }
    // Format date and add to the array
    dates.push(format(currentDate, formatString || 'yyyy-MM-dd'));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}
