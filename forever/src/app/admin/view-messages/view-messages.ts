import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MessageList } from '../../interfaces/interfaces';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './view-messages.html',
  styleUrl: './view-messages.scss'
})
export class ViewMessages implements OnInit {
  messageId!: number;

  // Using Signals for component state
  messageDetails: WritableSignal<MessageList | null> = signal(null);
  // Renamed to match the template binding for consistency and clarity
  replyMessageSignal: WritableSignal<string> = signal(''); 

  private url = 'http://localhost:3000/api/messages';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.messageId = +id;
        this.fetchMessage(this.messageId);
      } else {
        this.router.navigate(['/admins/messages']);
      }
    });
  }

  fetchMessage(id: number): void {
    this.http.get<MessageList>(`${this.url}/${id}`).subscribe({
      next: (res: MessageList) => {
        // Signal Update: Use .set() to assign the new value
        this.messageDetails.set(res);
        console.log('Message Details successfully set via Signal.');
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching message details:', err);
        // Signal Update: Set back to null on error
        this.messageDetails.set(null);
      }
    });
  }

  updateReplyStatus(isReplied: boolean): void {
    if (!this.messageId) return;

    this.http.patch(`${this.url}/reply/${this.messageId}`, {
        is_replied: isReplied ? 1 : 0
    }).subscribe({
      next: () => {
        // Signal Update: Use .update() to modify the existing signal value
        this.messageDetails.update(details => {
            if (details) {
                // Return a new object with the updated property
                return { ...details, is_replied: isReplied ? 1 : 0 };
            }
            return null;
        });

        console.log(`Message ${this.messageId} status updated via Signal.`);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating status:', err);
      }
    });
  }

  sendReply(): void {
    // Calling the signal as a function to get its value
    const replyMessage = this.replyMessageSignal();
    const details = this.messageDetails();

    if (!replyMessage || !details) {
      console.log('Please type a reply.');
      return;
    }

    console.log(`Sending reply to ${details.email || details.phone}: ${replyMessage}`);

    // Mark as replied
    this.updateReplyStatus(true);

    // Clear the reply message after sending, using .set()
    this.replyMessageSignal.set('');

    console.log('Reply sent and message marked as replied!');
  }

  goBack(): void {
    this.router.navigate(['/admins/messages']);
  }
}