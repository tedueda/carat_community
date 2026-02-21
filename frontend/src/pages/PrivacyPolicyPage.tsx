import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-16 right-[-120px] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 md:px-8 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Shield className="h-4 w-4" />
              Carat Community
            </div>
            <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight text-white">
              プライバシーポリシー（個人情報の取り扱い）
            </h1>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl prose prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 max-w-none">

          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            ポテンシャルデザイン（以下「当社」といいます。）は、コミュニティサイト「Carat」（以下「本サービス」といいます。）において取得する個人情報等を、以下の方針に基づき適切に取り扱います。
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            1. 事業者情報
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm md:text-base leading-relaxed text-gray-700">
            <li><strong>事業者名</strong>：ポテンシャルデザイン</li>
            <li><strong>運営責任者</strong>：上田 孝久</li>
            <li><strong>所在地</strong>：〒545-0021 大阪府大阪市阿倍野区阪南町6-1-5</li>
            <li><strong>電話番号</strong>：06-6697-0034</li>
            <li><strong>メールアドレス</strong>：<a href="mailto:ted@carat-community.com" className="text-blue-600 hover:underline">ted@carat-community.com</a></li>
          </ul>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            2. 取得する情報
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            当社は、本サービスの提供にあたり、以下の情報を取得する場合があります。
          </p>
          <ol className="list-decimal list-outside pl-5 space-y-3 text-sm md:text-base leading-relaxed text-gray-700">
            <li><strong>会員登録情報</strong>：メールアドレス、ユーザー名（表示名）、パスワード（※当社は通常、復元できない形で管理します）等</li>
            <li><strong>本人確認（eKYC）に関する情報</strong>：本人確認書類情報、顔画像等（本人確認のために必要な範囲）</li>
            <li><strong>利用ログ等</strong>：IPアドレス、端末情報、ブラウザ情報、閲覧・操作履歴、Cookie等</li>
            <li><strong>投稿・通信情報</strong>：投稿内容、コメント、チャット内容、画像・動画URL等（会員が送信した情報）</li>
            <li>
              <strong>決済に関する情報</strong>：決済状況、決済識別子等
              <br />
              <span className="text-gray-500 text-xs md:text-sm">※クレジットカード番号等のセンシティブな決済情報は、原則として決済事業者（Stripe）により処理され、当社が保持しない形で運用します（本サービスの実装仕様により変わる場合があります）。</span>
            </li>
          </ol>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            3. 利用目的
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            当社は、取得した情報を以下の目的で利用します。
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm md:text-base leading-relaxed text-gray-700">
            <li>本サービスの提供、本人確認、会員管理、認証</li>
            <li>投稿・チャット等の機能提供、コミュニティ運営</li>
            <li>不正利用の防止、セキュリティ確保、違反行為への対応</li>
            <li>お問い合わせ対応、重要なお知らせの通知</li>
            <li>利用状況分析、サービス改善、品質向上</li>
            <li>料金の請求、決済処理、返金等の対応（該当する場合）</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            4. 第三者提供
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            当社は、法令に基づく場合等を除き、本人の同意なく個人情報を第三者に提供しません。
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            5. 委託
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            当社は、本サービス運営に必要な範囲で、個人情報の取扱いを外部事業者に委託する場合があります（例：決済処理、本人確認、サーバー運用等）。この場合、当社は委託先を適切に選定し、必要かつ適切な監督を行います。
          </p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm md:text-base leading-relaxed text-gray-700">
            <li><strong>決済事業者</strong>：Stripe</li>
          </ul>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            6. 安全管理措置
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            当社は、個人情報への不正アクセス、漏えい、滅失、毀損等を防止するため、アクセス制御、権限管理、通信の暗号化等、合理的な安全管理措置を講じます。
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            7. 開示・訂正・削除等の請求
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            本人から、保有個人データの開示、訂正、追加、削除、利用停止等の請求があった場合、法令に従い、本人確認のうえ適切に対応します。お問い合わせは「11. お問い合わせ窓口」までご連絡ください。
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            8. Cookie等の利用
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            当社は、本サービスの提供・改善のためCookie等を使用する場合があります。ブラウザ設定によりCookieを無効にできますが、その場合、本サービスの一部機能が利用できないことがあります。
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            9. 年齢制限
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            本サービスは<strong>18歳以上の方のみ</strong>利用できます。18歳未満の方の利用が判明した場合、当社は必要な措置を講じることがあります。
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            10. 本ポリシーの改定
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-700">
            当社は、必要に応じて本ポリシーを改定することがあります。改定後の内容は本サービス上への掲示等により周知し、掲示等の時点または当社が別途定める時点から効力を生じます。
          </p>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-10 border-b border-gray-200 pb-3">
            11. お問い合わせ窓口
          </h2>
          <ul className="list-disc list-outside pl-5 space-y-2 text-sm md:text-base leading-relaxed text-gray-700">
            <li><strong>電話番号</strong>：06-6697-0034</li>
            <li><strong>メールアドレス</strong>：<a href="mailto:ted@carat-community.com" className="text-blue-600 hover:underline">ted@carat-community.com</a></li>
          </ul>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              <Link to="/about" className="hover:underline">Caratとは</Link>
              {' ／ '}
              <Link to="/about/usage" className="hover:underline">ご利用方法</Link>
              {' ／ '}
              <Link to="/about/terms" className="hover:underline">利用規約</Link>
              {' ／ '}
              <Link to="/about/tokushoho" className="hover:underline">特定商取引法に基づく表記</Link>
              {' ／ '}
              <Link to="/contact" className="hover:underline">お問い合わせ</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
