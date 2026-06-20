type ToggleGroupProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleGroup({ label, checked, onChange }: ToggleGroupProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground">
      <span>{label}</span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-[#5E6AD2]"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
