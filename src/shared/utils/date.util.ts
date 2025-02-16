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
