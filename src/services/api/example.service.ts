
import { httpService } from './http.service';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export class ExampleService {
  private static instance: ExampleService;

  private constructor() {}

  public static getInstance(): ExampleService {
    if (!ExampleService.instance) {
      ExampleService.instance = new ExampleService();
    }
    return ExampleService.instance;
  }

  public async getTodos(): Promise<Todo[]> {
    return httpService.get<Todo[]>('todos');
  }

  public async createTodo(title: string): Promise<Todo> {
    return httpService.post<Todo>('todos', { title, completed: false });
  }

  public async updateTodo(id: number, data: Partial<Todo>): Promise<Todo> {
    return httpService.put<Todo>(`todos/${id}`, data);
  }

  public async deleteTodo(id: number): Promise<void> {
    return httpService.delete(`todos/${id}`);
  }
}

export const exampleService = ExampleService.getInstance();
