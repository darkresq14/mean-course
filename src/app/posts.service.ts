import { Injectable } from '@angular/core';
import { Post } from './posts/post.model';
import { Subject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>('http://localhost:3000/api/posts')
      .pipe(
        map((postData) => {
          return postData.posts.map((post): Post => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
            };
          });
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPost(id: string) {
    return this.http.get<{
      message: string;
      post?: { _id: string; title: string; content: string };
    }>('http://localhost:3000/api/posts/' + id);
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    this.http
      .post<{ message: string; postId: string }>(
        'http://localhost:3000/api/posts',
        {
          title,
          content,
        }
      )
      .subscribe((responseData) => {
        console.log(responseData.message);
        this.posts.push({ id: responseData.postId, title, content });
        this.postsUpdated.next([...this.posts]);
      });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = { id, title, content };
    this.http
      .put<{ message: string }>(`http://localhost:3000/api/posts/${id}`, post)
      .subscribe((responseData) => {
        console.log(responseData.message);
        const updatedPosts = [
          ...this.posts.map((mapPost) => {
            if (mapPost.id === id) mapPost = post;
            return mapPost;
          }),
        ];
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(id: string) {
    if (!id) return;
    this.http
      .delete<{ message: string }>(`http://localhost:3000/api/posts/${id}`)
      .subscribe((responseData) => {
        console.log(responseData.message);
        const updatedPosts = this.posts.filter((post) => post.id !== id);
        this.posts = updatedPosts;
        this.postsUpdated.next(this.posts ? [...this.posts] : []);
      });
  }
}
