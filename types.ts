export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  images?: string[];
  category: string;
  stock: number;
  active: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  tags?: string[];
  createdAt: number;
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'rating';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  featured: boolean;
  search: string;
}

export const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home Decor",
  "Accessories",
  "Beauty",
  "Sports"
];