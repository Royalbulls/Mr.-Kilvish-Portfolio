import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { LanguageProvider } from '@/components/LanguageContext';
import { VaultProvider } from '@/components/VaultContext';
import { UserProvider } from '@/components/UserContext';
import { Sidebar } from '@/components/Sidebar';
import { TerrorNotification } from '@/components/TerrorNotification';

export const metadata: Metadata = {
  title: 'Mr. Kilvish | The World Dominating Artist',
  description: 'Artist, Producer, Director, Music Songwriter. Andhera Kayam Rahe.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <UserProvider>
          <VaultProvider>
            <LanguageProvider>
              <div className="flex min-h-screen pb-20 lg:pb-0">
                <Sidebar />
                <main className="flex-1 lg:ml-64 relative">
                  {children}
                </main>
              </div>
              <TerrorNotification />
            </LanguageProvider>
          </VaultProvider>
        </UserProvider>
      </body>
    </html>
  );
}
