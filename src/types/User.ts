// Types for user information
export interface UserInfo {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  backupEmail?: string;
  country: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  phoneNo: string;

}

export interface UserInfoResponse {
  message: string;
  data: UserInfo; 
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  backupEmail?: string;
  country: string;
  city: string;
  postalCode: string;
  phoneNo: string;
  phoneNumber: string;        
}

  
  export interface UpdateUserInfoRequest {
    firstName: string
    lastName: string
    email: string
    country: string
    city: string
    postalCode: string
    phoneNo: string
  }
  

  export interface City {
    name: string;
  }
  
  export interface Country {
    iso2: string;
    iso3: string;
    country: string;
    cities: string[];
  }
  
  export interface CountriesApiResponse {
    error: boolean;
    msg: string;
    data: Country[];
  }

  // Types for the country codes API response
export interface CountryCode {
    name: string;
    code: string;
    dial_code: string;
  }
  
  export interface CountryCodesApiResponse {
    error: boolean;
    msg: string;
    data: CountryCode[];
  }
  
  
  
  