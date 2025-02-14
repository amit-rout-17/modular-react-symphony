
import { useEffect, useState } from 'react';
import { exampleService, Post } from '@/services/api/example.service';
import { useWebSocket } from '@/hooks/use-websocket';

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useWebSocket((data) => {
    console.log('WebSocket message received:', data);
  });

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await exampleService.getPosts();
        setPosts(data.slice(0, 5)); // Only show first 5 posts
      } catch (error) {
        console.error('Failed to load posts:', error);
      }
    };

    loadPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Simple React App
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Posts</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 border rounded-lg"
              >
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-gray-600 mt-2">{post.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
