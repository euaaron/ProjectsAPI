import { GitHubRepositoryDTO } from "./github/dto/GitHubRepositoryDTO";
import { GitHubService } from "./github/GitHubService";
import { CodeProject, SimilarTo } from "./models/CodeProject";

/**
 * @class ProjectService
 * @description A Singleton service that handles all project related requests
 */
export class ProjectService {
  private static instance: ProjectService;
  private projects: Promise<CodeProject[]>;

  // Private Constructor to ensure Singleton
  private constructor() {
    this.projects = this.getUpdates();
  }

  /**
   * @method getInstance
   * @description Get the singleton instance of the ProjectService
   * @returns ProjectService
   */
  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  /**
   * @method getInstance
   * @description Get the singleton instance of the ProjectService
   * @returns ProjectService
   */
  public getInstance(): ProjectService {
    return ProjectService.getInstance();
  }

  /**
   * @method getProjects
   * @description Get all projects from their respective services or from cache
   * @returns Promise<CodeProject[]>
   */
  public async getAll() {
    let allProjects = await this.projects;
    if (!allProjects || allProjects.length === 0) {
      allProjects = await this.getUpdates();
    }
    return allProjects;
  }

  /**
   * @method getUpdates
   * @description Get all projects from their respective services or from cache
   * @returns Promise<CodeProject[]>
   * @note currently it only get from GitHub
   */
  public async getUpdates(): Promise<CodeProject[]> {
    let parsedGitHubProjects: Promise<CodeProject[]>;
    const gitHubProjects = await this.getProjectsFromGithub();
    const almostParsedProj = this.parseGitHubProjects(gitHubProjects);
    parsedGitHubProjects = Promise.all(
      almostParsedProj.map((item) =>
        this.fillSimilarProjects(item, almostParsedProj)
      )
    );
    return parsedGitHubProjects;
  }

  private async fillSimilarProjects(
    project: CodeProject,
    allProjects: CodeProject[]
  ): Promise<CodeProject> {
    project.similarTo = this.findSimilarProjects(project, allProjects);
    return project;
  }

  private findSimilarProjects(
    project: CodeProject,
    projects: CodeProject[]
  ): SimilarTo[] {
    const similarProjects: SimilarTo[] = [];
    projects.forEach((item: CodeProject) => {
      if (item.name !== project.name) {
        if (item.tags && project.tags) {
          const { match, reason } = this.checkMatchingTags(
            item.tags,
            project.tags
          );
          if (match) {
            similarProjects.push({
              name: item.name,
              reason: reason,
              url: item.url,
            });
          }
        } else if (item.language === project.language) {
          similarProjects.push({
            name: item.name,
            reason: item.language,
            url: item.url,
          });
        } else if (item.tags || project.tags) {
          const { match, reason } = this.checkLanguageMatchTags(
            item.tags || [],
            project.language
          );
          if (match) {
            similarProjects.push({
              name: item.name,
              reason,
              url: item.url,
            });
          } else {
            const { match, reason } = this.checkLanguageMatchTags(
              project.tags || [],
              item.language
            );
            if (match) {
              similarProjects.push({
                name: item.name,
                reason,
                url: item.url,
              });
            }
          }
        }
      }
    });
    return similarProjects;
  }

  private checkLanguageMatchTags(
    tags: string[],
    language: string
  ): { match: boolean; reason: string } {
    let match = false;
    let reason = "";
    if (tags) {
      tags.forEach((tag: string) => {
        if (tag === language) {
          match = true;
          reason = tag;
        }
      });
    }
    return { match, reason };
  }

  private checkMatchingTags(
    itemTags: string[],
    compareTags: string[]
  ): { match: boolean; reason: string } {
    let match = false;
    let reason = "";
    if (itemTags && compareTags) {
      itemTags.forEach((itemTag: string) => {
        if (compareTags.includes(itemTag)) {
          match = true;
          reason = itemTag;
        }
      });
    }
    return { match, reason };
  }

  /**
   * @method getProjectsFromGithub
   * @description Get all projects from the GitHub API
   * @returns Promise<GitHubRepositoryDTO[]>
   */
  private async getProjectsFromGithub(): Promise<GitHubRepositoryDTO[]> {
    return GitHubService.getInstance().getProjects();
  }

  /**
   * @method parseGitHubProjects
   * @description Parse the GitHubRepositoryDTOs into CodeProjects
   * @param projects an array of projects formatted as GitHubRepositoryDTO
   * @returns an array of projects formatted as CodeProject
   */
  private parseGitHubProjects(projects: GitHubRepositoryDTO[]): CodeProject[] {
    const parsedProjects: CodeProject[] = [];
    projects.forEach((project: GitHubRepositoryDTO) => {
      parsedProjects.push({
        origin: "github",
        owner: project.owner.login,
        name: project.name,
        fullName: project.full_name,
        description: project.description,
        url: project.html_url,
        homepage: project.homepage,
        language: project.language,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        readme: project.readme,
        tags: project.tags,
      });
    });
    return parsedProjects;
  }

  /**
   * @method getProject
   * @param name a string with the name of the wanted project
   * @returns the project with the given name or null if it doesn't exist
   */
  public async getProject(name: string): Promise<CodeProject | null> {
    const allProjects = await this.projects;
    const foundProject = allProjects.find(
      (item: CodeProject) =>
        item.name.toLowerCase() === String(name).toLowerCase()
    );
    return foundProject || null;
  }

  public async getProjectByUrl(url: string): Promise<CodeProject | null> {
    const allProjects = await this.projects;
    const foundProject = allProjects.find(
      (item: CodeProject) =>
        item.url.toLowerCase() === url || item.url.toLowerCase().includes(url)
    );
    return foundProject || null;
  }
}
