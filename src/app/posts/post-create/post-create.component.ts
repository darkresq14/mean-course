import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { PostsService } from 'src/app/posts.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit {
  private postId: string;
  mode: 'Create' | 'Edit';
  post: Post;
  isLoading = false;
  form: FormGroup;

  constructor(
    private postsService: PostsService,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'Edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((data) => {
          this.isLoading = false;
          if (data.post) {
            this.post = {
              id: data.post._id,
              title: data.post.title,
              content: data.post.content,
            };
            this.form.setValue({
              title: data.post.title,
              content: data.post.content,
            });
          }
        });
      } else {
        this.mode = 'Create';
        this.postId = null;
      }
    });
  }

  onSubmit = () => {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.mode === 'Create'
      ? this.postsService.addPost(
          this.form.value.title,
          this.form.value.content
        )
      : this.postsService.updatePost(
          this.postId,
          this.form.value.title,
          this.form.value.content
        );

    this.form.reset();
    this.isLoading = false;
    this.router.navigate(['/']);
  };
}
