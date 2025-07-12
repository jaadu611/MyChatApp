import { format, isToday, isYesterday } from "date-fns";

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const formatChatDate = (date) => {
  const msgDate = new Date(date);
  if (isToday(msgDate)) return "Today";
  if (isYesterday(msgDate)) return "Yesterday";
  return format(msgDate, "MMMM d, yyyy");
};
