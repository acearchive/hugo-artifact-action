//
// API documentation:
// https://acearchive.lgbt/docs/api/#/
//

export type PageCursor = string;

export interface ArtifactMetadata {
  url: string;
}

export interface ArtifactPageResponse {
  items: ReadonlyArray<ArtifactMetadata>;
  next_cursor: PageCursor | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Tag = any;

export interface TagListResponse {
  items: ReadonlyArray<Tag>;
}

export interface Problem {
  detail: string;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly pageSize: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.pageSize = 50;
  }

  public async listArtifacts(
    cursor?: PageCursor
  ): Promise<ArtifactPageResponse> {
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

    return (await response.json()) as ArtifactPageResponse;
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

  public async listTags(): Promise<ReadonlyArray<Tag>> {
    const queryUrl = new URL(`${this.baseUrl}/tags`);

    const response = await fetch(queryUrl);

    if (!response.ok) {
      const problem = (await response.json()) as Problem;
      throw new Error(problem.detail);
    }

    const list = (await response.json()) as TagListResponse;

    return list.items;
  }
}
