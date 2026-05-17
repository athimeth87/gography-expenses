// app.jsx — PhotoExpense canvas layout + Tweaks panel

const { useState: useAppState, useEffect: useAppEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "navyShade": "#0A2540",
  "accent": "none",
  "density": "regular",
  "showOcrLabels": true,
  "language": "mixed"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply the tweaked navy on the fly — we just rewrite PE.navy and force re-render
  useAppEffect(() => {
    window.PE.navy = t.navyShade;
    // Re-derive a deeper "navy900" to stay consistent
    window.PE.navy900 = shade(t.navyShade, -16);
    window.PE.navy700 = shade(t.navyShade, -8);
    window.PE.navy500 = shade(t.navyShade, 24);
    window.PE.navy100 = tint(t.navyShade, 0.78);
    window.PE.navy50  = tint(t.navyShade, 0.93);
    window.PE.ink     = t.navyShade;
    // bump a counter on the root to force tree re-render of children that read PE
    document.documentElement.style.setProperty('--pe-navy', t.navyShade);
  }, [t.navyShade]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="overview" title="PhotoExpense"
          subtitle="ระบบบันทึกค่าใช้จ่ายสำหรับทีมช่างภาพ · Admin web + Photographer mobile · Navy / White">
          <DCArtboard id="pf-login" label="01 · Photographer · Login" width={390} height={844}>
            <PhotographerLogin/>
          </DCArtboard>
          <DCArtboard id="pf-dash" label="02 · Photographer · Dashboard" width={390} height={844}>
            <PhotographerDashboard/>
          </DCArtboard>
          <DCArtboard id="pf-trip" label="03 · Photographer · Trip Detail" width={390} height={844}>
            <PhotographerTripDetail/>
          </DCArtboard>
          <DCArtboard id="pf-add" label="04 · Photographer · Add Expense (OCR loop)" width={390} height={844}>
            <PhotographerAddExpense/>
          </DCArtboard>
          <DCArtboard id="pf-history" label="05 · Photographer · Claim History" width={390} height={844}>
            <PhotographerClaimHistory/>
          </DCArtboard>
        </DCSection>

        <DCSection id="admin" title="Admin · Desktop"
          subtitle="ChromeWindow · 1280×800 · Sidebar workspace">
          <DCArtboard id="ad-dash" label="06 · Admin · Dashboard" width={1280} height={830}>
            <AdminDashboard/>
          </DCArtboard>
          <DCArtboard id="ad-trips" label="07 · Admin · Trip Management" width={1280} height={830}>
            <AdminTripManagement/>
          </DCArtboard>
          <DCArtboard id="ad-approval" label="08 · Admin · Approval Queue + Detail (auto-approve demo)" width={1280} height={830}>
            <AdminApprovalQueue/>
          </DCArtboard>
          <DCArtboard id="ad-reports" label="09 · Admin · Reports" width={1280} height={830}>
            <AdminReports/>
          </DCArtboard>
        </DCSection>

        <DCSection id="system" title="Design System"
          subtitle="Tokens, status pills, categories — สรุปองค์ประกอบที่ใช้ในงาน">
          <DCArtboard id="sys-tokens" label="Tokens · Type · Color" width={680} height={520}>
            <TokensSheet/>
          </DCArtboard>
          <DCArtboard id="sys-status" label="Status pills & Categories" width={680} height={520}>
            <StatusSheet/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Brand"/>
        <TweakColor label="Navy primary" value={t.navyShade}
          options={['#0A2540', '#1B2A4E', '#0F1E3D', '#162B5C', '#102A43']}
          onChange={v => setTweak('navyShade', v)}/>
        <TweakRadio label="Density" value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={v => setTweak('density', v)}/>

        <TweakSection label="Behavior"/>
        <TweakToggle label="Show 'AI filled' callouts" value={t.showOcrLabels}
          onChange={v => setTweak('showOcrLabels', v)}/>
        <TweakRadio label="Language hint" value={t.language}
          options={['mixed', 'thai', 'en']}
          onChange={v => setTweak('language', v)}/>

        <TweakSection label="Status accent"/>
        <TweakRadio label="Accent style" value={t.accent}
          options={['none', 'status', 'gold']}
          onChange={v => setTweak('accent', v)}/>
      </TweaksPanel>
    </>
  );
}

// Color helpers used to derive navy ramp from a single shade
function hex(h) {
  h = h.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function rgb(arr) {
  return '#' + arr.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function shade(h, amt) {
  const [r,g,b] = hex(h);
  return rgb([r + amt, g + amt, b + amt]);
}
function tint(h, ratio) {
  const [r,g,b] = hex(h);
  return rgb([r + (255-r)*ratio, g + (255-g)*ratio, b + (255-b)*ratio]);
}

// ─── Token sheet artboards ──────────────────────────────────────
function TokensSheet() {
  const navy = [
    ['navy',    PE.navy],
    ['navy700', PE.navy700],
    ['navy500', PE.navy500],
    ['navy300', PE.navy300],
    ['navy100', PE.navy100],
    ['navy50',  PE.navy50],
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: 32, fontFamily: PE.font, color: PE.ink, boxSizing: 'border-box', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Logo size={36}/>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>PhotoExpense · Visual system</div>
          <div style={{ fontSize: 12, color: PE.ink3, marginTop: 2 }}>Clean corporate · Navy / White · IBM Plex Sans Thai</div>
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>Type · IBM Plex</div>
          <div style={{ marginTop: 12, padding: 16, borderRadius: 12, border: `1px solid ${PE.border}` }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6, color: PE.ink }}>PhotoExpense</div>
            <div style={{ fontSize: 19, fontWeight: 600, color: PE.ink, marginTop: 8 }}>ทริปและเบิกค่าใช้จ่าย · 19 / 600</div>
            <div style={{ fontSize: 14, color: PE.ink2, marginTop: 8, lineHeight: 1.5 }}>
              ระบบบันทึกค่าใช้จ่ายสำหรับทีมช่างภาพและทีมออกกอง · 14 / 400
            </div>
            <div style={{ fontFamily: PE.mono, fontSize: 11, color: PE.ink3, marginTop: 10, letterSpacing: 0.4 }}>
              MONO · ฿ 1,284,500 · E1043 · T1
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>Navy ramp</div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {navy.map(([k, v]) => (
              <div key={k} style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${PE.border}` }}>
                <div style={{ height: 52, background: v }}/>
                <div style={{ padding: '6px 8px', background: '#fff' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: PE.ink }}>{k}</div>
                  <div style={{ fontSize: 9, fontFamily: PE.mono, color: PE.ink3, textTransform: 'uppercase' }}>{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>Spacing & radius</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          {[8, 12, 16, 20, 24, 32].map(s => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{ width: s * 2, height: s * 2, background: PE.navy, borderRadius: s / 4 }}/>
              <div style={{ fontFamily: PE.mono, fontSize: 10, color: PE.ink3, marginTop: 6 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusSheet() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', padding: 32, fontFamily: PE.font, color: PE.ink, boxSizing: 'border-box', overflow: 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>Expense status</div>
      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {Object.keys(STATUS).map(k => <StatusPill key={k} status={k}/>)}
      </div>

      <div style={{ marginTop: 28, fontSize: 11, fontWeight: 700, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>Categories</div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {CATEGORIES.map(c => (
          <div key={c.key} style={{
            padding: 14, borderRadius: 12, border: `1px solid ${PE.border}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: PE.navy50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><CatIcon cat={c.key} size={20} color={PE.navy}/></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: PE.ink }}>{c.label}</div>
              <div style={{ fontSize: 11, color: PE.ink3 }}>{c.th}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, fontSize: 11, fontWeight: 700, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>Buttons</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ padding: '10px 18px', borderRadius: 10, background: PE.navy, color: '#fff', fontSize: 13, fontWeight: 600 }}>Primary action</div>
        <div style={{ padding: '10px 18px', borderRadius: 10, background: '#fff', color: PE.navy, border: `1.4px solid ${PE.border}`, fontSize: 13, fontWeight: 600 }}>Secondary</div>
        <div style={{ padding: '10px 18px', borderRadius: 10, background: PE.greenBg, color: PE.green, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="check" size={14} color={PE.green} strokeWidth={2.4}/> Approve
        </div>
        <div style={{ padding: '10px 18px', borderRadius: 10, background: PE.redBg, color: PE.red, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="x" size={14} color={PE.red} strokeWidth={2.4}/> Reject
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
