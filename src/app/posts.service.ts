import { Injectable } from '@angular/core';
import { DbPost, Post } from './posts/post.model';
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
          return postData.posts.map((post: DbPost): Post => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
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
      post?: { _id: string; title: string; content: string; imagePath: string };
    }>('http://localhost:3000/api/posts/' + id);
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((responseData) => {
        console.log(responseData.message);
        this.posts.push(responseData.post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'string') {
      postData = { id, title, content, imagePath: image };
    } else {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image);
    }

    this.http
      .put<{ message: string; imagePath: string }>(
        `http://localhost:3000/api/posts/${id}`,
        postData
      )
      .subscribe((responseData) => {
        console.log(responseData.message);
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex((p) => p.id === id);
        const post = { id, title, content, imagePath: responseData.imagePath };
        updatedPosts[oldPostIndex] = post;
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
