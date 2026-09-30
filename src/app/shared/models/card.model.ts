export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  list: {
    id: string;
    owner?: {
      id: string;
      username: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}