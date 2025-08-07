interface SectionDividerProps {
  title: string;
}

export const SectionDivider = ({ title }: SectionDividerProps) => (
  <div className="flex items-center w-full my-6 sm:my-8">
    <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
    <h2 className="mx-2 sm:mx-4 text-lg sm:text-xl font-bold text-purple-800 px-3 sm:px-6 py-1.5 sm:py-2 bg-purple-50 rounded-full border border-purple-100 shadow-sm text-center">
      {title}
    </h2>
    <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
  </div>
);
