// mobile-photographer.jsx — Photographer mobile screens for PhotoExpense

const { useState: useStateMP, useEffect: useEffectMP, useRef: useRefMP, useMemo: useMemoMP } = React;

// ─── 1. Login ───────────────────────────────────────────────────
function PhotographerLogin() {
  const [email, setEmail] = useStateMP('eak@photoexpense.co');
  const [pw, setPw]     = useStateMP('••••••••');
  const [focus, setFocus] = useStateMP(null);
  return (
    <MobileFrame bg="#fff">
      <div style={{ flex: 1, padding: '24px 28px 12px', display: 'flex', flexDirection: 'column' }}>
        {/* Brand + decorative arc */}
        <div style={{ position: 'relative', marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo size={40}/>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: PE.navy, letterSpacing: -0.3 }}>PhotoExpense</div>
              <div style={{ fontSize: 12, color: PE.ink3, marginTop: 1 }}>Crew expense claims · v1.0</div>
            </div>
          </div>
          <div style={{
            position: 'absolute', right: -30, top: -10, width: 140, height: 140, borderRadius: '50%',
            border: `1.2px solid ${PE.navy100}`, pointerEvents: 'none',
          }}/>
        </div>

        <div style={{ marginTop: 60 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: PE.navy, letterSpacing: -0.6, lineHeight: 1.15 }}>
            ยินดีต้อนรับ<br/>
            <span style={{ color: PE.ink3, fontWeight: 600 }}>กลับมา</span>
          </div>
          <div style={{ fontSize: 14, color: PE.ink2, marginTop: 10, lineHeight: 1.5 }}>
            ลงชื่อเข้าใช้เพื่อดูทริปและส่งเบิกค่าใช้จ่าย
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { k: 'email', label: 'Email', val: email, set: setEmail, type: 'email' },
            { k: 'pw',    label: 'Password', val: pw, set: setPw, type: 'password' },
          ].map(f => (
            <label key={f.k} style={{
              display: 'block', borderRadius: 12,
              padding: '10px 14px',
              background: '#fff', border: `1.4px solid ${focus === f.k ? PE.navy : PE.border}`,
              transition: 'border-color .2s',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{f.label}</div>
              <input
                type="text"
                value={f.val}
                onChange={e => f.set(e.target.value)}
                onFocus={() => setFocus(f.k)}
                onBlur={() => setFocus(null)}
                style={{
                  width: '100%', border: 0, outline: 'none', background: 'transparent',
                  fontFamily: PE.font, fontSize: 16, color: PE.ink, padding: '2px 0 4px',
                }}
              />
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: PE.ink2 }}>
            <span style={{
              width: 18, height: 18, borderRadius: 5, background: PE.navy,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="check" size={12} color="#fff" strokeWidth={2.4}/></span>
            จดจำการเข้าสู่ระบบ
          </label>
          <a style={{ fontSize: 13, color: PE.navy, fontWeight: 600 }}>ลืมรหัสผ่าน?</a>
        </div>

        <button style={{
          marginTop: 24, height: 54, borderRadius: 14, background: PE.navy, color: '#fff',
          border: 0, fontFamily: PE.font, fontSize: 16, fontWeight: 600, letterSpacing: 0.2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 10px 22px rgba(10,37,64,.22)',
        }}>
          เข้าสู่ระบบ <Icon name="arrow_right" size={18} color="#fff" strokeWidth={2}/>
        </button>

        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: PE.border }}/>
          <span style={{ fontSize: 11, color: PE.ink4, letterSpacing: 0.6 }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: PE.border }}/>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {['Google', 'LINE', 'Apple'].map(p => (
            <div key={p} style={{
              flex: 1, height: 46, borderRadius: 12, border: `1.4px solid ${PE.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: PE.ink,
            }}>{p}</div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 13, color: PE.ink3, paddingTop: 24 }}>
          ยังไม่มีบัญชี? <span style={{ color: PE.navy, fontWeight: 600 }}>ติดต่อแอดมิน</span>
        </div>
      </div>
    </MobileFrame>
  );
}
window.PhotographerLogin = PhotographerLogin;

// ─── 2. Dashboard ───────────────────────────────────────────────
function PhotographerDashboard() {
  const myTrips = TRIPS.slice(0, 3);
  const stats = [
    { k: 'pending',  label: 'รออนุมัติ',     val: 6,    sub: '฿ 5,180', color: PE.amber, bg: PE.amberBg },
    { k: 'approved', label: 'อนุมัติแล้ว',   val: 12,   sub: '฿ 18,640', color: PE.green, bg: PE.greenBg },
    { k: 'rejected', label: 'ถูกปฏิเสธ',     val: 2,    sub: '฿ 320',   color: PE.red,   bg: PE.redBg },
  ];
  return (
    <MobileFrame>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '4px 20px 16px', background: PE.navy, color: '#fff',
          borderBottomLeftRadius: 26, borderBottomRightRadius: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', fontSize: 15, letterSpacing: 0.4,
              }}>เอ</div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>สวัสดี</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>คุณเอกชัย ฤทธิรงค์</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                <Icon name="bell" size={20} color="#fff"/>
                <div style={{
                  position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%',
                  background: '#FF6B6B', border: '2px solid ' + PE.navy,
                }}/>
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div style={{
            marginTop: 18, padding: 18, borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.04))',
            border: '1px solid rgba(255,255,255,.14)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Total claimed · this month
                </div>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, marginTop: 6, lineHeight: 1 }}>
                  ฿ 24,140
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="arrow_up" size={12} color="#A4E1B7" strokeWidth={2.4}/>
                  <span style={{ color: '#A4E1B7', fontWeight: 600 }}>+12.4%</span> vs last month
                </div>
              </div>
              {/* tiny sparkline */}
              <svg width="92" height="46" viewBox="0 0 92 46">
                <polyline fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.6"
                  points="2,32 14,24 26,28 38,18 50,22 62,12 74,16 88,6"/>
                <polyline fill="rgba(255,255,255,.12)" stroke="none"
                  points="2,32 14,24 26,28 38,18 50,22 62,12 74,16 88,6 88,44 2,44"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px 8px' }}>
          {stats.map(s => (
            <div key={s.k} style={{
              flex: 1, padding: 12, borderRadius: 14, background: '#fff',
              border: `1px solid ${PE.borderS}`,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              }}>
                <Icon name={s.k === 'pending' ? 'clock' : s.k === 'approved' ? 'check' : 'x'} size={16} color={s.color} strokeWidth={2.2}/>
              </div>
              <div style={{ fontSize: 11, color: PE.ink3, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: PE.ink, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: PE.ink3, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Trips section */}
        <div style={{ padding: '8px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>ทริปของฉัน</div>
            <div style={{ fontSize: 12, color: PE.ink3 }}>3 ทริปที่กำลังดำเนินอยู่</div>
          </div>
          <span style={{ fontSize: 13, color: PE.navy, fontWeight: 600 }}>ดูทั้งหมด</span>
        </div>

        <div style={{ padding: '8px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myTrips.map((t, i) => (
            <div key={t.id} style={{
              padding: 14, borderRadius: 16, background: '#fff',
              border: `1px solid ${PE.borderS}`,
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              {/* Stripe accent */}
              <div style={{
                width: 48, height: 56, borderRadius: 12,
                background: i === 0 ? PE.navy : PE.navy50,
                color: i === 0 ? '#fff' : PE.navy,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', flexShrink: 0,
              }}>
                <div style={{ fontSize: 9, fontWeight: 600, opacity: .8, letterSpacing: 0.5 }}>
                  {t.start.split(' ')[1]?.toUpperCase()}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{t.start.split(' ')[0]}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: PE.ink, lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{t.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, color: PE.ink3, fontSize: 11 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Icon name="location" size={11} color={PE.ink3}/> {t.location}
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: PE.ink4 }}/>
                  <span>{t.claims} claims</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: PE.borderS, overflow: 'hidden' }}>
                    <div style={{ width: `${[70, 45, 25][i]}%`, height: '100%', background: PE.navy, borderRadius: 2 }}/>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: PE.ink2 }}>฿ {thb(t.totalExpense)}</span>
                </div>
              </div>
              <Icon name="chevron" size={16} color={PE.ink4}/>
            </div>
          ))}
        </div>

        {/* Recent claims */}
        <div style={{ padding: '14px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>เบิกล่าสุด</div>
          <span style={{ fontSize: 13, color: PE.navy, fontWeight: 600 }}>ทั้งหมด</span>
        </div>

        <div style={{ padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {EXPENSES.filter(e => e.user === 'เอก').slice(0, 4).map(e => {
            const cat = CATEGORIES.find(c => c.key === e.cat);
            return (
              <div key={e.id} style={{
                padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: `1px solid ${PE.borderS}`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: PE.navy50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}><CatIcon cat={e.cat} color={PE.navy} size={20}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: PE.ink, lineHeight: 1.3 }}>{cat.th}</div>
                  <div style={{ fontSize: 11, color: PE.ink3, marginTop: 2 }}>{e.store} · {e.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>฿{thb(e.amount)}</div>
                  <div style={{ marginTop: 4 }}><StatusPill status={e.status} size="sm"/></div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height: 8 }}/>
      </div>
      <MobileTabBar active="home"/>
    </MobileFrame>
  );
}
window.PhotographerDashboard = PhotographerDashboard;
