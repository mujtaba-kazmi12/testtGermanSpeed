// Get Profile Response Type
export interface GetProfileResponse {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
  }
  // Update Profile Request Body
  export interface UpdateProfileRequestBody {
    firstName: string;
    lastName: string;
    country: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword:string;
  }
  // Update Profile Response
  export interface UpdateProfileResponse {
    message: string;
    status: any;
    data: any;
  }
  