//
// API documentation:
// https://acearchive.lgbt/docs/api/#/
//

export type PageCursor = string;

export interface ArtifactMetadata {
  url: string;
}

export interface PageResponse {
  items: ReadonlyArray<ArtifactMetadata>;
  next_cursor: PageCursor | undefined;
}

export interface Problem {
  detail: string;
}

export const slugFromUrl = (url: string): string => {
  const urlPath = new URL(url).pathname;
  const pathSegments = urlPath.split("/");
  return pathSegments[pathSegments.length - 1];
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly pageSize: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.pageSize = 50;
  }

  public async listArtifacts(cursor?: PageCursor): Promise<PageResponse> {
    const queryUrl = new URL(`${this.baseUrl}/artifacts`);
    queryUrl.searchParams.append("limit", this.pageSize.toString());

    if (cursor !== undefined) {
      queryUrl.searchParams.append("cursor", cursor);
    }

    const response = await fetch(queryUrl);

    if (!response.ok) {
      const problem = (await response.json()) as Problem;
      throw new Error(problem.detail);
    }

    return (await response.json()) as PageResponse;
  }

  public async listAllArtifacts(): Promise<ReadonlyArray<ArtifactMetadata>> {
    const items: Array<ArtifactMetadata> = [];
    let cursor: PageCursor | undefined;

    while (true) {
      const page = await this.listArtifacts(cursor);

      items.push(...page.items);

      if (page.next_cursor === undefined) {
        break;
      }

      cursor = page.next_cursor;
    }

    return items;
  }
}
