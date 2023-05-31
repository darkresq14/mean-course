import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostsService } from 'src/app/posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from 'src/utils/mime-type.validator';

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
  imagePreview: string;

  constructor(
    private postsService: PostsService,
    @Inject(ActivatedRoute) public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
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
              imagePath: data.post.imagePath,
            };
            this.form.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.imagePath,
            });
          }
        });
      } else {
        this.mode = 'Create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit = () => {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.mode === 'Create'
      ? this.postsService.addPost(
          this.form.value.title,
          this.form.value.content,
          this.form.value.image
        )
      : this.postsService.updatePost(
          this.postId,
          this.form.value.title,
          this.form.value.content,
          this.form.value.image
        );

    this.form.reset();
    this.isLoading = false;
  };
}
