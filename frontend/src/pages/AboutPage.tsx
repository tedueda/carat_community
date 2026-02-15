import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-white" />
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-16 right-[-120px] h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              コミュニティサイト「Carat」のコンセプト
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl">
              <div className="relative aspect-[16/9] md:aspect-[21/9]">
                <img
                  src="/images/caio_01680_create_a_vibrant_poster_to_celebrate_So_Bernardo_do__9f9f3bde-d4c7-49b7-afcc-d79a6870886c.png"
                  alt="Carat concept visual"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              </div>
            </div>

            <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight text-white">
              国境も、ジェンダーも越えて。安心してつながる“居場所”
            </h1>

            <p className="mt-6 text-base md:text-lg leading-relaxed text-white/85 max-w-3xl">
              コミュニティサイト <span className="font-semibold text-white">Carat（カラット）</span> は、国境や言語、そしてジェンダーの枠を超えて、人と人が自然につながる“新感覚のコミュニティ”です。
              私たちが目指すのは、非難や差別ではなく、互いを尊重し支え合える、本当の意味での平穏な社会。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/feed"
                className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
              >
                コミュニティを見る
              </Link>
              <Link
                to="/subscribe"
                className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors border border-white/15 backdrop-blur"
              >
                入会・プランを見る
              </Link>
            </div>
          </div>

          <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-5">
              <div className="flex items-center gap-3 text-white">
                <Globe2 className="h-5 w-5" />
                <h3 className="font-semibold">越境するつながり</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                国境・言語の違いを越えて、自然体で会話できる場をつくります。
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-5">
              <div className="flex items-center gap-3 text-white">
                <Users className="h-5 w-5" />
                <h3 className="font-semibold">仲間として育つ</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                マッチング、サロン、掲示板などの仕組みで、理解と連携が深まります。
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur p-5">
              <div className="flex items-center gap-3 text-white">
                <HeartHandshake className="h-5 w-5" />
                <h3 className="font-semibold">尊重と共感</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                リアルな声に触れ、共感し、前に進む力を得られるコミュニティを目指します。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Caratでできること</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            Caratには、会員マッチングやコミュニティサロン、掲示板など、会員同士が出会い、理解し合い、仲間として連携を深めていくための仕組みが揃っています。
            気軽に話せる一方で、人生経験、働き方、恋愛、悩みなどのリアルな声に触れ、共感し、前に進む力を得られる場所でもあります。
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">日常の情報交換から、未来の挑戦まで</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                生活に直結する情報交換から、イベントの告知、創作や活動の発信、ビジネス展開まで。
                会員一人ひとりのコンテンツによって育てていくコミュニティです。
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">あなたらしさを表現できる場所</h3>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                あなたの隠れた才能や取り組み、自分らしさを表現する場所が、ここにあります。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-5xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">安心して参加できる環境づくり</h2>
            </div>

            <p className="mt-4 text-gray-700 leading-relaxed">
              Caratでは、厳格な本人確認（審査）と運営による適切な監視・管理体制のもと、安心してご利用いただける環境づくりに取り組んでいます。
              個人情報やコミュニティ内の安全性に配慮したセキュリティ対策を継続的に強化し、誰もが安心して、落ち着いて参加できる場を維持します。
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900">本人確認（審査）</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  入会時の確認プロセスを通じて、安全で誠実なつながりを守ります。
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900">適切な監視・管理</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  健全なコミュニティ運営のため、運営チームが継続的に見守ります。
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900">セキュリティの継続強化</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  個人情報とコミュニティの安全性に配慮し、対策をアップデートしていきます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 md:px-8 py-14 md:py-20">
        <div className="max-w-4xl">
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-8 md:p-10">
            <p className="text-gray-900 text-lg md:text-xl font-semibold leading-relaxed">
              Caratが、あなたの毎日を支える“ひとつの拠りどころ”になれたら嬉しいです。
            </p>
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-gray-900">運営店主</div>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/subscribe"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  入会・プランを見る
                </Link>
                <Link
                  to="/feed"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors"
                >
                  はじめる
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
