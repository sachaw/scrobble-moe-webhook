import asyncBusboy from "async-busboy";
import bodyParser from "body-parser";
import { config } from "dotenv";
import { gql, GraphQLClient } from "graphql-request";

import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";

import { IplexWebhook } from "./types/webhook";

config();

const app = new App();

void app
  .use(logger())
  .use(bodyParser.urlencoded({ extended: false }))
  .post("/:secret", async (req, res) => {
    const { secret } = req.params;
    const { fields } = await asyncBusboy(req);

    if (fields.payload) {
      console.log(fields.payload);

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
          console.log(await graphQLClient.request(mutation, variables));
        } catch (e) {
          console.log(e);
        }
      }
    }

    res.send(null);
  })
  .listen(parseInt(process.env.PORT ?? "5000"), () =>
    console.log(`🚀 Server ready`)
  );
