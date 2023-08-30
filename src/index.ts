import { WebhookService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/webhook/v1/webhook_service_connect.js";
import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-node";
import { App } from "@tinyhttp/app";
import { logger } from "@tinyhttp/logger";
import { config } from "dotenv";
import multiparty from "multiparty";

import { PlexWebhook } from "./types/webhook.js";

config();

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL is not set");
}
if (!process.env.PORT) {
  throw new Error("PORT is not set");
}

const transport = createConnectTransport({
  baseUrl: new URL(process.env.RPC_URL).toString(),
  useBinaryFormat: true,
  httpVersion: "1.1",
});
const client = createPromiseClient(WebhookService, transport);

const app = new App();

void app
  .use(logger())
  .post("/:secret", async (req, res) => {
    const { secret } = req.params;

    const form = new multiparty.Form();

    form.parse(req, async (err, fields) => {
      if (fields.payload) {
        const payload: PlexWebhook = JSON.parse(fields.payload);
        if (!payload.Metadata) {
          return;
        }
        const match = payload.Metadata.guid?.match(
          /me\.sachaw\.agents\.anilist:\/\/(?<id>.*)\/[0-9]\//,
        );
        const providerMediaId = match?.groups?.id ?? "";

        if (payload.event === "media.scrobble" && providerMediaId) {
          await client
            .scrobble({
              secret,
              username: payload.Account.title,
              serverUuid: payload.Server.uuid,
              providerMediaId,
              episode: payload.Metadata.index,
            })
            .catch((e: Error) => console.error(e));
        }
      }
    });

    res.sendStatus(200);
  })
  .get("/", (_, res) => {
    res.sendStatus(200);
  })
  .listen(parseInt(process.env.PORT), () =>
    console.log(`🚀 Server ready, listening on port ${process.env.port}`),
  );
