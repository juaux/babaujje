// pages/index.js
import DashboardLayout from '@/components/DashboardLayout';
import BalancoSupabase from '@/components/BalancoSupabase'; // Importando o componente BalancoSupabase

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* A barra lateral já está incluída no DashboardLayout */}

        {/* Conteúdo do Balanço */}
        <div className="flex-1 p-4">
          <BalancoSupabase />
        </div>
      </div>
    </DashboardLayout>
  );
}