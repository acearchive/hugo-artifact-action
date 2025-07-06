import fs from "fs/promises";

import * as core from "@actions/core";
import path from "path";
import YAML from "yaml";
import { ApiClient, ArtifactMetadata, Tag } from "./api";
import { slugFromUrl, artifactsApiToHugo, tagsApiToHugo } from "./hugo";

const main = async (): Promise<void> => {
  const workspacePath = process.env.GITHUB_WORKSPACE;
  if (workspacePath === undefined) {
    throw new Error(
      "GITHUB_WORKSPACE is unset. You must check out a repository first."
    );
  }

  const apiEndpoint = core.getInput("endpoint", { required: true });

  const artifactsMarkdownDirPath = path.join(workspacePath, "artifacts");
  const metadataJsonFilePath = path.join(workspacePath, "metadata.json");
  const artifactsJsonFilePath = path.join(workspacePath, "artifacts.json");

  // We delete all existing artifact files before we regenerate them so that
  // artifacts which have been deleted from the database are also removed from
  // the static site.
  await fs.rm(artifactsMarkdownDirPath, { force: true, recursive: true });

  await fs.mkdir(artifactsMarkdownDirPath, { recursive: true });

  const client = new ApiClient(apiEndpoint);

  const artifacts: ReadonlyArray<ArtifactMetadata> =
    await client.listAllArtifacts();

  core.info(`Fetched ${artifacts.length} artifacts via the API`);

  const tags: ReadonlyArray<Tag> = await client.listTags();

  core.info(`Fetched ${tags.length} tags via the API`);

  const metadataBody = tagsApiToHugo(tags);
  await fs.writeFile(metadataJsonFilePath, JSON.stringify(metadataBody));

  // Write the artifacts to a JSON file. While the markdown files with the YAML
  // frontmatter are used for the artifact pages in the Hugo site, this JSON
  // file is used to build the search index.
  await fs.writeFile(artifactsJsonFilePath, JSON.stringify(artifacts));

  for (const metadata of artifacts) {
    const markdownPath = path.join(
      artifactsMarkdownDirPath,
      `${slugFromUrl(metadata.url)}.md`
    );

    let markdownBody = "---\n";
    markdownBody += YAML.stringify(artifactsApiToHugo(metadata), {
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
