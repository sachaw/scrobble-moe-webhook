export interface PlexWebhookAccount {
  id: number;
  thumb: string;
  title: string;
}

export interface PlexWebhookServer {
  title: string;
  uuid: string;
}

export interface PlexWebhookPlayer {
  local: boolean;
  publicAddress: string;
  title: string;
  uuid: string;
}

export interface PlexWebhookMetadata {
  librarySectionType: string;
  ratingKey: string;
  key: string;
  guid?: string;
  studio?: string;
  type: string;
  title: string;
  librarySectionTitle: string;
  librarySectionID: number;
  librarySectionKey: string;
  summary: string;
  rating?: number;
  year?: number;
  thumb: string;
  art?: string;
  originallyAvailableAt?: string;
  addedAt: number;
  updatedAt: number;
  Genre?: PlexWebhookGenre[];
  Director?: PlexWebhookDirector[];
  Country?: PlexWebhookCountry[];
  Role?: PlexWebhookRole[];
  skipParent?: boolean;
  parentRatingKey?: string;
  grandparentRatingKey?: string;
  parentGuid?: string;
  grandparentGuid?: string;
  parentStudio?: string;
  grandparentKey?: string;
  parentKey?: string;
  grandparentTitle?: string;
  parentTitle?: string;
  originalTitle?: string;
  index?: number;
  parentIndex?: number;
  viewOffset?: number;
  viewCount?: number;
  skipCount?: number;
  lastViewedAt?: number;
  parentYear?: number;
  ratingCount?: number;
  parentThumb?: string;
  grandparentThumb?: string;
  grandparentArt?: string;
}

export interface PlexWebhookGenre {
  id: number;
  filter: string;
  tag: string;
  count: number;
}
export interface PlexWebhookDirector {
  id: number;
  filter: string;
  tag: string;
}

export interface PlexWebhookCountry {
  id: number;
  filter: string;
  tag: string;
  count: number;
}

export interface PlexWebhookRole {
  id: number;
  filter: string;
  tag: string;
  count?: number;
  role: string;
  thumb: string;
}

export interface PlexWebhook {
  event:
    | "media.play"
    | "media.pause"
    | "media.rate"
    | "media.resume"
    | "media.scrobble"
    | "media.stop";
  user: boolean;
  owner: boolean;
  Account: PlexWebhookAccount;
  Server: PlexWebhookServer;
  Player: PlexWebhookPlayer;
  Metadata?: PlexWebhookMetadata;
}
