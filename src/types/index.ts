export interface GroundingSource {
  uri: string;
  title: string;
}

interface Part {
  text: string;
}

export interface Message {
  role: "user" | "model";
  parts: Part[];
  sources?: GroundingSource[];
}

export interface Chat {
  id: string;
  title: string;
  unread: boolean;
}
