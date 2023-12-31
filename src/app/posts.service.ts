import { Injectable } from '@angular/core';
import { DbPost, Post } from './posts/post.model';
import { Subject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postsCount: number }>();
  private postsUrl = environment.apiUrl + '/posts';

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; postsCount: number }>(
        this.postsUrl + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: DbPost): Post => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            postsCount: postData.postsCount,
          };
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postsCount: transformedPosts.postsCount,
        });
      });
  }

  getPost(id: string) {
    return this.http.get<{
      message: string;
      post?: DbPost;
    }>(this.postsUrl + '/' + id);
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
      .post<{ message: string; post: Post }>(this.postsUrl, postData)
      .subscribe((_) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'string') {
      postData = { id, title, content, imagePath: image, creator: null };
    } else {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image);
    }

    this.http
      .put<{ message: string; imagePath: string }>(
        this.postsUrl + `/${id}`,
        postData
      )
      .subscribe((_) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string) {
    if (!id) return;
    return this.http.delete<{ message: string }>(this.postsUrl + `/${id}`);
  }
}
