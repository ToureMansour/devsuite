export interface Command {
  id: string;
  command: string;
  description: string;
  example?: string;
  category: string;
  tags: string[];
  isCustom?: boolean;
}

export type Category = 
  | 'Git' | 'Docker' | 'Laravel' | 'Django' | 'Symfony' | 'Node' | 'React' 
  | 'Vue' | 'Angular' | 'Python' | 'Go' | 'Rust' | 'SQL' | 'Kubernetes' 
  | 'Linux' | 'AWS' | 'DevOps' | 'Security' | 'General' | 'Other';

export const CATEGORIES: Category[] = [
  'Git', 'Docker', 'Laravel', 'Django', 'Symfony', 'Node', 'React',
  'Vue', 'Angular', 'Python', 'Go', 'Rust', 'SQL', 'Kubernetes',
  'Linux', 'AWS', 'DevOps', 'Security', 'General', 'Other'
];
