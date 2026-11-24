export type Categoria =
  | "Alimentos"
  | "Transporte"
  | "Lazer"
  | "Saude"
  | "Cartao"
  | "Outros";

export interface Despesa {
  id: string;
  titulo: string;
  valor: number;
  categoria: Categoria;
}