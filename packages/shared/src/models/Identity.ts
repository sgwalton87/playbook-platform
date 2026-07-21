export interface Identity {
  id: string;

  username?: string;

  avatarUrl?: string;

  role: string;

  registrationType?: string;

  onboarded: boolean;
}
