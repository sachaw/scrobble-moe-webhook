import { config } from 'dotenv';
import { gql, GraphQLClient } from 'graphql-request';
import multiparty from 'multiparty';

import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';

import { IplexWebhook } from './types/webhook';

config();

const app = new App();

void app
  .use(logger())
  .post("/:secret", async (req, res) => {
    const { secret } = req.params;

    const form = new multiparty.Form();

    form.parse(req, async (err, fields) => {
      if (fields.payload) {
        const payload: IplexWebhook = JSON.parse(fields.payload);
        const match = payload.Metadata.guid.match(
          /me\.sachaw\.agents\.anilist:\/\/(?<id>.*)\/[0-9]\//
        )?.groups;
        const providerMediaId = match?.id ?? "";

        if (payload.event === "media.scrobble" && providerMediaId) {
          console.log(
            `Incomming scrobble - user: ${payload.Account.id} Provider ID: ${providerMediaId} Episode: ${payload.Metadata.index}`
          );

          const graphQLClient = new GraphQLClient(process.env.GQL_URL ?? "");

          const mutation = gql`
            mutation scrobble($scrobbleWebhookInput: WebhookInput!) {
              scrobble(webhookInput: $scrobbleWebhookInput) {
                success
                reason
              }
            }
          `;
          const variables = {
            scrobbleWebhookInput: {
              secret,
              username: payload.Account.title,
              serverUUID: payload.Server.uuid,
              providerMediaId: parseInt(providerMediaId),
              episode: payload.Metadata.index,
            },
          };

          try {
            await graphQLClient.request(mutation, variables);
          } catch (e) {
            console.log(e);
          }
        }
      }
    });

    res.sendStatus(200);
  })
  .get("/", (_, res) => {
    res.sendStatus(200);
  })
  .listen(parseInt(process.env.PORT ?? "5000"), () =>
    console.log(`🚀 Server ready`)
  );
