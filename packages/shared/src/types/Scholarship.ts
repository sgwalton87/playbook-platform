export interface Scholarship {
  id: string;

  name: string;

  provider: string;

  amount?: number;

  deadline?: string;

  applied: boolean;

  awarded: boolean;
}
