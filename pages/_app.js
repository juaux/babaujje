// _app.js
import '@/styles/globals.css';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout'; // Verifique o caminho correto

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Rotas que NÃO devem usar o DashboardLayout
  const excludeLayout = ['/']; // Exclui a página inicial, por exemplo

  const showLayout = !excludeLayout.includes(router.pathname);

  return showLayout ? (
    <DashboardLayout>
      <Component {...pageProps} />
    </DashboardLayout>
  ) : (
    <Component {...pageProps} />
  );
}

export default MyApp;
