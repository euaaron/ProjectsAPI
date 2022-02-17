export type CodeProject = {
  origin: string;
  owner: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  homepage?: string;
  language: string;
  readme?: string;
  tags?: string[];
  similarTo?: SimilarTo[];
  updatedAt: string;
  createdAt: string;
};

export type SimilarTo = { name: string; url: string; reason: string };
