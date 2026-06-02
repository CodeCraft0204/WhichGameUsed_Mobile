export type AppRole = 'user' | 'admin' | 'super_admin';

export type Profile = {
  id: string;
  role: AppRole;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  about: string | null;
  location_text: string | null;
};
