import axios from "axios";
import cheerio from "cheerio";
import { date } from "../../../shared/utils/time";
import { GitHubRepositoryDTO } from "./dto/GitHubRepositoryDTO";

/**
 * @class GitHubService
 * @description A Singleton service that handles all GitHub related requests
 */
export class GitHubService {
  private static instance: GitHubService;
  private repos: Promise<GitHubRepositoryDTO[]>;

  // Private Constructor to ensure Singleton
  private constructor() {
    this.repos = this.getProjects();
  }

  /**
   * @method getInstance
   * @description Get the singleton instance of the ProjectService
   * @returns ProjectService
   */
  public static getInstance(): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService();
    }
    return GitHubService.instance;
  }

  public async getProjects(forceFetch = false): Promise<GitHubRepositoryDTO[]> {
    let repos: GitHubRepositoryDTO[] = await this.repos;
    if (!repos || forceFetch) {
      repos = this.orderProjectByLastUpdate(await this.getReposFromGitHub());
      repos = await this.insertTags(repos);
      repos = await this.insertReadme(repos);
    }
    return Promise.resolve(repos);
  }

  /**
   * @method insertReadme
   * @description Insert the readme (if exists) at all repositories
   * @param repos repository array to be updated
   * @returns a promise that resolves to the updated repository array
   */
  private async insertReadme(
    repos: GitHubRepositoryDTO[]
  ): Promise<GitHubRepositoryDTO[]> {
    const reposWithReadme = repos.map(async (repo) => {
      const newReadme = await this.getReadmeFromGitHub(repo.html_url);
      return { ...repo, readme: newReadme };
    });
    return Promise.all(reposWithReadme);
  }

  private parseDateToString(isoDate: string): string {
    return date(new Date(isoDate));
  }

  private async getReadmeFromGitHub(repoHtmlUrl: string): Promise<string> {
    let readmeUrl = "none";
    const readme = await axios
      .get(`${repoHtmlUrl}/blob/main/README.md`)
      .then(async (data) => {
        if (data.status !== 200) {
          return "none";
        }
        const $readme = cheerio.load(data.data);
        const rawButton = $readme("a[id='raw-url']");
        readmeUrl = `https://github.com${rawButton.attr(
          "data-permalink-href"
        )}`;
        const foundReadme = await axios.get(readmeUrl);
        return String(foundReadme.data);
      })
      .catch(() => {
        return "none";
      });
    return readme;
  }

  private orderProjectByLastUpdate(
    repos: GitHubRepositoryDTO[]
  ): GitHubRepositoryDTO[] {
    return repos?.sort((a: GitHubRepositoryDTO, b: GitHubRepositoryDTO) => {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  }

  private async insertTags(
    repos: GitHubRepositoryDTO[]
  ): Promise<GitHubRepositoryDTO[]> {
    const reposWithTags = repos.map(async (repo) => {
      const newTags = await this.findTagsOnGitHub(repo.html_url);
      return {
        ...repo,
        tags: newTags,
        created_at: this.parseDateToString(repo.created_at),
        updated_at: this.parseDateToString(repo.updated_at),
        language: repo.language === "css" ? "css3" : repo.language,
      };
    });
    return Promise.all(reposWithTags);
  }

  private async findTagsOnGitHub(repoHtmlUrl: string): Promise<string[]> {
    const tags: string[] = [];
    const tagsResponse = await axios.get(String(repoHtmlUrl));
    const $tags = cheerio.load(tagsResponse.data);
    const foundTags = $tags("a[data-octo-click='topic_click']");
    if (foundTags && foundTags.length > 0) {
      foundTags.each((_, el) => {
        const tag = $tags(el).text().trim().replace("\n", "");
        tags.push(tag);
      });
    }
    return this.removeDuplicatedTags(tags);
  }

  private removeDuplicatedTags(repos: string[]) {
    return repos.filter((repo, index) => {
      return repos.indexOf(repo) === index;
    });
  }

  private removeForked(repos: GitHubRepositoryDTO[]) {
    return repos.filter((repo) => !repo.fork);
  }

  private async getReposFromGitHub(): Promise<GitHubRepositoryDTO[]> {
    return await axios
      .get("https://api.github.com/users/euaaron/repos")
      .then((response) => {
        return this.removeForked(response.data);
      })
      .catch((error) => {
        return [];
      });
  }
}
