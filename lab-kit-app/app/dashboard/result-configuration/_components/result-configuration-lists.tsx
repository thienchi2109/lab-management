import { Badge } from "@/components/ui/badge";
import type {
  ResultConfiguration,
  ResultGroup,
  ResultMetric,
  ResultTemplate,
} from "@/lib/result-configuration/configuration";

type ResultConfigurationListsProps = {
  config: ResultConfiguration;
  panel: "groups" | "metrics" | "templates";
};

export function ResultConfigurationLists({
  config,
  panel,
}: ResultConfigurationListsProps) {
  if (panel === "groups") {
    return <GroupList groups={config.groups} />;
  }

  if (panel === "metrics") {
    return <MetricList metrics={config.metrics} />;
  }

  return <TemplateList templates={config.templates} />;
}

function GroupList({ groups }: { groups: ResultGroup[] }) {
  return (
    <div className="grid gap-3">
      {groups.map((group) => (
        <section key={group.id} className="rounded-lg border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{group.name}</h2>
                <StatusBadge isActive={group.isActive} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {group.code} · {group.metrics.length} chỉ tiêu
              </p>
            </div>
            <Badge variant="outline">Thứ tự {group.sortOrder}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.metrics.map((metric) => (
              <Badge key={metric.id} variant="secondary">
                {metric.name}
              </Badge>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MetricList({ metrics }: { metrics: ResultMetric[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <table className="hidden w-full text-sm md:table">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Chỉ tiêu</th>
            <th className="px-4 py-3 font-medium">Kiểu nhập</th>
            <th className="px-4 py-3 font-medium">Đơn vị</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {metrics.map((metric) => (
            <tr key={metric.id}>
              <td className="px-4 py-3">
                <div className="font-medium">{metric.name}</div>
                <div className="text-xs text-muted-foreground">
                  {metric.code}
                </div>
              </td>
              <td className="px-4 py-3">{metric.inputType}</td>
              <td className="px-4 py-3">{metric.unit ?? "Không có"}</td>
              <td className="px-4 py-3">
                <StatusBadge isActive={metric.isActive} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divide-y md:hidden">
        {metrics.map((metric) => (
          <div key={metric.id} className="space-y-2 p-4">
            <div className="font-medium">{metric.name}</div>
            <div className="text-xs text-muted-foreground">
              {metric.code} · {metric.inputType} · {metric.unit ?? "Không có"}
            </div>
            <StatusBadge isActive={metric.isActive} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateList({ templates }: { templates: ResultTemplate[] }) {
  return (
    <div className="grid gap-3">
      {templates.map((template) => (
        <section
          key={template.id}
          className="rounded-lg border bg-background p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{template.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {template.code} · {template.sampleTypeName}
              </p>
            </div>
            <StatusBadge isActive={template.isActive} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {template.metrics.map((metric) => (
              <Badge key={metric.id} variant="secondary">
                {metric.name}
              </Badge>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "outline" : "destructive"}>
      {isActive ? "Hoạt động" : "Tạm khóa"}
    </Badge>
  );
}
