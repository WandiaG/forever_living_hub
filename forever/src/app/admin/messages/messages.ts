import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageList } from '../../interfaces/interfaces';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-messages',
  standalone: true, // Assuming this is a standalone component, required for imports array
  imports: [CommonModule,  FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
})
export class Messages implements OnInit {
  messageList: MessageList[] = [];
  searchQuery: string = ''; // For the search input
  filterStatus: string = 'all'; // 'all', 'replied', 'pending'

  private url = 'http://localhost:3000/api/messages';
  constructor(
    private http: HttpClient, // HttpClient injection
    private route: ActivatedRoute, // ActivatedRoute injection (FIXED)
    private router: Router // Router injection
  ) {}

  ngOnInit(): void {
    this.getMessages();
  }

  // Method to fetch messages (can handle search/filter)
  getMessages() {
    let queryUrl = this.url;
    const params = new URLSearchParams();

    // 1. Add filter by is_replied
    if (this.filterStatus === 'replied') {
      params.set('replied', 'true');
    } else if (this.filterStatus === 'pending') {
      params.set('replied', 'false');
    }

    // 2. Add search query (assuming your backend handles only one search parameter for simplicity)
    if (this.searchQuery) {
      // Assuming search by sender. Adjust to match your backend's search logic.
      params.set('sender', this.searchQuery);
      // Note: Your backend supports sender, subject, email. For simplicity, we use sender here.
    }

    if (params.toString()) {
      queryUrl += `?${params.toString()}`;
    }

    this.http.get(queryUrl).subscribe({
      next: (res: any) => {
        this.messageList = res;
        console.log('Fetched messages:', this.messageList);
      },
      error: (err: any) => {
        console.error('Error fetching messages:', err);
        // Optionally show a user-friendly error message
      },
    });
  }

  // Corrected navigation function
  viewMessage(id: number) {
    // Use the Router service to navigate and pass the ID as a route parameter
    this.router.navigate(['/admins/viewmessage', id]);
  }

  // Track function for *ngFor optimization
  trackByMessageId(index: number, message: MessageList): number {
    return message.id;
  }

  // Placeholder for filter change (to be called from HTML)
  applyFilter(status: 'all' | 'replied' | 'pending') {
    this.filterStatus = status;
    this.getMessages();
  }
}
