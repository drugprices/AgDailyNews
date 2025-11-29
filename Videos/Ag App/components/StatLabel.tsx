interface StatLabelProps {
  label: string;
  value: string;
}

export function StatLabel({ label, value }: StatLabelProps) {
  return (
    <div className="flex justify-between text-sm mb-1">
      <span className="text-textMuted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
