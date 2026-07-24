import React from 'react';
import { FigmaChipRow } from '@/components/figma/FigmaChipRow';
import {
  EDUCATION_TIMELINE_SPORT_FILTERS,
  type EducationTimelineSportFilter
} from '@/lib/education-timeline';

type Props = {
  value: EducationTimelineSportFilter;
  onChange: (value: EducationTimelineSportFilter) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EducationTimelineSportFilters({ value, onChange, s, t }: Props) {
  return (
    <FigmaChipRow
      options={EDUCATION_TIMELINE_SPORT_FILTERS}
      value={value}
      onChange={onChange}
      s={s}
      t={t}
    />
  );
}
