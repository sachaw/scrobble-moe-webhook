import { cyan } from "@std/fmt/colors";
import { connect } from "@nats-io/transport-deno";
import { create, toBinary } from "@bufbuild/protobuf";
import { Webhook } from "@scrobble-moe/protobufs";
import type { PlexWebhook } from "./webhook.ts";

const NATS_URL = Deno.env.get("NATS_URL") || "nats://localhost:4222";
const ROUTE = new URLPattern({ pathname: "/:secret/:platform" });

export const natsConnection = await connect({
  servers: [NATS_URL],
}).then((conn) => {
  console.log(
    `Connected to NATS ${cyan(conn.info?.server_id ?? "UNK")} as client ${
      cyan(conn.info?.client_id.toString() ?? "UNK")
    }`,
  );
  return conn;
});

async function fetch(req: Request): Promise<Response> {
  const match = ROUTE.exec(req.url);
  const { platform, secret } = match?.pathname.groups ?? {};
  if (platform && secret) {
    const formdata = await req.formData();

    switch (platform) {
      case "plex": {
        const rawPayload = formdata.get("payload");
        if (!rawPayload) {
          return new Response("Payload not found", {
            status: 400,
          });
        }
        const payload = JSON.parse(rawPayload.toString()) as PlexWebhook;

        const match = payload.Metadata?.guid?.match(
          /me\.sachaw\.agents\.anilist:\/\/(?<id>[0-9]*)\/[0-9]\//,
        );

        const providerMediaId = Number.parseInt(match?.groups?.id ?? "");

        if (
          payload.event === "media.scrobble" && providerMediaId &&
          payload.Metadata?.index
        ) {
          const message = create(Webhook.WebhookPayloadSchema, {
            secret,
            username: payload.Account.title,
            serverUuid: payload.Server.uuid,
            providerMediaId,
            episode: payload.Metadata.index,
            streamingProvider: Webhook.WebhookPayload_StreamingProvider.PLEX,
          });

          await natsConnection.request(
            "moe.scrobble.webhook",
            toBinary(Webhook.WebhookPayloadSchema, message),
          );

          console.log(
            `Got scrobble event for ${providerMediaId} from ${payload.Account.title} on ${payload.Server.title}`,
          );
        }

        break;
      }
      case "jellyfin": {
        break;
      }
    }

    return new Response("OK");
  }
  return new Response("Server not found", {
    status: 404,
  });
}
export default { fetch };
