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
}

export interface Chat {
  id: string;
  title: string;
  unread: boolean;
}
