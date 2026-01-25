import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { ArrowLeft, Heart, Users, Shield, Star } from 'lucide-react';

const MatchingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/feed')}
          className="text-pink-700 hover:text-pink-900 hover:bg-pink-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          ホームに戻る
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-3xl">💕</div>
          <div>
            <h1 className="text-2xl font-bold text-pink-800">マッチング</h1>
            <p className="text-slate-600">理想のパートナーと出会える安心のマッチングサービス</p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：サービス紹介 */}
        <div className="space-y-6">
          <Card className="border-pink-200">
            <CardHeader>
              <h2 className="text-xl font-semibold text-pink-800">安心・安全なマッチング</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold">本人確認済み</h3>
                  <p className="text-sm text-slate-600">すべてのユーザーが本人確認を完了しています</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-pink-600 mt-1" />
                <div>
                  <h3 className="font-semibold">LGBTQ+フレンドリー</h3>
                  <p className="text-sm text-slate-600">多様な性的指向・性自認に対応したマッチング</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">コミュニティ連携</h3>
                  <p className="text-sm text-slate-600">共通の趣味や価値観でつながる</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200">
            <CardHeader>
              <h2 className="text-xl font-semibold text-pink-800">利用者の声</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">Aさん（20代）</span>
                </div>
                <p className="text-sm text-slate-700">
                  「同じ価値観を持つパートナーと出会えました。安心して利用できるサービスです。」
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600">Bさん（30代）</span>
                </div>
                <p className="text-sm text-slate-700">
                  「プロフィールが詳細で、相性の良い人を見つけやすかったです。」
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右側：登録フォーム */}
        <div className="space-y-6">
          <Card className="border-pink-200">
            <CardHeader>
              <h2 className="text-xl font-semibold text-pink-800">マッチング開始</h2>
              <p className="text-slate-600">プロフィールを作成して理想のパートナーを見つけましょう</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💕</div>
                <h3 className="text-lg font-semibold text-pink-800 mb-2">準備中</h3>
                <p className="text-slate-600 mb-6">
                  マッチング機能は現在開発中です。<br />
                  近日中にサービス開始予定です。
                </p>
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white"
                  disabled
                >
                  事前登録（準備中）
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200">
            <CardHeader>
              <h2 className="text-xl font-semibold text-pink-800">料金プラン</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-pink-200 rounded-lg">
                <h3 className="font-semibold text-pink-800">ベーシックプラン</h3>
                <p className="text-2xl font-bold text-pink-600">月額 1,980円</p>
                <ul className="text-sm text-slate-600 mt-2 space-y-1">
                  <li>• 月10回までマッチング</li>
                  <li>• メッセージ機能</li>
                  <li>• プロフィール詳細設定</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-pink-400 rounded-lg bg-pink-50">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-pink-800">プレミアムプラン</h3>
                  <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">おすすめ</span>
                </div>
                <p className="text-2xl font-bold text-pink-600">月額 2,980円</p>
                <ul className="text-sm text-slate-600 mt-2 space-y-1">
                  <li>• 無制限マッチング</li>
                  <li>• 優先表示機能</li>
                  <li>• 詳細検索機能</li>
                  <li>• 専任サポート</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatchingPage;
