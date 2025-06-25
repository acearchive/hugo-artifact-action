import { Tag } from "./api";

export const slugFromUrl = (url: string): string => {
  const urlPath = new URL(url).pathname;
  const pathSegments = urlPath.split("/");
  return pathSegments[pathSegments.length - 1];
};

// Convert the API response object to the shape Hugo expects in the page
// metadata.
//
// Typing this doesn't really give us much, since TypeScript doesn't actually
// validate the shape of the API response object when deserializing. We *could*
// use a schema validation library and do proper schema validation here, but
// that seems excessive since we control the API.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const artifactsApiToHugo = (artifact: any): any => ({
  id: artifact.id,
  slug: slugFromUrl(artifact.url),
  title: artifact.title,
  summary: artifact.summary,
  description: artifact.description,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files: artifact.files.map((file: any) => ({
    filename: file.filename,
    name: file.name,
    media_type: file.media_type,
    url: file.url,
    hidden: file.hidden,
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  links: artifact.links.map((link: any) => ({
    name: link.name,
    url: link.url,
  })),
  people: artifact.people,
  identities: artifact.identities,
  from_year: artifact.from_year,
  to_year: artifact.to_year,
  decades: artifact.decades,
  collections: artifact.collections,
  aliases: artifact.url_aliases.map(slugFromUrl),
});

// See comment above.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tagsApiToHugo = (tags: ReadonlyArray<Tag>): any => ({
  tags: tags.map((tag) => ({
    name: tag.name,
    kind: tag.kind,
    description: tag.description,
  })),
});
