import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CreateMessageRequest } from '../../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts',
  imports: [RouterLink, CommonModule, FormsModule], // Add FormsModule for ngModel
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})
export class Contacts {

  private http = inject(HttpClient); // Use lowercase inject
  private url = "http://localhost:3000/api/messages";

  newMessage: CreateMessageRequest = {
    sender: "",
    phone: undefined, // Use undefined instead of 0 since phone is optional
    email: "",
    subject: "",
    message: ""
  };

  isLoading = false;
  isSuccess = false;
  errorMessage = "";

  onSend() {
    if (!this.isValidMessage()) {
      this.errorMessage = "Please fill in all required fields";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";
    this.isSuccess = false;

    this.http.post(this.url, this.newMessage).subscribe({
      next: (res: any) => {
        console.log('Message sent successfully:', res);
        this.isSuccess = true;
        this.isLoading = false;
        this.resetForm();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.isSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.errorMessage = error.error?.message || "Failed to send message. Please try again.";
        this.isLoading = false;
      }
    });
  }

  private isValidMessage(): boolean {
    return !!(
      this.newMessage.sender.trim() &&
      this.newMessage.subject.trim() &&
      this.newMessage.message.trim() &&
      (this.newMessage.email?.trim() || this.newMessage.phone)
    );
  }

  private resetForm() {
    this.newMessage = {
      sender: "",
      phone: undefined,
      email: "",
      subject: "",
      message: ""
    };
  }
}