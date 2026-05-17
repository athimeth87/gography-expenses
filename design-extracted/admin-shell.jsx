// admin-shell.jsx — Desktop chrome + sidebar shell for admin screens

const { useState: useStateAS } = React;

function AdminFrame({ children, route = 'dashboard', search = 'photoexpense.co/admin/dashboard' }) {
  return (
    <ChromeWindow width={1280} height={800} tabs={[
      { title: 'PhotoExpense · Admin' },
      { title: 'Sindhorn Midtown — Brief' },
      { title: 'AYANA Studio · Drive' },
    ]} activeIndex={0} url={search}>
      <div style={{ display: 'flex', height: '100%', background: PE.surface, fontFamily: PE.font, color: PE.ink }}>
        <AdminSidebar active={route}/>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </ChromeWindow>
  );
}

function AdminSidebar({ active = 'dashboard' }) {
  const items = [
    { k: 'dashboard', l: 'Dashboard',         th: 'ภาพรวม',         icon: 'grid' },
    { k: 'trips',     l: 'Trip Management',   th: 'ทริปทั้งหมด',     icon: 'folder' },
    { k: 'approval',  l: 'Approval Queue',    th: 'อนุมัติเบิก',     icon: 'inbox', badge: 9 },
    { k: 'expenses',  l: 'All Expenses',      th: 'รายการทั้งหมด',  icon: 'receipt' },
    { k: 'reports',   l: 'Reports',           th: 'รายงาน',         icon: 'chart' },
    { k: 'team',      l: 'Team',              th: 'ทีมงาน',         icon: 'users' },
  ];
  return (
    <aside style={{
      width: 250, background: PE.navy, color: '#fff', display: 'flex', flexDirection: 'column',
      padding: '20px 14px', flexShrink: 0, gap: 4,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 18px' }}>
        <Logo size={32} white={true}/>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>PhotoExpense</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>Admin Workspace</div>
        </div>
      </div>

      {/* Workspace switcher */}
      <div style={{
        margin: '0 4px 14px', padding: '10px 12px', borderRadius: 12,
        background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, background: '#fff', color: PE.navy,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12,
        }}>AY</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>AYANA Studio</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>Workspace · Pro</div>
        </div>
        <Icon name="chevron" size={14} color="rgba(255,255,255,.55)"/>
      </div>

      <div style={{
        padding: '0 14px 6px', fontSize: 10, fontWeight: 600, letterSpacing: 0.8,
        color: 'rgba(255,255,255,.45)', textTransform: 'uppercase',
      }}>Manage</div>

      {items.map(i => {
        const isActive = i.k === active;
        return (
          <div key={i.k} style={{
            padding: '10px 12px', borderRadius: 10,
            background: isActive ? 'rgba(255,255,255,.14)' : 'transparent',
            display: 'flex', alignItems: 'center', gap: 12,
            color: isActive ? '#fff' : 'rgba(255,255,255,.7)',
            fontSize: 13, fontWeight: isActive ? 600 : 500,
            position: 'relative',
          }}>
            {isActive && <div style={{
              position: 'absolute', left: -14, top: 8, bottom: 8, width: 3,
              background: '#fff', borderRadius: 2,
            }}/>}
            <Icon name={i.icon} size={18} color={isActive ? '#fff' : 'rgba(255,255,255,.7)'} strokeWidth={isActive ? 2 : 1.6}/>
            <div style={{ flex: 1 }}>
              <div>{i.l}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 1, fontWeight: 500 }}>{i.th}</div>
            </div>
            {i.badge && (
              <span style={{
                background: '#fff', color: PE.navy, fontSize: 10, fontWeight: 700,
                padding: '1px 7px', borderRadius: 999,
              }}>{i.badge}</span>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 'auto' }}>
        <div style={{
          padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.1)', marginBottom: 10,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Icon name="sparkle" size={16} color="#F6D274"/>
            <div style={{ fontSize: 12, fontWeight: 600 }}>OCR Credits</div>
          </div>
          <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '62%', height: '100%', background: '#F6D274' }}/>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,.7)' }}>620 / 1,000 used this month</div>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: '#fff', color: PE.navy,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12,
          }}>นพ</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>คุณนพดล สังข์ทอง</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>Owner · Admin</div>
          </div>
          <Icon name="settings" size={16} color="rgba(255,255,255,.6)"/>
        </div>
      </div>
    </aside>
  );
}

function AdminTopBar({ title, sub, actions }) {
  return (
    <header style={{
      padding: '20px 28px 18px', background: '#fff',
      borderBottom: `1px solid ${PE.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 11, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>{sub}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: PE.ink, letterSpacing: -0.4, marginTop: 2 }}>{title}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div style={{
          height: 38, borderRadius: 10, background: PE.surface, width: 280,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          border: `1px solid ${PE.border}`,
        }}>
          <Icon name="search" size={16} color={PE.ink3}/>
          <span style={{ fontSize: 13, color: PE.ink4 }}>ค้นหา trip, expense, ช่างภาพ…</span>
          <span style={{ marginLeft: 'auto', fontFamily: PE.mono, fontSize: 10, color: PE.ink3,
            background: '#fff', border: `1px solid ${PE.border}`, padding: '1px 6px', borderRadius: 4 }}>⌘K</span>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: PE.surface,
          border: `1px solid ${PE.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <Icon name="bell" size={18} color={PE.ink2}/>
          <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: PE.red, border: '2px solid #fff' }}/>
        </div>
        {actions}
      </div>
    </header>
  );
}

window.AdminFrame = AdminFrame;
window.AdminSidebar = AdminSidebar;
window.AdminTopBar = AdminTopBar;
