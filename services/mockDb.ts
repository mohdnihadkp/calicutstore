import { Product } from '../types';

const STORAGE_KEY = 'calicut_store_products';
const AUTH_KEY = 'calicut_store_auth';
const OWNER_SECRET = 'Bismillah';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Wallet',
    description: 'Handcrafted genuine leather wallet with RFID protection.',
    price: 1499,
    salePrice: 999,
    discountPercent: 33,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    category: 'Accessories',
    stock: 50,
    active: true,
    featured: true,
    rating: 4.8,
    reviewCount: 124,
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Immersive sound experience with 30-hour battery life.',
    price: 5999,
    salePrice: 4499,
    discountPercent: 25,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    category: 'Electronics',
    stock: 15,
    active: true,
    featured: true,
    rating: 4.9,
    reviewCount: 89,
    createdAt: Date.now() - 100000
  },
  {
    id: '3',
    name: 'Minimalist Wall Clock',
    description: 'Modern design silent sweep quartz movement wall clock.',
    price: 1299,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    category: 'Home Decor',
    stock: 30,
    active: true,
    featured: false,
    rating: 4.5,
    reviewCount: 45,
    createdAt: Date.now() - 200000
  },
  {
    id: '4',
    name: 'Classic Running Shoes',
    description: 'Lightweight and breathable mesh running shoes for daily use.',
    price: 2999,
    salePrice: 2499,
    discountPercent: 16,
    imageUrl: 'https://picsum.photos/400/400?random=4',
    category: 'Fashion',
    stock: 100,
    active: true,
    featured: true,
    rating: 4.7,
    reviewCount: 210,
    createdAt: Date.now() - 300000
  },
  {
    id: '5',
    name: 'Smart Fitness Band',
    description: 'Track your steps, heart rate, and sleep quality.',
    price: 1999,
    salePrice: 1499,
    discountPercent: 25,
    imageUrl: 'https://picsum.photos/400/400?random=5',
    category: 'Electronics',
    stock: 0,
    active: true,
    featured: false,
    rating: 4.6,
    reviewCount: 150,
    createdAt: Date.now() - 400000
  },
  {
    id: '6',
    name: 'Organic Face Serum',
    description: 'Vitamin C enriched serum for glowing skin.',
    price: 899,
    imageUrl: 'https://picsum.photos/400/400?random=6',
    category: 'Beauty',
    stock: 45,
    active: true,
    featured: true,
    rating: 4.9,
    reviewCount: 320,
    createdAt: Date.now() - 500000
  }
];

export const initStore = () => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  }
};

export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const saveProduct = (product: Product): Product => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  // Calculate discount if sale price exists
  if (product.salePrice && product.price > 0) {
    product.discountPercent = Math.round(((product.price - product.salePrice) / product.price) * 100);
  } else {
    product.discountPercent = 0;
  }

  if (index >= 0) {
    products[index] = { ...product, active: Boolean(product.active), featured: Boolean(product.featured) };
  } else {
    products.push({ ...product, createdAt: Date.now(), active: Boolean(product.active), featured: Boolean(product.featured) });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  return product;
};

export const deleteProduct = (id: string): void => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const loginOwner = (code: string): boolean => {
  if (code === OWNER_SECRET) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const checkAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
};

export const logoutOwner = (): void => {
  localStorage.removeItem(AUTH_KEY);
};