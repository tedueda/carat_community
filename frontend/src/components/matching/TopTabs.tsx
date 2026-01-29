import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TopTabs() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = searchParams.get('segment') || 'gay';

  const handleTabChange = (value: string) => {
    setSearchParams({ segment: value });
  };

  return (
    <Tabs value={segment} onValueChange={handleTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="lesbian">{t('matching.tabs.lesbian')}</TabsTrigger>
        <TabsTrigger value="gay">{t('matching.tabs.gay')}</TabsTrigger>
        <TabsTrigger value="other">{t('matching.tabs.other')}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
