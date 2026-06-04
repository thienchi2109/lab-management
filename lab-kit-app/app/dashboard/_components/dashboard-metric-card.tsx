import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  {
    title: "WSSV (Đốm trắng)",
    result: "4 mẫu (1.2%)",
    resultClassName: "text-destructive",
    barClassName: "bg-destructive",
    width: "35%",
  },
  {
    title: "EHP (Vi bào tử trùng)",
    result: "3 mẫu (0.9%)",
    resultClassName: "text-destructive",
    barClassName: "bg-destructive",
    width: "25%",
  },
  {
    title: "AHPND (Hoại tử gan tụy)",
    result: "1 mẫu (0.3%)",
    resultClassName: "text-amber-600 dark:text-amber-400",
    barClassName: "bg-amber-500",
    width: "10%",
  },
  {
    title: "IHHNV (Còi cọc)",
    result: "0 mẫu (0.0%)",
    resultClassName: "text-muted-foreground",
    barClassName: "bg-emerald-500",
    width: "0%",
  },
];

function DashboardMetricCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-bold">
          Dương tính theo chỉ tiêu PCR
        </CardTitle>
        <CardDescription className="text-[10px]">
          Tỷ lệ nhiễm trên các chỉ tiêu xét nghiệm
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {metric.title}
              </span>
              <span className={`font-semibold ${metric.resultClassName}`}>
                {metric.result}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className={`h-full rounded-full ${metric.barClassName}`}
                style={{ width: metric.width }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { DashboardMetricCard };
