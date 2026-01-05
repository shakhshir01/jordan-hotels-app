import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const BLOG_TABLE = process.env.BLOG_TABLE || "Blog";

// Mock blog posts for demo mode
const mockBlogPosts = [
  {
    id: 'blog-001',
    slug: 'best-time-to-visit-petra',
    title: 'Best Time to Visit Petra',
    meta: 'Discover the perfect season to explore one of the world\'s Seven Wonders',
    content: 'Petra is best visited during spring (March-May) and fall (September-November) when temperatures are moderate. Summer heat can be extreme, while winter offers fewer crowds.',
    author: 'Jordan Travel Team',
    publishedDate: '2025-12-15',
    updatedDate: '2025-12-15',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&fit=crop',
    category: 'Destinations',
    readTime: 5
  },
  {
    id: 'blog-002',
    slug: 'wadi-rum-desert-camps-guide',
    title: 'Wadi Rum Desert Camps: Complete Guide',
    meta: 'Everything you need to know about staying in Wadi Rum\'s famous Bedouin camps',
    content: 'Wadi Rum offers unique desert experiences with traditional Bedouin hospitality. From luxury bubble camps to authentic tent stays, there\'s something for every traveler.',
    author: 'Adventure Correspondent',
    publishedDate: '2025-11-20',
    updatedDate: '2025-12-01',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&fit=crop',
    category: 'Accommodations',
    readTime: 7
  },
  {
    id: 'blog-003',
    slug: 'amman-food-scene',
    title: 'Amman\'s Vibrant Food Scene',
    meta: 'Explore the best restaurants and street food in Jordan\'s capital',
    content: 'From traditional mezze to modern fusion cuisine, Amman offers incredible culinary experiences. Must-try dishes include hummus, falafel, and freshly grilled kebab.',
    author: 'Food Blogger',
    publishedDate: '2025-10-10',
    updatedDate: '2025-10-10',
    imageUrl: 'https://images.unsplash.com/photo-1504674900967-dac6046a90d4?q=80&w=800&fit=crop',
    category: 'Food & Culture',
    readTime: 6
  },
  {
    id: 'blog-004',
    slug: 'dead-sea-health-benefits',
    title: 'Health Benefits of the Dead Sea',
    meta: 'Why the Dead Sea is considered one of the world\'s best wellness destinations',
    content: 'The Dead Sea\'s mineral-rich waters and therapeutic mud have been used for centuries. The unique environment helps with skin conditions and provides ultimate relaxation.',
    author: 'Wellness Expert',
    publishedDate: '2025-09-25',
    updatedDate: '2025-09-25',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&fit=crop',
    category: 'Wellness',
    readTime: 4
  }
];

export async function handler(event) {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const path = event.rawPath || event.path || '';
    const method = event.requestContext?.http?.method || event.httpMethod || 'GET';

    // GET /blog - list all posts
    if (path === '/blog' && method === 'GET') {
      return await listBlogPosts(event);
    }

    // GET /blog/{slug} - get single post
    if (path.startsWith('/blog/') && method === 'GET') {
      const slug = path.replace('/blog/', '');
      return await getBlogPostBySlug(slug);
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Not found' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
}

async function listBlogPosts(event) {
  try {
    // Get query params for pagination
    const page = parseInt(event.queryStringParameters?.page || '1');
    const limit = parseInt(event.queryStringParameters?.limit || '10');
    const skip = (page - 1) * limit;

    // Scan Blog table
    const params = {
      TableName: BLOG_TABLE,
      Limit: limit
    };

    const result = await docClient.send(new ScanCommand(params));
    
    // Return paginated results with meta
    const posts = result.Items || [];
    const postsWithoutContent = posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      meta: post.meta,
      author: post.author,
      publishedDate: post.publishedDate,
      imageUrl: post.imageUrl,
      category: post.category,
      readTime: post.readTime
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        posts: postsWithoutContent,
        page,
        limit,
        total: result.Count || 0
      })
    };
  } catch (error) {
    console.error('Error listing blog posts:', error);
    
    // Return mock data on error (demo mode)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        posts: mockBlogPosts.map(post => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          meta: post.meta,
          author: post.author,
          publishedDate: post.publishedDate,
          imageUrl: post.imageUrl,
          category: post.category,
          readTime: post.readTime
        })),
        page: 1,
        limit: 10,
        total: mockBlogPosts.length
      })
    };
  }
}

async function getBlogPostBySlug(slug) {
  try {
    // Query Blog table by slug
    const params = {
      TableName: BLOG_TABLE,
      IndexName: 'SlugIndex', // assuming you have this GSI
      KeyConditionExpression: 'slug = :slug',
      ExpressionAttributeValues: {
        ':slug': slug
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    
    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Blog post not found' })
      };
    }

    const post = result.Items[0];
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(post)
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    
    // Return mock post on error (demo mode)
    const mockPost = mockBlogPosts.find(p => p.slug === slug);
    
    if (mockPost) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(mockPost)
      };
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Blog post not found' })
    };
  }
}
