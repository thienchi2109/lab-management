import { ShieldCheck, UserCheck, UserRoundX, Users } from "lucide-react";

export const userSummaryItems = [
  {
    key: "total",
    label: "Tổng người dùng",
    icon: Users,
  },
  {
    key: "active",
    label: "Đang hoạt động",
    icon: UserCheck,
  },
  {
    key: "admins",
    label: "Admin",
    icon: ShieldCheck,
  },
  {
    key: "inactive",
    label: "Tạm khóa",
    icon: UserRoundX,
  },
] as const;
