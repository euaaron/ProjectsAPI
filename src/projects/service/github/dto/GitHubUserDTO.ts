export type GitHubUserDTO = {
  login: string;
  name: string;
  email: string;
  bio: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: Date;
  updated_at: Date;
};
