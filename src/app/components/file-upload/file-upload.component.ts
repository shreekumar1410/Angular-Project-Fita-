import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../services/file-upload.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  selectedFile: File | null = null;
  message: string = '';
  showModal: boolean = false;
  isUploading: boolean = false;
  isCustomer: boolean = false;

  constructor(
    private fileService: FileUploadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
  }

  checkUserRole(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.isCustomer = profile.role.toLowerCase() === 'customer';
      },
      error: (err) => {
        console.log('Error fetching user profile:', err);
        this.isCustomer = false;
      }
    });
  }

  openModal() {
    this.showModal = true;
    this.selectedFile = null;
    this.message = '';
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
    this.message = '';
    this.isUploading = false;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.message = ''; 
  }

  upload() {
    if (!this.selectedFile) {
      this.message = "Please select a file first!";
      return;
    }

    this.isUploading = true;
    this.fileService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        this.message = res;
        this.isUploading = false;
        console.log(res);
        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (err) => {
        this.message = "Uploading File Failed! " + (err.error?.message || 'Unknown error');
        this.isUploading = false;
        console.log("Uploading File Failed!", err);
      }
    });
  }
}
