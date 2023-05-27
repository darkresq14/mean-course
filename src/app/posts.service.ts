import { Injectable } from '@angular/core';
import { Post } from './posts/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];

  getPosts() {
    return [...this.posts];
  }
}
