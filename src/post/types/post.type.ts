export type FunPost = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  userId: number;
  title: string;
  description: string;
  imageUrl: null | string;
};
