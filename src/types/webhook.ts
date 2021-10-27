export interface IplexWebhookAccount {
  id: number;
  thumb: string;
  title: string;
}

export interface IplexWebhookServer {
  title: string;
  uuid: string;
}

export interface IplexWebhookPlayer {
  local: boolean;
  publicAddress: string;
  title: string;
  uuid: string;
}

export interface IplexWebhookMetadata {
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
  Genre?: IplexWebhookGenre[];
  Director?: IplexWebhookDirector[];
  Country?: IplexWebhookCountry[];
  Role?: IplexWebhookRole[];
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

export interface IplexWebhookGenre {
  id: number;
  filter: string;
  tag: string;
  count: number;
}
export interface IplexWebhookDirector {
  id: number;
  filter: string;
  tag: string;
}

export interface IplexWebhookCountry {
  id: number;
  filter: string;
  tag: string;
  count: number;
}

export interface IplexWebhookRole {
  id: number;
  filter: string;
  tag: string;
  count?: number;
  role: string;
  thumb: string;
}

export interface IplexWebhook {
  event:
    | "media.play"
    | "media.pause"
    | "media.rate"
    | "media.resume"
    | "media.scrobble"
    | "media.stop";
  user: boolean;
  owner: boolean;
  Account: IplexWebhookAccount;
  Server: IplexWebhookServer;
  Player: IplexWebhookPlayer;
  Metadata?: IplexWebhookMetadata;
}
