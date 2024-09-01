import { Auth } from './_auth';
import { Common } from './_common';
import { Company } from './_company';
import { Timekeeping } from './_timekeeping';
import { Timeoff } from './_timeoff';

export type I18nKeys =
  | keyof Auth
  | keyof Common
  | keyof Company
  | keyof Timekeeping
  | keyof Timeoff;
