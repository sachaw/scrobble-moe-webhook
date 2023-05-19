import { config } from "dotenv";
import multiparty from "multiparty";
import { App } from "@tinyhttp/app";
import { createConnectTransport } from "@bufbuild/connect-node";
import { createPromiseClient } from "@bufbuild/connect";
import { WebhookService } from "@buf/scrobble-moe_protobufs.bufbuild_connect-es/moe/scrobble/webhook/v1/webhook_service_connect.js";

import { PlexWebhook } from "./types/webhook.js";

config();

const transport = createConnectTransport({
  httpVersion: "2",
  baseUrl: process.env.RPC_URL ?? "localhost:4000",
});
const client = createPromiseClient(WebhookService, transport);

const app = new App();

void app
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
          await client.scrobble({
            secret,
            username: payload.Account.title,
            serverUuid: payload.Server.uuid,
            providerMediaId: parseInt(providerMediaId),
            episode: payload.Metadata.index,
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
    console.log("🚀 Server ready"),
  );
