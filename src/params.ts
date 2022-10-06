import Joi from "joi";
import * as core from "@actions/core";

export type Params = Readonly<{
  repoPath: string;
  path: string;
  cloudflareAccountId: string;
  cloudflareApiToken: string;
  kvNamespaceId: string;
}>;

const schema = Joi.object({
  repoPath: Joi.string().required().label("GITHUB_WORKSPACE"),
  path: Joi.string().uri({ relativeOnly: true }).required().label("path"),
  cloudflareAccountId: Joi.string().required().label("cloudflare_account_id"),
  cloudflareApiToken: Joi.string().required().label("cloudflare_api_token"),
  kvNamespaceId: Joi.string().required().label("kv_namespace_id"),
});

export const getParams = (): Params => {
  const cloudflareApiToken = core.getInput("cloudflare_api_token", {
    required: true,
  });

  core.setSecret(cloudflareApiToken);

  return Joi.attempt(
    {
      repoPath: process.env.GITHUB_WORKSPACE,
      path: core.getInput("path", { required: true }),
      cloudflareAccountId: core.getInput("cloudflare_account_id", {
        required: true,
      }),
      cloudflareApiToken,
      kvNamespaceId: core.getInput("kv_namespace_id", { required: true }),
    },
    schema,
    { abortEarly: false }
  );
};
