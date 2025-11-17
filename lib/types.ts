// Database entity types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  event_url: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  category_id: string;
  location_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Joined subscription data
export interface SubscriptionWithDetails extends Subscription {
  user: User;
  category: Category;
  location: Location;
}

// Event data from scraping
export interface Event {
  dateTime: string;
  title: string;
  tags: string;
  priceAge: string;
  organizers: string;
  links: string;
  dateSortable: string;
}

// API request/response types
export interface SubscribeRequest {
  email: string;
  location: string;
}

export interface SubscribeResponse {
  success: boolean;
  message: string;
}

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}



