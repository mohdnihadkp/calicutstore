import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, ArrowRight, Package, Star, TrendingUp, 
  Shield, Truck, Heart, Search, Award, Filter, Plus, Edit, Trash2, 
  CheckCircle2, LogOut, ChevronDown, Facebook, Instagram, Twitter
} from 'lucide-react';
import { Product, SortOption, FilterState, CATEGORIES } from './types';
import { initStore, getProducts, getProductById, saveProduct, deleteProduct, loginOwner, checkAuth, logoutOwner } from './services/mockDb';

// --- SHARED COMPONENTS ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow",
    };
    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8 rounded-md text-lg",
    };
    
    return (
      <button 
        ref={ref} 
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`} 
        {...props} 
      />
    );
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    {...props}
  />
));
Input.displayName = "Input";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className || ''}`}>
      {children}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate();

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hello CALICUT STORE, I would like to order: ${product.name} with price ₹${product.salePrice || product.price}`;
    window.open(`https://wa.me/919846750898?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div 
      className="group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md cursor-pointer h-full flex flex-col overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl || `https://picsum.photos/400?random=${product.id}`} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {product.discountPercent && product.discountPercent > 0 ? (
          <Badge variant="destructive" className="absolute top-2 left-2">
            {product.discountPercent}% OFF
          </Badge>
        ) : null}
        
        {onToggleWishlist && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 transition-colors z-10"
          >
            <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
          </button>
        )}
        
        {!product.stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <div className="flex items-center text-amber-500 text-xs font-medium">
            <Star size={12} className="fill-current mr-1" />
            {product.rating} ({product.reviewCount})
          </div>
        </div>
        <h3 className="font-serif font-semibold text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold">₹{product.salePrice || product.price}</span>
            {product.salePrice && (
              <span className="text-sm text-muted-foreground line-through">₹{product.price}</span>
            )}
          </div>
          <Button 
            className="w-full gap-2" 
            variant="primary" 
            onClick={handleWhatsAppOrder}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={16} />
            {product.stock > 0 ? "Order via WhatsApp" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-serif font-bold text-xl group-hover:bg-gray-800 transition-colors">C</div>
          <span className="font-serif font-bold text-xl tracking-tight">CALICUT STORE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link to="/" className="hover:text-primary/70 transition-colors">Home</Link>
          <Link to="/products" className="hover:text-primary/70 transition-colors">All Products</Link>
          <Link to="/owner" className="hover:text-primary/70 transition-colors">Owner Panel</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/products" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingCart size={20} />
          </Link>
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-[300px] bg-white p-6 shadow-xl animate-[slideIn_0.3s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-serif font-bold text-lg">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex flex-col gap-6 text-lg font-medium">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link>
              <Link to="/owner" onClick={() => setIsMobileMenuOpen(false)}>Owner Panel</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-50 border-t pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-serif font-bold">C</div>
            <span className="font-serif font-bold text-xl">CALICUT STORE</span>
          </div>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Premium quality products delivered directly to your doorstep. We prioritize customer satisfaction and authentic products.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white rounded-full border hover:border-black transition-colors"><Facebook size={18} /></a>
            <a href="#" className="p-2 bg-white rounded-full border hover:border-black transition-colors"><Instagram size={18} /></a>
            <a href="#" className="p-2 bg-white rounded-full border hover:border-black transition-colors"><Twitter size={18} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-black transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-black transition-colors">All Products</Link></li>
            <li><Link to="/products?featured=true" className="hover:text-black transition-colors">Featured Items</Link></li>
            <li><Link to="/owner" className="hover:text-black transition-colors">Owner Panel</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-6">Contact Us</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              WhatsApp: +91 98467 50898
            </li>
            <li>Email: support@calicutstore.com</li>
            <li>24/7 Customer Support</li>
          </ul>
        </div>
      </div>
      
      <div className="border-t pt-8 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Calicut Store. All rights reserved.</p>
        <p>Quality products, direct to you.</p>
      </div>
    </div>
  </footer>
);

// --- PAGES ---

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const all = getProducts();
    setFeaturedProducts(all.filter(p => p.featured && p.active).slice(0, 4));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Discover Premium Quality
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
              Explore our curated collection of exclusive products. Shop with confidence and order directly via WhatsApp for the best experience.
            </p>
            <Link to="/products">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 border-none gap-2">
                Explore Collection <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10">
            {[
              { title: "Quality Guaranteed", icon: Award },
              { title: "Fast Delivery", icon: Truck },
              { title: "Customer Love", icon: Heart },
              { title: "24/7 Support", icon: Shield }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm md:text-base font-medium text-gray-300">
                <feature.icon className="text-white" size={20} />
                {feature.title}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Products", value: "500+", icon: Package },
              { label: "Happy Customers", value: "10K+", icon: TrendingUp },
              { label: "Average Rating", value: "4.9", icon: Star },
              { label: "Support", value: "24/7", icon: Shield },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors group cursor-default">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="text-primary" size={24} />
                </div>
                <div className="text-3xl font-bold font-serif mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                <Award size={18} /> Featured Collection
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Trending Products</h2>
            </div>
            <Link to="/products" className="mt-4 md:mt-0 text-sm font-semibold border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
              View All Products
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Browse through our carefully categorized collection to find exactly what you need.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="group flex flex-col items-center p-6 border rounded-lg hover:border-black transition-colors"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-white transition-colors">
                  <Package size={24} />
                </div>
                <h3 className="font-medium text-center">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="px-4 py-4">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">100% Authentic</h3>
              <p className="text-gray-400 text-sm">Every product is verified for quality and authenticity before shipping.</p>
            </div>
            <div className="px-4 py-4">
              <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
              <p className="text-gray-400 text-sm">We ensure your order reaches you as quickly as possible.</p>
            </div>
            <div className="px-4 py-4">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">Customer First</h3>
              <p className="text-gray-400 text-sm">Your satisfaction is our priority. We are here to help 24/7.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Filters state
  const queryParams = new URLSearchParams(location.search);
  const [filters, setFilters] = useState<FilterState>({
    category: queryParams.get('category') || '',
    minPrice: 0,
    maxPrice: 100000,
    inStock: false,
    featured: queryParams.get('featured') === 'true',
    search: ''
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  useEffect(() => {
    const all = getProducts();
    setProducts(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = products.filter(p => p.active);

    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (filters.featured) {
      result = result.filter(p => p.featured);
    }
    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
    }
    result = result.filter(p => {
      const price = p.salePrice || p.price;
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    setFilteredProducts(result);
  }, [products, filters]);

  // Update filters when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters(prev => ({
      ...prev,
      category: params.get('category') || '',
      featured: params.get('featured') === 'true'
    }));
  }, [location.search]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">All Products</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search products..." 
                className="pl-10" 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <select 
                className="h-10 px-3 rounded-md border text-sm bg-background focus:ring-2 focus:ring-ring"
                value={filters.category}
                onChange={(e) => {
                  const newParams = new URLSearchParams(location.search);
                  if (e.target.value) newParams.set('category', e.target.value);
                  else newParams.delete('category');
                  navigate(`/products?${newParams.toString()}`);
                }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <Button 
                variant={filters.inStock ? "primary" : "outline"} 
                onClick={() => setFilters(prev => ({...prev, inStock: !prev.inStock}))}
                size="sm"
                className="whitespace-nowrap"
              >
                In Stock Only
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-lg p-4 h-80 animate-pulse">
                <div className="bg-gray-200 h-48 w-full rounded-md mb-4"></div>
                <div className="bg-gray-200 h-4 w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
            <Button onClick={() => {
              setFilters({
                category: '',
                minPrice: 0,
                maxPrice: 100000,
                inStock: false,
                featured: false,
                search: ''
              });
              navigate('/products');
            }}>Clear All Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const p = getProductById(id);
      setProduct(p);
    }
    setLoading(false);
  }, [id]);

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const message = `Hello CALICUT STORE, I would like to order: ${product.name} with price ₹${product.salePrice || product.price}`;
    window.open(`https://wa.me/919846750898?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  if (!product) return <div className="min-h-screen pt-32 text-center">Product not found.</div>;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {/* Additional images placeholder */}
            <div className="grid grid-cols-4 gap-4">
              {[product.imageUrl, ...(product.images || [])].slice(0, 4).map((img, i) => (
                <div key={i} className="aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer border hover:border-black">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
              <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-amber-500">
                  <Star className="fill-current" size={20} />
                  <span className="ml-1 font-bold">{product.rating}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-muted-foreground">{product.reviewCount} Reviews</span>
                <span className="text-gray-300">|</span>
                <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-bold">₹{product.salePrice || product.price}</span>
                {product.salePrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{product.price}</span>
                    <Badge variant="destructive">{product.discountPercent}% OFF</Badge>
                  </>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                {product.description || "No description available for this product."}
              </p>

              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto min-w-[300px] gap-2 text-lg h-14" 
                  onClick={handleWhatsAppOrder}
                  disabled={!product.stock}
                >
                  <ShoppingCart />
                  Order via WhatsApp
                </Button>
                <p className="text-sm text-muted-foreground text-center md:text-left">
                  <Shield size={14} className="inline mr-1" />
                  Secure checkout via WhatsApp • Fast Delivery
                </p>
              </div>
            </div>

            <div className="mt-auto border-t pt-8">
              <h3 className="font-bold mb-4">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500 block mb-1">SKU</span>
                  <span className="font-medium">CAL-{product.id}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500 block mb-1">Stock Status</span>
                  <span className="font-medium">{product.stock} units left</span>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500 block mb-1">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="text-gray-500 block mb-1">Authenticity</span>
                  <span className="font-medium">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (checkAuth()) {
      setIsAuthenticated(true);
      refreshProducts();
    }
  }, []);

  const refreshProducts = () => {
    setProducts(getProducts());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginOwner(secretCode)) {
      setIsAuthenticated(true);
      refreshProducts();
      setError('');
    } else {
      setError('Invalid Secret Code');
    }
  };

  const handleLogout = () => {
    logoutOwner();
    setIsAuthenticated(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const p = currentProduct as Product;
    
    // Validation
    if (!p.name || !p.price) {
      alert("Name and Price are required");
      return;
    }

    const toSave: Product = {
      ...p,
      id: p.id || crypto.randomUUID(),
      stock: Number(p.stock) || 0,
      price: Number(p.price) || 0,
      salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      createdAt: p.createdAt || Date.now()
    };
    
    saveProduct(toSave);
    refreshProducts();
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      refreshProducts();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-20">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-serif font-bold mb-6 text-center">Owner Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Secret Code</label>
              <Input 
                type="password" 
                value={secretCode} 
                onChange={(e) => setSecretCode(e.target.value)} 
                placeholder="Enter secret code..."
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Access Panel</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Owner Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleLogout}><LogOut size={16} className="mr-2" /> Logout</Button>
            {view === 'list' && (
              <Button onClick={() => { setCurrentProduct({ active: true, featured: false, category: 'Electronics' }); setView('create'); }}>
                <Plus size={16} className="mr-2" /> Add Product
              </Button>
            )}
            {view !== 'list' && (
              <Button variant="secondary" onClick={() => setView('list')}>Cancel</Button>
            )}
          </div>
        </div>

        {view === 'list' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-4 font-bold">Name</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{p.name}</div>
                        {p.featured && <Badge variant="secondary" className="mt-1">Featured</Badge>}
                      </td>
                      <td className="p-4">₹{p.salePrice || p.price}</td>
                      <td className="p-4">{p.stock}</td>
                      <td className="p-4">{p.category}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${p.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => { setCurrentProduct(p); setView('edit'); }}>
                          <Edit size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No products found. Add one!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{view === 'create' ? 'Create Product' : 'Edit Product'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name</label>
                  <Input 
                    value={currentProduct.name || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={currentProduct.category || ''}
                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (Original)</label>
                  <Input 
                    type="number" 
                    value={currentProduct.price || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sale Price (Optional)</label>
                  <Input 
                    type="number" 
                    value={currentProduct.salePrice || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, salePrice: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Quantity</label>
                  <Input 
                    type="number" 
                    value={currentProduct.stock || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input 
                    value={currentProduct.imageUrl || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})} 
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentProduct.description || ''}
                  onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={currentProduct.active || false} 
                    onChange={e => setCurrentProduct({...currentProduct, active: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={currentProduct.featured || false} 
                    onChange={e => setCurrentProduct({...currentProduct, featured: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => setView('list')}>Cancel</Button>
                <Button type="submit">Save Product</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// --- APP LAYOUT ---

const App = () => {
  useEffect(() => {
    initStore();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans text-gray-900 bg-white">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/owner" element={<OwnerPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;