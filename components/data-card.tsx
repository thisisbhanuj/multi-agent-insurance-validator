"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3">
          {fields.map(({ label, key }) => (
            <div key={key} className="flex items-start gap-4">
              <span className="text-sm text-muted-foreground min-w-24 shrink-0">
                {label}
              </span>
              <span className="text-sm font-medium text-foreground break-words">
                {data[key] || "—"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
