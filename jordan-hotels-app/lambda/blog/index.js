import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const BLOG_TABLE = process.env.BLOG_TABLE || "Blog";

const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent",
  "Vary": "Origin",
};

// Blog post data structure constants
const mockBlogPosts = [];

export async function handler(event) {
  console.log('Event:', JSON.stringify(event, null, 2));

  const method = event?.httpMethod || event?.requestContext?.http?.method || "GET";
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: "",
    };
  }

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
      headers: { 'Content-Type': 'application/json', ...defaultHeaders },
      body: JSON.stringify({ message: 'Not found' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...defaultHeaders },
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
      headers: defaultHeaders,
      body: JSON.stringify({
        posts: postsWithoutContent,
        page,
        limit,
        total: result.Count || 0
      })
    };
  } catch (error) {
    console.error('Error listing blog posts:', error);
    
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: 'Blog service temporarily unavailable' }),
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
        headers: defaultHeaders,
        body: JSON.stringify({ message: 'Blog post not found' })
      };
    }

    const post = result.Items[0];
    
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(post)
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ message: 'Blog service temporarily unavailable' }),
    };
  }
}

