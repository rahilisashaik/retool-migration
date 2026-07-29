# UI Components Architecture

## Component Structure

### Base UI Components
- **Button** - Reusable button with variants (primary, secondary, danger, ghost) and loading states
- **Card** - Card container with optional hover effects
- **Input** - Form input with labels and error states
- **Badge** - Status badges with color variants
- **Table** - Complete table system for data display

### Specialized Components
- **HoverIcon** - Dynamic icon component with size, animation, and hover effects
  - Props: icon (emoji), Icon (LucideIcon), size (sm/md/lg/xl), animation, delay, withGlow
  - Used for animated bread elements (emoji) and dashboard icons (Lucide icons)
  - Supports both emoji strings and LucideIcon components for flexibility
  
- **AnimatedBreadBackground** - Complete bread animation container
  - Manages the left-side sign-in animation
  - Contains multiple HoverIcon components with different animations
  - Uses emojis for playful sign-in page experience
  
- **BrandLogo** - Bread AI branding component
  - Props: variant (full/icon/text), size, href, icon (emoji), Icon (LucideIcon)
  - Used in navigation and brand sections
  - Supports both emoji (playful) and custom SVG icons (professional)
  
- **BrandSection** - Brand logo with tagline
  - Used for brand positioning in sign-in page
  - Uses custom BreadIcon SVG for professional branding
  
- **PoweredByFooter** - Attribution footer
  - Props: brand name
  - Used for "Powered by Devin" footer

### Page-Level Components
- **StatCard** - Dashboard statistics card
  - Props: label, value, icon (emoji), Icon (LucideIcon)
  - Used for dashboard metrics
  - Prefers LucideIcon for professional dashboard look
  
- **QuickAccessCard** - Quick access card for navigation
  - Props: title, description, icon (emoji), Icon (LucideIcon), buttonText, onClick
  - Used for dashboard quick access buttons
  - Prefers LucideIcon for professional dashboard look
  
- **UserProfileCard** - User profile information card
  - Props: email, role, userId
  - Used for displaying user information

### Auth Components
- **SignInForm** - Complete sign-in form component
  - Props: onSuccess, onError, showDemoCredentials, className
  - Handles authentication logic and form state
  - Reusable across different sign-in contexts

### Icon Components
- **BreadIcon** - Custom SVG bread icon
  - Used for professional branding in navigation and brand sections
  - Styled with brand green color

## Icon Strategy

**Sign-in Page**: Uses emojis (🍞🥐🥖🥯🥨) for playful, interactive experience
**Dashboard**: Uses Lucide React icons for professional, enterprise-grade appearance
**Navigation**: Uses custom BreadIcon SVG for consistent branding

## Benefits of This Architecture

1. **Reusability**: Components can be used in multiple contexts
2. **Maintainability**: Single source of truth for common patterns
3. **Consistency**: Uniform styling and behavior across the app
4. **Testability**: Isolated components are easier to test
5. **Type Safety**: TypeScript interfaces for all props
6. **Flexibility**: Configurable props for different use cases
7. **Icon Flexibility**: Support for both emojis and professional icons

## Example Usage

```tsx
// Sign-in page (playful with emojis)
<AnimatedBreadBackground />
<BrandSection />
<SignInForm onError={setError} showDemoCredentials={true} />
<PoweredByFooter />

// Dashboard (professional with Lucide icons)
<StatCard label="Open KYC Cases" value="12" Icon={Search} />
<QuickAccessCard 
  title="KYC Review Queue" 
  description="Manage customer identity verification cases"
  Icon={Search}
  buttonText="Open Queue"
  onClick={() => router.push('/kyc')}
/>
<UserProfileCard 
  email={session.user.email}
  role={session.user.role}
  userId={session.user.id}
/>

// Navigation (custom SVG branding)
<BrandLogo variant="full" size="md" href="/dashboard" Icon={BreadIcon} />
```

## Future Component Opportunities

1. **Modal/Dialog** - For confirmations and detailed views
2. **Dropdown** - For action menus and filters
3. **Pagination** - For data tables
4. **LoadingSpinner** - For loading states
5. **EmptyState** - For no-data scenarios
6. **PageHeader** - Consistent page titles and actions
7. **FilterBar** - Reusable filter components
8. **StatusIndicator** - Visual status representations
