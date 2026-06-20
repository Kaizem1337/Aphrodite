export type SessionType = "regular" | "pre" | "post" | "lunch" | "auction" | "custom";

export type Region = "Americas" | "Europe" | "Middle East & Africa" | "Asia-Pacific";

export type MarketSession = {
  id: string;
  name: string;
  open: string;
  close: string;
  type: SessionType;
  countsAsOpen: boolean;
};

export type Exchange = {
  id: string;
  name: string;
  acronym: string;
  country: string;
  flag: string;
  city: string;
  timezone: string;
  currency?: string;
  region: Region;
  sessions: MarketSession[];
  weekendDays: number[];
  holidays: string[];
  notes?: string;
};

export type MarketStatusKind =
  | "open"
  | "closed"
  | "lunch"
  | "pre"
  | "post";

export type SessionOverride = Partial<MarketSession> & {
  id: string;
  deleted?: boolean;
};

export type ExchangeOverrides = Record<string, SessionOverride[]>;

export type MarketOptions = {
  includeExtendedHours: boolean;
  regularOnly: boolean;
  sessionOverrides?: ExchangeOverrides;
};

export type MarketStatus = {
  kind: MarketStatusKind;
  label: string;
  session?: MarketSession;
  reason: string;
  nextChange?: {
    at: string;
    label: string;
    session?: MarketSession;
  };
};

export type TimelineBlock = {
  exchangeId: string;
  sessionId: string;
  sessionName: string;
  type: SessionType;
  countsAsOpen: boolean;
  startIso: string;
  endIso: string;
  startPercent: number;
  widthPercent: number;
  label: string;
};

export type Preferences = {
  selectedMarketIds: string[];
  favoriteMarketIds: string[];
  displayTimezone: string;
  addedTimezones: string[];
  includeExtendedHours: boolean;
  regularOnly: boolean;
  compactMode: boolean;
  sessionOverrides: ExchangeOverrides;
};
