export type User = {
  id: number;
  email: string;
  username: string;
  created_at: string;
};

export type LoginResponse = {
  message: string;
  user: User;
};

export type SignUpInput = {
  email: string;
  username: string;
  password: string;
};

export type ZoneType = "public" | "private";

export type HostedZone = {
  id: number;
  name: string;
  comment: string;
  zone_type: ZoneType;
  private_zone: boolean;
  tags: string[];
  created_at: string;
  record_count: number;
};

export type CreateZoneInput = {
  name: string;
  comment?: string;
  zone_type?: ZoneType;
  tags?: string[];
};

export type UpdateZoneInput = Partial<CreateZoneInput>;

export type RecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "TXT"
  | "MX"
  | "NS"
  | "PTR"
  | "SRV"
  | "CAA";

export type RecordSet = {
  id: number;
  zone_id: number;
  name: string;
  record_type: RecordType;
  ttl: number;
  values: string[];
  routing_policy: string;
  alias_target: string | null;
  health_check_id: string | null;
};

export type CreateRecordInput = {
  name: string;
  record_type: RecordType;
  ttl?: number;
  values: string[];
  routing_policy?: string;
  alias_target?: string | null;
  health_check_id?: string | null;
};

export type UpdateRecordInput = Partial<CreateRecordInput>;

export type RecordSetQuery = {
  search?: string;
  record_type?: RecordType;
  page?: number;
  page_size?: number;
};
