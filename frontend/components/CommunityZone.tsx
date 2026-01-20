import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GroupCard from './GroupCard';
import DiscussionModal from './DiscussionModal';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const CommunityZone: React.FC<{ minimized?: boolean }> = ({ minimized = false }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className={`transition-colors duration-300 border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
      <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-200 bg-slate-100/30'
        }`}>
        <h4 className="font-bold text-sm">{t('community_zone.title')}</h4>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">{t('community_zone.social')}</span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm">
          {t('community_zone.description')}
        </p>
        <ul className="text-sm list-disc list-inside text-slate-300 space-y-1">
          <li>{t('community_zone.feature_1')}</li>
          <li>{t('community_zone.feature_2')}</li>
          <li>{t('community_zone.feature_3')}</li>
          <li>{t('community_zone.feature_4')}</li>
        </ul>
        <div className="flex gap-2 pt-2">
          <button onClick={() => navigate('/community')} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded font-bold">{t('community_zone.join_group')}</button>
          <button onClick={() => {
            navigator.clipboard.writeText('https://tradesense.app/join/community');
            alert(t('community_zone.invite_copied_alert'));
          }} className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700">{t('community_zone.invite_friends')}</button>
        </div>
        <div className="pt-3">
          <h5 className="text-sm font-bold mb-2">{t('community_zone.popular_groups')}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(minimized ? [
              { name: t('community_zone.groups.scalp_name'), members: 324, description: t('community_zone.groups.scalp_desc'), tag: "Crypto" },
              { name: t('community_zone.groups.swing_name'), members: 198, description: t('community_zone.groups.swing_desc'), tag: "Actions" }
            ] : [
              { name: t('community_zone.groups.scalp_name'), members: 324, description: t('community_zone.groups.scalp_desc'), tag: "Crypto" },
              { name: t('community_zone.groups.swing_name'), members: 198, description: t('community_zone.groups.swing_desc'), tag: "Actions" },
              { name: t('community_zone.groups.tech_name'), members: 256, description: t('community_zone.groups.tech_desc'), tag: "Tech" },
              { name: t('community_zone.groups.macro_name'), members: 173, description: t('community_zone.groups.macro_desc'), tag: "Indices" }
            ]).map((g, index) => (
              <GroupCard
                key={`${g.name}-${index}`}
                name={g.name}
                members={g.members}
                description={g.description}
                tag={g.tag}
              />
            ))}
          </div>
          <div
            onClick={() => setIsDiscussionOpen(true)}
            className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <h6 className="font-bold text-sm text-blue-400 flex items-center gap-2">
                <span>🔥</span>
                Trending Discussion
              </h6>
              <span className="text-[10px] text-blue-400 group-hover:scale-110 transition-transform">↗️</span>
            </div>
            <p className="text-xs text-slate-300 mb-2">"Just caught a perfect scalping setup on BTC - 3% gain in 15 minutes!"</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">24 replies</span>
              <span className="text-[10px] text-slate-500">2 hours ago</span>
              <span className="text-[10px] text-blue-400 font-bold ml-auto group-hover:underline">Click to join discussion</span>
            </div>
          </div>
          <div className="mt-3 text-[11px]">
            <Link to="/community" className="text-blue-400 hover:text-blue-300 underline">{t('community_zone.view_community')}</Link>
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          {t('community_zone.coming_soon')}
        </div>
      </div>

      <DiscussionModal
        isOpen={isDiscussionOpen}
        onClose={() => setIsDiscussionOpen(false)}
        discussionTitle="Trending Discussion"
        initialMessage="Just caught a perfect scalping setup on BTC - 3% gain in 15 minutes!"
      />
    </div>
  );
};

export default CommunityZone;