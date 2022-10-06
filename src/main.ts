import fs from "fs/promises";

import * as core from "@actions/core";
import path from "path";
import YAML from "yaml";

import { getArtifactMetadata } from "./kv";
import { getParams } from "./params";

const main = async (): Promise<void> => {
  const params = getParams();

  const artifactMetadata = await getArtifactMetadata({
    accountId: params.cloudflareAccountId,
    secretToken: params.cloudflareApiToken,
    namespace: params.kvNamespaceId,
  });

  const artifactsDirPath = path.join(params.repoPath, "artifacts");

  await fs.mkdir(artifactsDirPath, { recursive: true });

  for (const metadata of artifactMetadata) {
    const markdownPath = path.join(artifactsDirPath, `${metadata.slug}.md`);

    let markdownBody = "---\n";
    markdownBody += YAML.stringify(metadata, {
      defaultKeyType: "PLAIN",
      defaultStringType: "QUOTE_DOUBLE",
      lineWidth: 0,
      indent: 2,
    });
    markdownBody += "---\n";

    await fs.writeFile(markdownPath, markdownBody);
  }
};

const run = async (): Promise<void> => {
  try {
    main();
  } catch (e) {
    if (e instanceof Error) core.setFailed(e.message);
  }
};

run();
