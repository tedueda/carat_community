export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  order_index: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  subcategories: Subcategory[];
}
