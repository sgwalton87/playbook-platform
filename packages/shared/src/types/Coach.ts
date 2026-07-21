export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;

  school?: string;
  organization?: string;
  sport?: string;

  verified: boolean;
}
