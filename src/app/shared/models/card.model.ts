export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  list: { id: string };
  createdAt: string;
  updatedAt: string;
}