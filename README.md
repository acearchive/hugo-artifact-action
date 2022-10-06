# hugo-artifact-action

🚧 This repository is under construction. 🚧

This is a GitHub action used to build the [Ace Archive
site](https://github.com/acearchive/acearchive.lgbt) using
[Hugo](https://gohugo.io).

We use Hugo, a static site generator, to build the Ace Archive site. The way
Hugo works means that each published page on the site needs to have a
corresponding markdown file in the source. Hugo uses a text templating language
to allow you to populate the page using structured data in a YAML frontmatter
block.

This action generates a markdown file in a specified directory in the
checked-out repository for each artifact in Ace Archive. It also adds a YAML
frontmatter block to each of those markdown files containing the artifact
metadata.

This action is used by
[acearchive/artifact-submissions](https://github.com/acearchive/artifact-submissions)
to generate these markdown files in
[acearchive/hugo-artifacts](https://github.com/acearchive/hugo-artifacts). The
latter repository is then imported by
[acearchive/acearchive.lgbt](https://github.com/acearchive/acearchive.lgbt) as
a [Hugo module](https://gohugo.io/hugo-modules/) at build time.

Obviously this is a somewhat convoluted system and is pushing the boundaries of
what can sanely be done with a static site generator. Still, it allows us to
serve these pages as static assets. In the future, artifact pages on the site
may be served by edge functions instead.

Currently, this tool is implemented by directly accessing [Cloudflare Workers
KV](https://developers.cloudflare.com/workers/learning/how-kv-works/), which is
where artifact metadata is stored. Once Ace Archive has a REST API, this action
may be rewritten to use that instead.

See the [`action.yaml`](./action.yaml) for documentation of the input
parameters.
