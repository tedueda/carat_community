import { Badge } from './badge';

interface IdentityBadgeProps {
  value?: string | null;
}

export function IdentityBadge({ value }: IdentityBadgeProps) {
  if (!value) return null;

  const identityMap: Record<string, { label: string; className: string }> = {
    gay: { label: 'G', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    'ゲイ': { label: 'G', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    lesbian: { label: 'L', className: 'bg-pink-100 text-pink-700 border-pink-300' },
    'レズ': { label: 'L', className: 'bg-pink-100 text-pink-700 border-pink-300' },
    'レズビアン': { label: 'L', className: 'bg-pink-100 text-pink-700 border-pink-300' },
    bisexual: { label: 'B', className: 'bg-purple-100 text-purple-700 border-purple-300' },
    'バイセクシュアル': { label: 'B', className: 'bg-purple-100 text-purple-700 border-purple-300' },
    'バイセクシャル': { label: 'B', className: 'bg-purple-100 text-purple-700 border-purple-300' },
    transgender: { label: 'T', className: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    'トランスジェンダー': { label: 'T', className: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    queer: { label: 'Q', className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    'クィア': { label: 'Q', className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    male: { label: 'S', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    '男性': { label: 'S', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    female: { label: 'S', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    '女性': { label: 'S', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    other: { label: 'その他', className: 'bg-green-100 text-green-700 border-green-300' },
    'その他': { label: 'その他', className: 'bg-green-100 text-green-700 border-green-300' }
  };

  const identity = identityMap[value] || identityMap[value.toLowerCase()] || { 
    label: value, 
    className: 'bg-gray-100 text-gray-700 border-gray-300' 
  };

  return (
    <Badge variant="outline" className={`text-xs ${identity.className}`}>
      {identity.label}
    </Badge>
  );
}
