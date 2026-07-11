import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function PillarPicker({
  pillars,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
}: {
  pillars: string[];
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  if (pillars.length === 0) {
    return (
      <p className="rounded-brutal-sm border-brutal bg-cream px-3 py-2.5 font-body text-sm text-ink-muted">
        Todavia no hay pilares de contenido cargados.{" "}
        <Link href="/brand-bible" className="underline">
          Agregalos en el Brand Bible
        </Link>{" "}
        antes de continuar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {pillars.map((pilar) => (
        <label
          key={pilar}
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-brutal border-brutal bg-paper p-3 font-body text-sm text-ink transition-all",
            "has-checked:border-brutal-thick has-checked:bg-cream has-checked:shadow-brutal-sm",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <input
            type="radio"
            name={name}
            value={pilar}
            required
            disabled={disabled}
            checked={value !== undefined ? value === pilar : undefined}
            defaultChecked={value === undefined ? defaultValue === pilar : undefined}
            onChange={() => onChange?.(pilar)}
            className="mt-1 accent-pop-orange"
          />
          <span className="whitespace-normal">{pilar}</span>
        </label>
      ))}
    </div>
  );
}
