import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Needed for ngModel

// Interface for the request body, matching your CreateUserRequest structure
interface LoginRequest {
  email: string;
  password: string;
}

// Interface for the success response
interface LoginResponse {
  id: number;
  username: string;
  email: string;
  message: string;
}

// Minimal Service to handle the API call
class UserService {
    // NOTE: In a real app, this would be a separate, injectable service
    // injected via the constructor. For simplicity here, I'll put the fetch logic.
    private apiUrl = 'http://localhost:3000/users/login'; // REPLACE with your actual backend URL

    async login(loginData: LoginRequest): Promise<LoginResponse> {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed.');
        }

        return data as LoginResponse;
    }
}

@Component({
  selector: 'app-admin-login',
  // Import CommonModule for directives like *ngIf, and FormsModule for [(ngModel)]
  imports: [RouterLink, FormsModule, CommonModule],
  standalone: true, // Assuming this is a standalone component
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss'
})
export class AdminLogin {
  // Signals for form data and state
  email = signal<string>('');
  password = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Initialize a mock service instance
  // NOTE: Inject UserService in a real application
  private userService = new UserService(); 

  constructor(private router: Router) {}

  /**
   * Handles the login process by calling the backend API.
   */
  async handleLogin(): Promise<void> {
    const emailValue = this.email();
    const passwordValue = this.password();

    // Basic client-side validation
    if (!emailValue || !passwordValue) {
      this.errorMessage.set('Please enter both email and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null); // Clear previous errors

    try {
      const loginData: LoginRequest = { email: emailValue, password: passwordValue };
      const result = await this.userService.login(loginData);

      console.log('Login successful:', result);
      // Success: Navigate to the admins page or store token
      // NOTE: In a real app, you'd store a token here.
      this.router.navigate(['/admins']);

    } catch (error: any) {
      // Handle API error
      this.errorMessage.set(error.message || 'An unexpected error occurred during login.');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}