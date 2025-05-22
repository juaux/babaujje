import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Carregamento dinâmico do formulário
const ProductForm = dynamic(() => import('@/components/ProductForm'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

export default function CadastrarProduto() {
  return (
    <div className="min-h-screen bg-white flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-white rounded-md shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Cadastro de Produtos</h2>
        <Suspense fallback={<LoadingSpinner />}>
          <ProductForm />
        </Suspense>
      </div>
    </div>
  );
}
