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
      );

      if (payload.event === "media.scrobble" && providerMediaId.groups.id) {
        const graphQLClient = new GraphQLClient(process.env.FORWARD_URL);

        const mutation = gql`
          mutation scrobble($scrobbleWebhookInput: WebhookInput!) {
            scrobble(webhookInput: $scrobbleWebhookInput)
          }
        `;
        const variables = {
          scrobbleWebhookInput: {
            secret,
            plexId: payload.Account.id,
            serverUUID: payload.Server.uuid,
            providerMediaId: providerMediaId.groups.id,
            episode: payload.Metadata.index,
          },
        };
        try {
          await graphQLClient.request(mutation, variables);
        } catch (_) {}
      }
    }
  }

  res.send(null);
}
