import { FigmaChipRow, type FigmaChipOption } from '@/components/figma/FigmaChipRow';

export type { FigmaChipOption as ChipOption };

type DatabaseChipRowProps<T extends string> = {
  label: string;
  options: FigmaChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

/** @deprecated Use FigmaChipRow directly — kept for database search filters. */
export function DatabaseChipRow<T extends string>(props: DatabaseChipRowProps<T>) {
  return <FigmaChipRow {...props} />;
}
