import asyncBusboy from 'async-busboy';
import { config } from 'dotenv';
import { gql, GraphQLClient } from 'graphql-request';

import { VercelRequest, VercelResponse } from '@vercel/node';

import { IplexWebhook } from '../types/webhook';

export default async function (req: VercelRequest, res: VercelResponse) {
  config();
  const { secret } = req.query;

  if (req.method === "POST") {
    const { fields } = await asyncBusboy(req);
    if (fields.payload) {
      const payload: IplexWebhook = JSON.parse(fields.payload);
      const providerMediaId = payload.Metadata.guid.match(
        /me\.sachaw\.agents\.anilist:\/\/(?<id>.*)\/[0-9]\//
      ).groups.id;

      if (payload.event === "media.scrobble" && providerMediaId) {
        console.log(
          `Incomming scrobble - user: ${payload.Account.id} Provider ID: ${providerMediaId}`
        );

        const graphQLClient = new GraphQLClient(process.env.GQL_URL);

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
  }

  res.send(null);
}
