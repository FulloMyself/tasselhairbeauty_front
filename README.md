# Tassel Hair & Beauty Studio - Frontend

A modern, responsive React SPA for Tassel Hair & Beauty Studio featuring customer booking, product shopping, and staff management portals.

## Features

🎨 **Modern UI/UX**
- Premium design system matching Tassel branding
- Mobile-first responsive design
- Smooth animations and transitions
- Accessibility-focused (WCAG 2.1 AA)

🛍️ **Customer Portal**
- Browse and search products
- View and book services
- Shopping cart and checkout
- Order history and tracking
- Service booking history
- Customer profile management

👥 **Staff Portal**
- Performance dashboard
- View upcoming bookings
- Leave request management
- Payroll viewing

🔐 **Admin Portal**
- User management
- Product/service management
- Booking management
- Analytics and reporting
- Payroll management
- Leave approval

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Variables
- **Form Handling**: React Hook Form
- **Validation**: Yup/Zod
- **Payment**: PayFast integration

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── auth/             # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── customer/         # Customer portal components
│   │   │   ├── ProductCatalog.jsx
│   │   │   ├── ServiceBrowse.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── Profile.jsx
│   │   ├── staff/            # Staff portal components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Schedule.jsx
│   │   │   └── LeaveRequest.jsx
│   │   └── admin/            # Admin portal components
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx
│   │       └── ProductManagement.jsx
│   ├── pages/                # Page components
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NotFound.jsx
│   │   └── Unauthorized.jsx
│   ├── styles/               # Global CSS
│   │   ├── global.css        # Global styles
│   │   ├── variables.css     # CSS variables
│   │   ├── components.css    # Component styles
│   │   └── responsive.css    # Media queries
│   ├── utils/                # Utility functions
│   │   ├── api.js            # Axios instance
│   │   ├── auth.js           # Auth utilities
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── context/              # React context
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── UserContext.jsx
│   ├── App.jsx               # Root component
│   ├── index.jsx             # Entry point
│   └── .env.example
├── public/                   # Static files
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
├── vite.config.js
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js v14.0.0 or higher
- npm v6.0.0 or higher

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/your-username/tassel-hair-beauty.git
cd tassel-hair-beauty/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Configure environment variables (edit .env)
nano .env

# 5. Start development server
npm run dev
```

## Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=Tassel Hair & Beauty Studio
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_LIVE_CHAT=false

# External Services
VITE_PAYFAST_MERCHANT_ID=10000100
VITE_PAYFAST_RETURN_URL=http://localhost:5173/checkout/success
VITE_PAYFAST_CANCEL_URL=http://localhost:5173/checkout/cancel
```

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# The app will be available at http://localhost:5173
```

### Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code (optional)
npm run format
```

## Design System

### Color Palette

```css
--gold: #9a8060           /* Primary brand color */
--gold-light: #c4a97d     /* Lighter gold */
--deep: #1a1a18           /* Deep dark */
--cream: #faf8f5          /* Cream background */
--soft: #f0e8e2           /* Soft background */
--rose: #c4968a           /* Accent rose */
--text: #3a3530           /* Primary text */
--muted: #8a7e78          /* Muted text */
```

### Typography

```css
Headings: Cormorant Garamond (serif)
Body: Jost (sans-serif)

Font Sizes:
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px
--font-size-3xl: 32px
--font-size-4xl: 40px
--font-size-5xl: 48px
```

### Spacing Scale

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

## Component Library

### Common Components

```jsx
// Buttons
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-outline">Outline</button>

// Cards
<div className="card">
  <div className="card-header">Title</div>
  <div className="card-body">Content</div>
  <div className="card-footer">Footer</div>
</div>

// Alerts
<div className="alert alert-success">Success message</div>
<div className="alert alert-error">Error message</div>

// Forms
<div className="form-group">
  <label className="form-label">Label</label>
  <input type="text" className="form-input" />
</div>
```

See `src/styles/components.css` for full component documentation.

## State Management

### AuthContext

```jsx
const { user, token, isAuthenticated, login, logout, updateUser } = useContext(AuthContext);
```

### CartContext

```jsx
const { items, addItem, removeItem, updateQuantity, getTotalPrice } = useContext(CartContext);
```

### UserContext

```jsx
const { userProfile, updateProfile, clearProfile } = useContext(UserContext);
```

## API Integration

### Using the API

```jsx
import api from '@utils/api';

// GET request
const response = await api.get('/products');

// POST request
const response = await api.post('/orders', { items: [...] });

// PUT request
const response = await api.put(`/orders/${id}`, { status: 'completed' });

// DELETE request
await api.delete(`/products/${id}`);
```

### Error Handling

```jsx
try {
  const response = await api.get('/products');
  setProducts(response.data.data.products);
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage and AuthContext
4. Token included in all API requests via Axios interceptor
5. Protected routes check AuthContext for authentication
6. Logout clears token and redirects to home

## Page Layouts

### Customer Portal Routes

```
/                              # Home/Landing
/products                      # Product catalog
/products/:id                  # Product details
/services                      # Services browse
/services/:id/book            # Booking form
/checkout                      # Shopping cart & checkout
/checkout/success              # Payment success
/orders                        # Order history
/bookings                      # Booking history
/profile                       # Customer profile
```

### Staff Portal Routes

```
/staff/dashboard              # Dashboard
/staff/schedule               # View schedule
/staff/leave-request         # Submit leave
/staff/performance           # Performance metrics
/staff/payroll               # View payroll
```

### Admin Portal Routes

```
/admin/dashboard              # Dashboard
/admin/users                  # User management
/admin/products               # Product management
/admin/services               # Service management
/admin/bookings               # Booking management
/admin/orders                 # Order management
/admin/analytics              # Analytics
/admin/payroll                # Payroll management
```

## Responsive Breakpoints

```css
xs: 320px (mobile)
sm: 576px (tablet)
md: 768px (tablet+)
lg: 992px (desktop)
xl: 1200px (desktop+)
2xl: 1400px (large desktop)
```

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization and lazy loading
- CSS minification and compression
- Bundle analysis with Vite
- Caching strategies
- Debouncing for search/filters

## Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast ratios
- Focus management

## Testing

```bash
# Run tests (when setup)
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari 12+
- Chrome Android 88+

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### Deploy to AWS S3 + CloudFront

```bash
# Configure AWS credentials
aws configure

# Upload to S3
aws s3 sync dist/ s3://yourdomain.com/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

See `../documentation/DEPLOYMENT.md` for detailed deployment guide.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Issues

```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## Code Style

- ESLint configuration included
- Prettier formatting (optional)
- Component naming: PascalCase
- File naming: camelCase for utilities, PascalCase for components
- Consistent spacing and indentation

## Performance Checklist

- [ ] Images optimized and lazy-loaded
- [ ] Code splitting implemented
- [ ] Unused dependencies removed
- [ ] CSS minified and compressed
- [ ] API calls cached where appropriate
- [ ] Bundle size analyzed
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals optimized

## Security

- HTTPS/SSL required
- No sensitive data in localStorage
- XSS prevention with React's built-in escaping
- CSRF token included in requests
- Secure headers configured
- Input validation on all forms

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check existing issues on GitHub
- Create new issue with detailed description
- Email: support@tasselhairandbeauty.co.za

## Roadmap

- [ ] User authentication UI
- [ ] Product catalog page
- [ ] Service booking flow
- [ ] Shopping cart & checkout
- [ ] Order tracking
- [ ] Customer dashboard
- [ ] Staff portal
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] Notifications
- [ ] Mobile app

---

**Created**: April 2026
**Last Updated**: April 2026
**Maintainer**: Your Team
