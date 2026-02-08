interface SectionDividerProps {
  title: string;
}

export const SectionDivider = ({ title }: SectionDividerProps) => (
  <div className="flex items-center gap-3 my-8">
    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{title}</h2>
    <div className="h-px flex-grow bg-slate-200" />
  </div>
);
