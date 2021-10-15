import { config } from 'dotenv';
import { gql, GraphQLClient } from 'graphql-request';
import multiparty from 'multiparty';

import { Logtail } from '@logtail/node';
import { LogLevel } from '@logtail/types';
import { App } from '@tinyhttp/app';

import { IplexWebhook } from './types/webhook';

config();

const app = new App();

const logger = new Logtail(process.env.LOGTAIL_TOKEN ?? "");

void app
  .post("/:secret", async (req, res) => {
    const { secret } = req.params;

    const form = new multiparty.Form();

    form.parse(req, async (err, fields) => {
      if (fields.payload) {
        const payload: IplexWebhook = JSON.parse(fields.payload);
        const match = payload.Metadata.guid?.match(
          /me\.sachaw\.agents\.anilist:\/\/(?<id>.*)\/[0-9]\//
        );
        const providerMediaId = match?.groups?.id ?? "";

        logger.log(`Incomming webhook`, LogLevel.Debug, {
          event: payload.event,
          providerMediaId,
          episode: payload.Metadata.index?.toString() ?? "",
          user: payload.Account.id,
          username: payload.Account.title,
          owner: payload.owner,
        });

        if (payload.event === "media.scrobble" && providerMediaId) {
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

          await graphQLClient.request(mutation, variables).catch((e) => {
            logger.log(e, LogLevel.Error, {
              event: payload.event,
              providerMediaId,
              episode: payload.Metadata.index?.toString() ?? "",
              user: payload.Account.id,
              username: payload.Account.title,
              owner: payload.owner,
            });
          });
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
