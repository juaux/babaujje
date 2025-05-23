import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Image from 'next/image';

interface Product {
  id: string;
  nome: string;
  categoria: string;
  preco_venda?: number;
  imagem_url?: string;
}

interface ProductTableProps {
  produtos: Product[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (product: Product) => void;
}

export default function ProductTable({ produtos, onDelete, onEdit }: ProductTableProps) {
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Imagem
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preço
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {produtos.map((produto) => (
            <tr key={produto.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex justify-center">
                  {produto.imagem_url ? (
                    <div className="relative w-14 h-14">
                      <Image
                        src={produto.imagem_url}
                        alt={produto.nome}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="rounded-md object-cover"
                        quality={80}
                        priority={false}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-md">
                      <span className="text-xs text-gray-500">Sem imagem</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{produto.nome}</td>
              <td className="px-6 py-4 whitespace-nowrap text-left">{produto.categoria}</td>
              <td className="px-6 py-4 whitespace-nowrap text-left">
                {produto.preco_venda?.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }) || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    onClick={() => onEdit(produto)}
                    aria-label={`Editar ${produto.nome}`}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 transition-colors"
                    onClick={async () => {
                      if (window.confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) {
                        try {
                          await onDelete(produto.id);
                        } catch (error) {
                          console.error('Erro ao excluir produto:', error);
                        }
                      }
                    }}
                    aria-label={`Excluir ${produto.nome}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}