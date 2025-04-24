export interface BlogPost {
  title: string;
  description: string;
  date: string;
  image?: string;
  tags: string[];
  category: string;
  path: string;
  body: any; // Le contenu du markdown parsé
}

// Pour être utilisé avec useAsyncData
export interface BlogQueryResult {
  data: BlogPost | null;
  pending: boolean;
  error: any;
} 