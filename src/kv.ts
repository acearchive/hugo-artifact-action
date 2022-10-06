import fetch from "node-fetch";

const version = 1;

export interface ArtifactMetadata {
  slug: string;
}

export const getArtifactMetadata = async ({
  accountId,
  secretToken,
  namespace,
}: {
  accountId: string;
  secretToken: string;
  namespace: string;
}): Promise<ReadonlyArray<ArtifactMetadata>> => {
  let cursor: string | undefined = undefined;

  const key = `artifacts:v${version}`;
  let requestUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespace}/values/${key}`;

  if (cursor !== undefined) {
    requestUrl += `&cursor=${cursor}`;
  }

  const response = await fetch(requestUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretToken}`,
    },
  });

  const rawResponseJson = await response.json();

  return rawResponseJson as ReadonlyArray<ArtifactMetadata>;
};
