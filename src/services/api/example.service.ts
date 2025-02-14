
import { httpService } from './http.service';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
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

  public async getPosts(): Promise<Post[]> {
    return httpService.get<Post[]>('posts');
  }
}

export const exampleService = ExampleService.getInstance();
