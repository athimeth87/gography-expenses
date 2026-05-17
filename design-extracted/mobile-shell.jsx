// mobile-photographer.jsx — Photographer-facing iOS screens for PhotoExpense
// Exports (to window): PhotographerLogin, PhotographerDashboard, PhotographerTripDetail,
// PhotographerAddExpense, PhotographerClaimHistory

const { useState, useEffect, useRef } = React;

// ─── Mobile shell helpers ───────────────────────────────────────
function MobileStatusBar({ dark = false }) {
  const c = dark ? '#fff' : PE.navy;
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', fontFamily: PE.font, color: c, fontSize: 14, fontWeight: 600,
      flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill={c}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </g></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill={c}>
          <path d="M7.5 3a6.5 6.5 0 0 1 4.6 1.9l1-1A8 8 0 0 0 7.5 1.5 8 8 0 0 0 1.4 3.9l1 1A6.5 6.5 0 0 1 7.5 3z"/>
          <circle cx="7.5" cy="9" r="1.2"/>
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} strokeOpacity=".4" fill="none"/>
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill={c}/>
          <rect x="22" y="4" width="1.5" height="4" rx="0.5" fill={c} fillOpacity=".5"/>
        </svg>
      </div>
    </div>
  );
}

function MobileFrame({ children, dark = false, bg }) {
  return (
    <div style={{
      width: 390, height: 844, borderRadius: 44, overflow: 'hidden',
      background: bg || (dark ? PE.navy : '#fff'),
      boxShadow: '0 24px 60px rgba(10,37,64,0.18), 0 0 0 1px rgba(10,37,64,.08)',
      position: 'relative', display: 'flex', flexDirection: 'column',
      fontFamily: PE.font, color: PE.ink,
    }}>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 32, borderRadius: 18, background: '#000', zIndex: 50,
      }}/>
      <MobileStatusBar dark={dark}/>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 100,
        background: dark ? 'rgba(255,255,255,.7)' : 'rgba(10,37,64,.4)', zIndex: 60,
      }}/>
    </div>
  );
}

function MobileTabBar({ active = 'home' }) {
  const tabs = [
    { key: 'home',    label: 'หน้าหลัก',  icon: 'home' },
    { key: 'trips',   label: 'ทริป',     icon: 'folder' },
    { key: 'add',     label: 'เพิ่ม',     icon: 'plus' },
    { key: 'history', label: 'ประวัติ',   icon: 'receipt' },
    { key: 'me',      label: 'ฉัน',      icon: 'user' },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${PE.border}`, background: '#fff',
      padding: '8px 10px 26px', display: 'flex', gap: 4, justifyContent: 'space-around',
      flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = t.key === active;
        const isCenter = t.key === 'add';
        if (isCenter) return (
          <div key={t.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: PE.navy,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 18px rgba(10,37,64,.28)',
            }}><Icon name="plus" size={22} color="#fff" strokeWidth={2.2}/></div>
          </div>
        );
        return (
          <div key={t.key} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1,
            color: isActive ? PE.navy : PE.ink4,
          }}>
            <Icon name={t.icon} size={22} color={isActive ? PE.navy : PE.ink4} strokeWidth={isActive ? 2 : 1.6}/>
            <span style={{ fontSize: 10.5, fontWeight: isActive ? 600 : 500 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}
window.MobileFrame = MobileFrame;
window.MobileTabBar = MobileTabBar;
