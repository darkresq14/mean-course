export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
}

export interface DbPost {
  _id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
}
