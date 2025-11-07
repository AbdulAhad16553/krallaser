# Lazy Loading Images Implementation

## Overview
This implementation provides lazy loading for product images on the shop page, fetching images only when they become visible on screen using the Intersection Observer API.

## Components Created

### 1. API Endpoint: `/api/item-image`
- **File**: `app/api/item-image/route.ts`
- **Purpose**: Fetches individual item images from ERPNext
- **Usage**: `GET /api/item-image?item_name={item_name}`
- **Response**: Returns only the image field for the specified item

### 2. Custom Hook: `useLazyImage`
- **File**: `hooks/useLazyImage.ts`
- **Purpose**: Manages lazy loading state and intersection observer logic
- **Features**:
  - Intersection Observer for viewport detection
  - Loading states (loading, error, success)
  - Automatic cleanup
  - Configurable root margin and threshold

### 3. LazyImage Component
- **File**: `components/ui/lazy-image.tsx`
- **Purpose**: React component that wraps Next.js Image with lazy loading
- **Features**:
  - Skeleton loading state
  - Error handling
  - Priority loading option
  - Optimized image URLs

## How It Works

1. **Initial Render**: Products are rendered with skeleton placeholders
2. **Viewport Detection**: Intersection Observer watches for when images enter the viewport
3. **Image Fetching**: When visible, the component fetches the image via the API
4. **URL Construction**: Uses ERPNext domain to construct full image URLs (`https://domain.com/files/image.jpg`)
5. **Progressive Loading**: Images load one by one as they become visible
6. **Optimization**: Uses Next.js Image optimization with proper sizing

## Usage

### Basic Usage
```tsx
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
  itemName="product-sku"
  alt="Product Name"
  width={300}
  height={300}
  className="object-cover"
/>
```

### With Fill Layout
```tsx
<LazyImage
  itemName="product-sku"
  alt="Product Name"
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
/>
```

### Priority Loading
```tsx
<LazyImage
  itemName="product-sku"
  alt="Product Name"
  width={300}
  height={300}
  priority={true} // Loads immediately
/>
```

## Benefits

1. **Performance**: Only loads images when needed
2. **Bandwidth**: Reduces initial page load time
3. **User Experience**: Smooth loading with skeleton states
4. **SEO**: Maintains proper image structure
5. **Mobile Friendly**: Especially beneficial on mobile devices
6. **ERPNext Integration**: Uses proper ERPNext domain for image URLs
7. **Error Handling**: Graceful fallbacks for missing or malformed images

## Configuration

The lazy loading can be configured with these options:

```tsx
const { imageUrl, isLoading, error, setElementRef } = useLazyImage(itemName, {
  rootMargin: '50px',    // Start loading 50px before entering viewport
  threshold: 0.1,        // Trigger when 10% of image is visible
  enabled: true          // Enable/disable lazy loading
});
```

## Error Handling

- Network errors are caught and displayed
- Missing images show a "No image" placeholder
- Loading states provide visual feedback
- Automatic retry on intersection

## Browser Support

- Modern browsers with Intersection Observer support
- Graceful degradation for older browsers
- Next.js Image optimization for all browsers
