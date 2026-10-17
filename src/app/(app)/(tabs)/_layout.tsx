import AppTabs from '@/components/app-tabs';
import { AppearanceProvider } from '@/context/appearance';

export default function TabsLayout() {
  return (
    <AppearanceProvider>
      <AppTabs />
    </AppearanceProvider>
  );
}
