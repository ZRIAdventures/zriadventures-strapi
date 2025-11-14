# Tours API Quick Reference

Quick reference guide for all Tours-related API endpoints.

---

## Base URL

```
http://localhost:1337/api
```

For production, replace with your production URL.

---

## Authentication

### Public Endpoints
No authentication required. These endpoints are accessible to anyone.

### Authenticated Endpoints
Require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Tour Endpoints

### Get All Tours
```http
GET /api/tours
```

**Query Parameters**:
- `pLevel=5` - Deep populate all relations
- `pagination[page]=1` - Page number
- `pagination[pageSize]=12` - Items per page
- `sort=createdAt:desc` - Sort order

**Example**:
```bash
curl "http://localhost:1337/api/tours?pLevel=5&pagination[pageSize]=12"
```

---

### Get Tour by Slug
```http
GET /api/tours?filters[slug][$eq]={slug}
```

**Example**:
```bash
curl "http://localhost:1337/api/tours?filters[slug][\$eq]=vietnam-adventure&pLevel=5"
```

---

### Get Tour by ID
```http
GET /api/tours?filters[tourId][$eq]={tourId}
```

**Example**:
```bash
curl "http://localhost:1337/api/tours?filters[tourId][\$eq]=tour-123&pLevel=5"
```

---

### Filter Tours by Type
```http
GET /api/tours?filters[tourType][$eq]=Private Tour
GET /api/tours?filters[tourType][$eq]=Group Tour
```

**Example**:
```bash
curl "http://localhost:1337/api/tours?filters[tourType][\$eq]=Private%20Tour&pLevel=5"
```

---

### Get Trending Tours
```http
GET /api/tours?filters[trending][$eq]=true
```

**Example**:
```bash
curl "http://localhost:1337/api/tours?filters[trending][\$eq]=true&pLevel=5"
```

---

### Get Featured Tours
```http
GET /api/tours?filters[featured][$eq]=true
```

---

### Get Best Seller Tours
```http
GET /api/tours?filters[bestSeller][$eq]=true
```

---

### Get New Tours
```http
GET /api/tours?filters[newTour][$eq]=true
```

---

### Get Tours by Start Location
```http
GET /api/tours?filters[startLocation][locationId][$eq]={locationId}
```

**Example**:
```bash
curl "http://localhost:1337/api/tours?filters[startLocation][locationId][\$eq]=colombo&pLevel=5"
```

---

### Get Tour IDs and Slugs Only
```http
GET /api/tours?fields[0]=tourId&fields[1]=slug
```

**Use Case**: For static site generation (Next.js `getStaticPaths`)

**Example**:
```bash
curl "http://localhost:1337/api/tours?fields[0]=tourId&fields[1]=slug"
```

---

## Tour Booking Endpoints

### Create Tour Booking 🔒 (Authenticated)
```http
POST /api/tour-bookings
```

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "data": {
    "bookingId": "BOOK-2025-001",
    "tour": 1,
    "departureDate": "2025-06-01",
    "returnDate": "2025-06-10",
    "numberOfPax": 2,
    "adultsCount": 2,
    "childrenCount": 0,
    "accommodationType": "Star Four",
    "roomType": "Double Room (2 Persons - DB)",
    "numberOfRooms": 1,
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "country": "USA"
    },
    "totalAmount": 2500.00,
    "currency": "USD",
    "bookingStatus": "Pending",
    "paymentStatus": "PENDING"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:1337/api/tour-bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data": {...}}'
```

---

### Get Booking by ID 🔒 (Authenticated)
```http
GET /api/tour-bookings?filters[bookingId][$eq]={bookingId}
```

**Example**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:1337/api/tour-bookings?filters[bookingId][\$eq]=BOOK-2025-001&pLevel=5"
```

---

### Update Booking Status 🔐 (Admin Only)
```http
PUT /api/tour-bookings/{id}
```

**Request Body**:
```json
{
  "data": {
    "bookingStatus": "Confirmed",
    "paymentStatus": "DEPOSIT_PAID"
  }
}
```

---

## Tour Operator Endpoints

### Get All Operators
```http
GET /api/tour-operators
```

**Example**:
```bash
curl "http://localhost:1337/api/tour-operators?pLevel=5"
```

---

### Get Operator by Slug
```http
GET /api/tour-operators?filters[slug][$eq]={slug}
```

**Example**:
```bash
curl "http://localhost:1337/api/tour-operators?filters[slug][\$eq]=zri-adventures&pLevel=5"
```

---

### Filter Operators by Type
```http
GET /api/tour-operators?filters[operatorType][$eq]=Platinum Operator
```

**Options**:
- Platinum Operator
- Gold Operator
- Silver Operator
- Standard Operator

---

## Review Endpoints

### Get Reviews for a Tour
```http
GET /api/reviews?filters[tour][tourId][$eq]={tourId}
```

**Example**:
```bash
curl "http://localhost:1337/api/reviews?filters[tour][tourId][\$eq]=tour-123&pLevel=3"
```

---

### Get Reviews for an Experience
```http
GET /api/reviews?filters[experience][experienceId][$eq]={experienceId}
```

---

### Get Reviews for an Operator
```http
GET /api/reviews?filters[operator][slug][$eq]={operatorSlug}
```

---

### Create Review 🔒 (Authenticated)
```http
POST /api/reviews
```

**Request Body**:
```json
{
  "data": {
    "reviewerName": "Jane Smith",
    "overallRating": 4.5,
    "title": "Amazing experience!",
    "reviewText": "Had a wonderful time on this tour...",
    "tour": 1,
    "tripDate": "2025-05-15",
    "verified": false
  }
}
```

---

## Location Endpoints

### Get All Locations
```http
GET /api/locations
```

---

### Get Location by ID
```http
GET /api/locations?filters[locationId][$eq]={locationId}
```

---

## Experience Endpoints (Enhanced)

### Get All Experiences
```http
GET /api/experiences?pLevel=5
```

**Note**: Experiences now support `placesToSee`, `travelMap`, `itinerary`, and `highlights` fields.

---

### Get Experience by ID
```http
GET /api/experiences?filters[experienceId][$eq]={experienceId}&pLevel=5
```

---

## Advanced Filtering

### Multiple Filters
```http
GET /api/tours?filters[trending][$eq]=true&filters[tourType][$eq]=Private Tour
```

---

### Price Range Filter
```http
GET /api/tours?filters[basePricePerPerson][amount][$gte]=500&filters[basePricePerPerson][amount][$lte]=2000
```

---

### Search by Name
```http
GET /api/tours?filters[name][$containsi]=vietnam
```

**Note**: `$containsi` is case-insensitive

---

### Date Range for Departures
```http
GET /api/tours?filters[departureDates][date][$gte]=2025-06-01&filters[departureDates][date][$lte]=2025-08-31
```

---

## Sorting

### Sort by Name (A-Z)
```http
GET /api/tours?sort=name:asc
```

---

### Sort by Rating (Highest First)
```http
GET /api/tours?sort=rating:desc
```

---

### Sort by Price (Lowest First)
```http
GET /api/tours?sort=basePricePerPerson.amount:asc
```

---

### Multiple Sort Criteria
```http
GET /api/tours?sort[0]=trending:desc&sort[1]=rating:desc&sort[2]=name:asc
```

---

## Pagination

### Page-based Pagination
```http
GET /api/tours?pagination[page]=1&pagination[pageSize]=12
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "pageCount": 5,
      "total": 60
    }
  }
}
```

---

### Offset-based Pagination
```http
GET /api/tours?pagination[start]=0&pagination[limit]=12
```

---

## Population

### Basic Population (Level 1)
```http
GET /api/tours?populate=*
```

**Populates**: First-level relations only

---

### Deep Population (All Levels)
```http
GET /api/tours?pLevel=5
```

**Populates**: All nested relations and components (recommended)

**Note**: Requires `strapi-v5-plugin-populate-deep` plugin

---

### Selective Population
```http
GET /api/tours?populate[startLocation]=*&populate[operator][populate]=certifications
```

**Use Case**: When you only need specific relations

---

## Field Selection

### Get Specific Fields Only
```http
GET /api/tours?fields[0]=name&fields[1]=slug&fields[2]=coverImage
```

**Use Case**: Reduce payload size for listing pages

---

## Common Response Format

### Success Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "tourId": "tour-vietnam-10days",
      "name": "Vietnam Adventure - 10 Days",
      "slug": "vietnam-adventure-10-days",
      "tourType": "Private Tour",
      "rating": 4.8,
      "totalReviews": 127,
      "trending": true,
      "featured": true,
      "basePricePerPerson": {
        "amount": 1299,
        "currency": "USD"
      },
      "coverImage": {
        "url": "https://res.cloudinary.com/..."
      },
      "startLocation": {
        "name": "Hanoi",
        "locationId": "hanoi"
      },
      "operator": {
        "name": "ZRI Adventures",
        "slug": "zri-adventures",
        "rating": 4.9
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z",
      "publishedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "pageCount": 5,
      "total": 60
    }
  }
}
```

---

### Error Response
```json
{
  "error": {
    "status": 404,
    "name": "NotFoundError",
    "message": "Tour not found",
    "details": {}
  }
}
```

---

## Rate Limiting

Strapi doesn't have rate limiting by default. Consider adding:
- Nginx rate limiting
- Cloudflare
- API Gateway with rate limiting

**Recommended**: 100 requests per minute per IP for public endpoints

---

## CORS Configuration

Ensure your frontend domain is allowed in `config/middlewares.js`:

```javascript
{
  name: 'strapi::cors',
  config: {
    origin: ['http://localhost:3000', 'https://yourfrontend.com'],
  },
}
```

---

## Webhooks

### Available Events
- `entry.create` - New tour/booking created
- `entry.update` - Tour/booking updated
- `entry.delete` - Tour/booking deleted
- `entry.publish` - Tour published
- `entry.unpublish` - Tour unpublished

**Configure**: Settings → Webhooks in Strapi admin

---

## TypeScript Types

### Tour Type (Example)
```typescript
interface Tour {
  id: number;
  documentId: string;
  tourId: string;
  name: string;
  slug: string;
  tourType: 'Private Tour' | 'Group Tour';
  about: About;
  tourSummary: TourSummary;
  itinerary: ItineraryDay[];
  highlights: Highlight[];
  placesToSee: PlaceToSee[];
  travelMap: TravelMap;
  rating: number;
  totalReviews: number;
  trending: boolean;
  featured: boolean;
  bestSeller: boolean;
  newTour: boolean;
  basePricePerPerson: Rate;
  startLocation: Location;
  endLocation: Location;
  operator: TourOperator;
  images: Media[];
  coverImage: Media;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

## Performance Tips

1. **Use Deep Population Wisely**: `pLevel=5` fetches everything. Use selective population for listings.

2. **Paginate Results**: Always use pagination for large datasets.

3. **Cache Responses**: Cache tour listings and details on the frontend.

4. **Use CDN**: Cloudinary handles image optimization automatically.

5. **Field Selection**: Only request fields you need for listings.

**Good for Listings**:
```
GET /api/tours?fields[0]=name&fields[1]=slug&fields[2]=rating&populate[coverImage]=*
```

**Good for Details**:
```
GET /api/tours?filters[slug][$eq]=tour-slug&pLevel=5
```

---

## Testing Endpoints

### Using cURL
```bash
curl -X GET "http://localhost:1337/api/tours?pLevel=5"
```

### Using Postman
Import the Strapi collection or create requests manually.

### Using JavaScript/TypeScript
```typescript
const response = await fetch('http://localhost:1337/api/tours?pLevel=5');
const data = await response.json();
```

---

## Production Checklist

- [ ] Configure production environment variables
- [ ] Set up database backups
- [ ] Configure CORS for production domains
- [ ] Enable HTTPS
- [ ] Set up CDN (Cloudinary)
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test all endpoints
- [ ] Verify permissions
- [ ] Add health check endpoint

---

## Support

For Strapi API documentation:
- [REST API Documentation](https://docs.strapi.io/dev-docs/api/rest)
- [Filters & Operators](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication)
- [Population](https://docs.strapi.io/dev-docs/api/rest/populate-select)

---

**Last Updated**: November 14, 2025
