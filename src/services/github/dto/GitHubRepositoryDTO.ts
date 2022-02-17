import { GitHubUserDTO } from "./GitHubUserDTO";

export type GitHubRepositoryDTO = {
  owner: GitHubUserDTO;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  language: string;  
  homepage?: string;
  tags?: string[];
  readme?: string;
  created_at: string;
  updated_at: string;
  fork: boolean;
};
