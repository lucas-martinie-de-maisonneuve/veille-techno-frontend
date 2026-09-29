import { Card } from './card.model';

export interface List {
  id: string;
  title: string;
  position: number;
  cards?: Card[];
  createdAt: string;
  updatedAt: string;
}
