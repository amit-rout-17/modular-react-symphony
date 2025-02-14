
import { useEffect, useState } from 'react';
import { exampleService, Todo } from '@/services/api/example.service';
import { useWebSocket } from '@/hooks/use-websocket';

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Example of using WebSocket
  useWebSocket((data) => {
    console.log('WebSocket message received:', data);
  });

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const data = await exampleService.getTodos();
        setTodos(data);
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    };

    loadTodos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Modular React Starter
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Todos Example</h2>
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <span>{todo.title}</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    todo.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {todo.completed ? 'Completed' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
