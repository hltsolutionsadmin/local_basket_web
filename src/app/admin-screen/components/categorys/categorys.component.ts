import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../service/admin.service';
import { AddCategoryComponent } from './add-category/add-category.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';
import { finalize } from 'rxjs';
import { TokenService } from '../../../core/service/token.service';

interface Media {
  mediaType: string;
  url: string;
}

interface Category {
  id: number;
  name: string;
  media: Media[];
}

@Component({
  selector: 'app-categorys',
  standalone: false,
  templateUrl: './categorys.component.html',
  styleUrl: './categorys.component.scss'
})
export class CategorysComponent implements OnInit {
 categories: Category[] = [];
  placeholderImage = 'assets/images/noImage.webp';
  private service = inject(AdminService);
  private dialog = inject(MatDialog);
  tokenService = inject(TokenService);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.tokenService.show();
    this.service.getCategories().pipe(
      finalize(() => {
        this.tokenService.hide();
      })
    ).subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (error) => {
        this.tokenService.hide();
        console.error('Error fetching categories:', error);
      }
    });
  }

  getCategoryImage(category: Category): string {
    return category.media.length > 0 ? category.media[0].url : this.placeholderImage;
  }

  openAddCategoryDialog(): void {
    this.tokenService.show();
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '400px'
    });
         this.tokenService.hide();
    dialogRef.afterClosed().pipe(
      finalize(() => {
        this.tokenService.hide();
      })
    ).subscribe(result => {
      if (result) {
        const formData = new FormData();
        formData.append('name', result.name);
        if (result.mediaFiles) {
          formData.append('mediaFiles', result.mediaFiles);
        }
        this.tokenService.show();
        this.service.createCategory(formData).pipe(
          finalize(() => {
            this.tokenService.hide();
          })
        ).subscribe({
          next: () => {
            this.loadCategories(); // Refresh categories
          },
          error: (error) => {
            this.tokenService.hide();
            console.error('Error creating category:', error);
          }
        });
      }
    });
  }

  openDeleteConfirmDialog(category: Category): void {
    this.tokenService.show();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Category',
        message: `Are you sure you want to delete the category "${category.name}" (ID: ${category.id})?`
      }
    });
     this.tokenService.hide();
    dialogRef.afterClosed().pipe(
      finalize(() => {
        this.tokenService.hide();
      })
    ).subscribe(result => {
      if (result) {
        this.service.deleteCategory(category.id).subscribe({
          next: () => {
            this.loadCategories(); // Refresh categories
          },
          error: (error) => {
            this.tokenService.hide();
            console.error('Error deleting category:', error);
          }
        });
      }
    });
  }
}
