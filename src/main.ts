import fs from "fs/promises";

import * as core from "@actions/core";
import path from "path";
import YAML from "yaml";
import { ApiClient, ArtifactMetadata, slugFromUrl } from "./api";

const main = async (): Promise<void> => {
  const workspacePath = process.env.GITHUB_WORKSPACE;
  if (workspacePath === undefined) {
    throw new Error(
      "GITHUB_WORKSPACE is unset. You must check out a repository first."
    );
  }

  const pathInRepo = core.getInput("path", { required: true });
  const apiEndpoint = core.getInput("endpoint", { required: true });

  const artifactsDirPath = path.join(workspacePath, pathInRepo);

  await fs.mkdir(artifactsDirPath, { recursive: true });

  const client = new ApiClient(apiEndpoint);
  const artifacts: ReadonlyArray<ArtifactMetadata> =
    await client.listAllArtifacts();

  core.info(`Fetched ${artifacts.length} artifacts via the API`);

  for (const metadata of artifacts) {
    const markdownPath = path.join(
      artifactsDirPath,
      `${slugFromUrl(metadata.url)}.md`
    );

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
