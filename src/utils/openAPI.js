/**
 * OpenAPI/Swagger Documentation
 * Complete API specification for VisitJo
 */

export const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'VisitJo Hotel Booking API',
    description: 'RESTful API for the VisitJo hotel booking platform',
    version: '1.0.0',
    contact: {
      name: 'VisitJo Support',
      url: 'https://visitjo.com',
      email: 'khaledshakhshir2133@gmail.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://api.visitjo.com/v1',
      description: 'Production',
    },
    {
      url: 'https://staging-api.visitjo.com/v1',
      description: 'Staging',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development',
    },
  ],
  tags: [
    { name: 'Hotels', description: 'Hotel operations' },
    { name: 'Bookings', description: 'Booking management' },
    { name: 'Users', description: 'User management' },
    { name: 'Payments', description: 'Payment processing' },
    { name: 'Reviews', description: 'Reviews and ratings' },
    { name: 'Search', description: 'Search and filters' },
    { name: 'Notifications', description: 'Notification service' },
    { name: 'Analytics', description: 'Analytics and tracking' },
  ],
  paths: {
    '/hotels': {
      get: {
        tags: ['Hotels'],
        summary: 'List all hotels',
        operationId: 'listHotels',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: { type: 'integer', default: 20 },
          },
          {
            name: 'destination',
            in: 'query',
            description: 'Filter by destination',
            schema: { type: 'string' },
          },
          {
            name: 'minPrice',
            in: 'query',
            description: 'Minimum price',
            schema: { type: 'number' },
          },
          {
            name: 'maxPrice',
            in: 'query',
            description: 'Maximum price',
            schema: { type: 'number' },
          },
          {
            name: 'rating',
            in: 'query',
            description: 'Minimum rating',
            schema: { type: 'number', minimum: 1, maximum: 5 },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Hotel' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/hotels/{id}': {
      get: {
        tags: ['Hotels'],
        summary: 'Get hotel details',
        operationId: 'getHotel',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Hotel' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/bookings': {
      post: {
        tags: ['Bookings'],
        summary: 'Create a new booking',
        operationId: 'createBooking',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Booking created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings'],
        summary: 'Get booking details',
        operationId: 'getBooking',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Bookings'],
        summary: 'Update booking',
        operationId: 'updateBooking',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Booking updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Booking' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Bookings'],
        summary: 'Cancel booking',
        operationId: 'cancelBooking',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': {
            description: 'Booking cancelled successfully',
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/payments/create-intent': {
      post: {
        tags: ['Payments'],
        summary: 'Create payment intent',
        operationId: 'createPaymentIntent',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId', 'amount', 'currency'],
                properties: {
                  bookingId: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string', default: 'JOD' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Payment intent created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    clientSecret: { type: 'string' },
                    paymentIntentId: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Create review',
        operationId: 'createReview',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Review created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
        },
      },
    },
    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Advanced hotel search',
        operationId: 'searchHotels',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Search query',
            schema: { type: 'string' },
          },
          {
            name: 'destination',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'checkIn',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'checkOut',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'amenities',
            in: 'query',
            schema: { type: 'array', items: { type: 'string' } },
          },
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Hotel' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Hotel: {
        type: 'object',
        required: ['id', 'name', 'location', 'price'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          currency: { type: 'string', default: 'JOD' },
          rating: { type: 'number', minimum: 0, maximum: 5 },
          reviews: { type: 'integer' },
          image: { type: 'string', format: 'uri' },
          amenities: { type: 'array', items: { type: 'string' } },
          address: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
      Booking: {
        type: 'object',
        required: ['id', 'hotelId', 'userId', 'checkInDate', 'checkOutDate'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          hotelId: { type: 'string' },
          userId: { type: 'string' },
          checkInDate: { type: 'string', format: 'date' },
          checkOutDate: { type: 'string', format: 'date' },
          guests: { type: 'integer' },
          totalPrice: { type: 'number' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled'],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      BookingRequest: {
        type: 'object',
        required: ['hotelId', 'checkInDate', 'checkOutDate', 'guests'],
        properties: {
          hotelId: { type: 'string' },
          checkInDate: { type: 'string', format: 'date' },
          checkOutDate: { type: 'string', format: 'date' },
          guests: { type: 'integer', minimum: 1 },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          hotelId: { type: 'string' },
          userId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string' },
          comment: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ReviewRequest: {
        type: 'object',
        required: ['hotelId', 'rating', 'title', 'comment'],
        properties: {
          hotelId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string' },
          comment: { type: 'string' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          pages: { type: 'integer' },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Conflict: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      InternalError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from Cognito',
      },
    },
  },
};

export const Error = {
  type: 'object',
  required: ['code', 'message'],
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
    details: { type: 'object' },
  },
};

export default openAPISpec;
