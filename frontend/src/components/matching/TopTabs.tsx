import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TopTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = searchParams.get('segment') || 'gay';

  const handleTabChange = (value: string) => {
    setSearchParams({ segment: value });
  };

  return (
    <Tabs value={segment} onValueChange={handleTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="lesbian">L</TabsTrigger>
        <TabsTrigger value="gay">G</TabsTrigger>
        <TabsTrigger value="other">その他</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
