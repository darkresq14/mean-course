import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostsService } from 'src/app/posts.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  title = '';
  content = '';
  mode: 'Create' | 'Edit';
  private postId: string;
  post: Post;

  constructor(
    private postsService: PostsService,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'Edit';
        this.postId = paramMap.get('postId');
        this.postsService.getPost(this.postId).subscribe((data) => {
          if (data.post) {
            this.post = {
              id: data.post._id,
              title: data.post.title,
              content: data.post.content,
            };
          }
        });
      } else {
        this.mode = 'Create';
        this.postId = null;
      }
    });
  }

  onSubmit = (form: NgForm) => {
    if (form.invalid) {
      return;
    }
    this.mode === 'Create'
      ? this.postsService.addPost(form.value.title, form.value.content)
      : this.postsService.updatePost(
          this.postId,
          form.value.title,
          form.value.content
        );

    form.resetForm();
    this.router.navigate(['/']);
  };
}
