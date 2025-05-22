import React, { useState, useEffect } from 'react';
import ProductTable from "@/components/ProductTable";
import { supabase } from '@/utils/supabaseClient';

export default function GerenciarProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [reFetch, setReFetch] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        setProdutos(data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [reFetch]);

  const handleUpdate = async (updatedProduct) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update(updatedProduct)
        .eq('id', updatedProduct.id);

      if (error) throw error;
      
      setSnackbar({
        open: true,
        message: 'Produto atualizado com sucesso!',
        severity: 'success'
      });
      setReFetch(prev => !prev);
      setOpenEditDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      setSnackbar({
        open: true,
        message: `Erro ao atualizar: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: produto, error: fetchError } = await supabase
        .from('produtos')
        .select('imagem_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (produto.imagem_url) {
        const fileName = produto.imagem_url.split('/').pop();
        await supabase.storage
          .from('imagens-produtos')
          .remove([fileName]);
      }

      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'Produto excluído com sucesso!',
        severity: 'success'
      });
      setReFetch(prev => !prev);
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      setSnackbar({
        open: true,
        message: `Erro ao excluir: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

   const EditProductForm = ({ produto, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState(produto);
  const [imagePreview, setImagePreview] = useState(produto.imagem_url || '');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      
      if (!file) return;
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagens-produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Atualizar URL da imagem no formData
      const { data: { publicUrl } } = supabase.storage
        .from('imagens-produtos')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        imagem_url: publicUrl
      });

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setSnackbar({
        open: true,
        message: `Erro ao enviar imagem: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campos existentes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          name="nome"
          value={formData.nome || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Categoria</label>
        <input
          type="text"
          name="categoria"
          value={formData.categoria || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Preço</label>
        <input
          type="number"
          name="preco"
          value={formData.preco || ''}
          onChange={handleChange}
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        />
      </div>

      {/* Novo campo para imagem */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploading}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploading && <p className="mt-2 text-sm text-gray-500">Enviando imagem...</p>}
      </div>

      {/* Preview da imagem */}
      {imagePreview && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 mb-1">Preview:</p>
          <img 
            src={imagePreview} 
            alt="Preview da imagem" 
            className="h-32 object-cover rounded-md"
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Gerenciamento de Produtos</h1>
        
        {error && (
          <div className={`mb-4 p-4 rounded ${
            snackbar.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ProductTable
            produtos={produtos}
            onDelete={handleDelete}
            onEdit={(produto) => {
              setEditingProduct(produto);
              setOpenEditDialog(true);
            }}
          />
        </div>

        {openEditDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Editar Produto</h2>
              </div>
              <div className="p-4">
                {editingProduct && (
                  <EditProductForm
                    produto={editingProduct}
                    onUpdate={handleUpdate}
                    onCancel={() => setOpenEditDialog(false)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {snackbar.open && (
          <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg ${
            snackbar.severity === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}>
            {snackbar.message}
            <button 
              onClick={handleCloseSnackbar} 
              className="ml-4"
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  } 