"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IdCard, FileText, Car, LucideIcon } from "lucide-react";

interface DataCardProps {
  title: string;
  icon: "dl" | "claim" | "car";
  data: Record<string, string | undefined>;
  fields: { label: string; key: string }[];
}

const iconMap: Record<string, LucideIcon> = {
  dl: IdCard,
  claim: FileText,
  car: Car,
};

export function DataCard({ title, icon, data, fields }: DataCardProps) {
  const Icon = iconMap[icon];

  return (
    <Card className="h-full card-glow gradient-border bg-card/80">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-base">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="size-4 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3">
          {fields.map(({ label, key }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider shrink-0">
                {label}
              </span>
              <span className="text-sm font-medium text-foreground text-right break-words">
                {data[key] || "—"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
