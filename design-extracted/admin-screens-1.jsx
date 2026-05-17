// admin-screens-1.jsx — Admin Dashboard + Trip Management

const { useState: useStateAD, useEffect: useEffectAD } = React;

// ─── Admin Dashboard ────────────────────────────────────────────
function AdminDashboard() {
  const kpis = [
    { l: 'Total Expenses', th: 'รวมค่าใช้จ่าย',  v: '฿ 1,284,500', d: '+12.4%', up: true, sparkColor: PE.navy },
    { l: 'Pending Claims', th: 'รออนุมัติ',     v: '9',           d: '฿ 32,180', up: null, sparkColor: PE.amber, alert: true },
    { l: 'Approved · MTD', th: 'อนุมัติเดือนนี้', v: '47',          d: '฿ 184,260', up: true, sparkColor: PE.green },
    { l: 'Rejected · MTD', th: 'ปฏิเสธเดือนนี้', v: '3',           d: '฿ 4,820',   up: false, sparkColor: PE.red },
  ];

  // Monthly bars
  const months = [
    { m: 'Aug', v: 0.42 }, { m: 'Sep', v: 0.61 }, { m: 'Oct', v: 0.52 },
    { m: 'Nov', v: 0.78 }, { m: 'Dec', v: 0.68 }, { m: 'Jan', v: 0.84 },
    { m: 'Feb', v: 0.55 }, { m: 'Mar', v: 0.93 }, { m: 'Apr', v: 0.72 },
    { m: 'May', v: 0.88, active: true },
  ];

  // Category donut data
  const catData = [
    { k: 'hotel', l: 'Hotel',         pct: 32, val: '฿ 411k', color: PE.navy },
    { k: 'food',  l: 'Food',          pct: 24, val: '฿ 308k', color: '#3B5B88' },
    { k: 'fuel',  l: 'Fuel',          pct: 18, val: '฿ 231k', color: '#6B86B0' },
    { k: 'equip', l: 'Equipment',     pct: 14, val: '฿ 180k', color: '#9CB0CE' },
    { k: 'trans', l: 'Transportation',pct: 8,  val: '฿ 103k', color: '#C5D2E3' },
    { k: 'other', l: 'Other',         pct: 4,  val: '฿ 51k',  color: '#E2E9F1' },
  ];

  // donut SVG
  let acc = 0;
  const donut = catData.map((c, i) => {
    const start = acc / 100 * 360;
    const end = (acc + c.pct) / 100 * 360;
    acc += c.pct;
    return { ...c, start, end };
  });
  const arc = (cx, cy, r, a0, a1) => {
    const toXY = (a) => [cx + r * Math.cos((a - 90) * Math.PI / 180), cy + r * Math.sin((a - 90) * Math.PI / 180)];
    const [x0, y0] = toXY(a0);
    const [x1, y1] = toXY(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };

  return (
    <AdminFrame route="dashboard">
      <AdminTopBar title="ภาพรวมระบบ" sub="DASHBOARD · MAY 2026"
        actions={
          <div style={{
            padding: '0 16px', height: 38, borderRadius: 10, background: PE.navy, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
          }}>
            <Icon name="plus" size={16} color="#fff" strokeWidth={2.2}/> สร้างทริปใหม่
          </div>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px 28px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{
              padding: 18, borderRadius: 14, background: '#fff', border: `1px solid ${PE.border}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: PE.ink3, letterSpacing: 0.5, textTransform: 'uppercase' }}>{k.l}</div>
                  <div style={{ fontSize: 10, color: PE.ink4, marginTop: 2 }}>{k.th}</div>
                </div>
                {k.alert && <span style={{
                  fontSize: 10, fontWeight: 700, color: PE.amber, background: PE.amberBg,
                  padding: '2px 8px', borderRadius: 999, letterSpacing: 0.4,
                }}>NEEDS REVIEW</span>}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: PE.ink, marginTop: 10, letterSpacing: -0.5 }}>{k.v}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: k.up === true ? PE.green : k.up === false ? PE.red : PE.ink3,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  {k.up === true && <Icon name="arrow_up" size={11} color={PE.green} strokeWidth={2.4}/>}
                  {k.up === false && <Icon name="arrow_up" size={11} color={PE.red} strokeWidth={2.4} />}
                  {k.d}
                </span>
                <svg width="60" height="22" viewBox="0 0 60 22">
                  <polyline fill="none" stroke={k.sparkColor} strokeWidth="1.5"
                    points={i % 2 ? '0,16 10,14 20,17 30,8 40,11 50,4 60,7' : '0,18 10,12 20,15 30,9 40,6 50,10 60,4'}
                    strokeOpacity=".9"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Main 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 14, marginTop: 14 }}>
          {/* Expenses over time */}
          <div style={{ padding: 22, borderRadius: 14, background: '#fff', border: `1px solid ${PE.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>Expenses over time</div>
                <div style={{ fontSize: 12, color: PE.ink3, marginTop: 2 }}>ค่าใช้จ่ายแยกตามเดือน · 10 เดือนล่าสุด</div>
              </div>
              <div style={{ display: 'flex', gap: 4, padding: 3, background: PE.surface, borderRadius: 8 }}>
                {['Monthly', 'Weekly', 'Daily'].map((s, i) => (
                  <div key={i} style={{
                    padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: i === 0 ? '#fff' : 'transparent',
                    color: i === 0 ? PE.navy : PE.ink3,
                    boxShadow: i === 0 ? '0 1px 3px rgba(10,37,64,.08)' : 'none',
                  }}>{s}</div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={{ marginTop: 22, height: 200, position: 'relative' }}>
              {/* gridlines */}
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  position: 'absolute', left: 28, right: 0, top: i * 50,
                  height: 1, background: i === 4 ? PE.border : PE.borderS,
                }}/>
              ))}
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  position: 'absolute', left: 0, top: i * 50 - 6, fontSize: 10, color: PE.ink4, fontFamily: PE.mono,
                }}>{['200k', '150k', '100k', '50k', '0'][i]}</div>
              ))}
              {/* bars */}
              <div style={{ position: 'absolute', left: 28, right: 0, bottom: 0, top: 0, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '0 4px' }}>
                {months.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{
                        width: '100%', height: `${m.v * 180}px`,
                        background: m.active ? PE.navy : PE.navy100,
                        borderRadius: '4px 4px 0 0', position: 'relative',
                      }}>
                        {m.active && (
                          <div style={{
                            position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                            background: PE.navy, color: '#fff', padding: '4px 8px', borderRadius: 6,
                            fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
                          }}>฿ 184,260</div>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: PE.ink3, fontWeight: 500 }}>{m.m}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 18, paddingTop: 14, borderTop: `1px solid ${PE.borderS}` }}>
              <Legend color={PE.navy} label="Approved"/>
              <Legend color={PE.amber} label="Pending"/>
              <Legend color={PE.red} label="Rejected"/>
              <Legend color={PE.blue} label="Paid"/>
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ padding: 22, borderRadius: 14, background: '#fff', border: `1px solid ${PE.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>By Category</div>
            <div style={{ fontSize: 12, color: PE.ink3, marginTop: 2 }}>YTD · ฿ 1.28M</div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <svg width="170" height="170" viewBox="0 0 170 170">
                {donut.map((d, i) => (
                  <path key={i} d={arc(85, 85, 65, d.start + 1, d.end - 1)}
                    stroke={d.color} strokeWidth="22" fill="none" strokeLinecap="butt"/>
                ))}
                <text x="85" y="80" textAnchor="middle" fontSize="11" fill={PE.ink3} fontFamily={PE.font} fontWeight="600">Total</text>
                <text x="85" y="98" textAnchor="middle" fontSize="20" fill={PE.ink} fontFamily={PE.font} fontWeight="700">฿ 1.28M</text>
              </svg>
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catData.map(c => (
                <div key={c.k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: c.color }}/>
                  <span style={{ flex: 1, fontSize: 12, color: PE.ink, fontWeight: 500 }}>{c.l}</span>
                  <span style={{ fontSize: 11, color: PE.ink3, fontVariantNumeric: 'tabular-nums' }}>{c.pct}%</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums', minWidth: 50, textAlign: 'right' }}>{c.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent pending + Top trips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 14 }}>
          {/* Pending approvals */}
          <div style={{ padding: 22, borderRadius: 14, background: '#fff', border: `1px solid ${PE.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>Pending approvals</div>
                <div style={{ fontSize: 12, color: PE.ink3, marginTop: 2 }}>9 รายการรออนุมัติ · ฿ 32,180</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: PE.navy }}>View queue →</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' }}>
              {EXPENSES.filter(e => e.status === 'pending').slice(0, 5).map((e, i) => {
                const cat = CATEGORIES.find(c => c.key === e.cat);
                const trip = TRIPS.find(t => t.id === e.trip);
                return (
                  <div key={e.id} style={{
                    padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 12,
                    borderTop: i ? `1px solid ${PE.borderS}` : 'none',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, background: PE.navy50,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><CatIcon cat={e.cat} color={PE.navy} size={18}/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: PE.ink }}>{e.store}</div>
                      <div style={{ fontSize: 11, color: PE.ink3 }}>{cat.l} · {trip.title.slice(0, 24)}… · {e.user}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>฿{thb(e.amount)}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, background: PE.greenBg, color: PE.green,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><Icon name="check" size={14} color={PE.green} strokeWidth={2.4}/></div>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, background: PE.redBg, color: PE.red,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><Icon name="x" size={14} color={PE.red} strokeWidth={2.4}/></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top trips */}
          <div style={{ padding: 22, borderRadius: 14, background: '#fff', border: `1px solid ${PE.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>Top trips · spend</div>
            <div style={{ fontSize: 12, color: PE.ink3, marginTop: 2 }}>ทริปที่มีค่าใช้จ่ายสูงสุดเดือนนี้</div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TRIPS.slice(0, 4).map((t, i) => (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: PE.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{t.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>฿ {thb(t.totalExpense)}</span>
                  </div>
                  <div style={{ marginTop: 6, height: 6, borderRadius: 3, background: PE.borderS, overflow: 'hidden' }}>
                    <div style={{ width: `${[100, 27, 16, 56][i]}%`, height: '100%', background: PE.navy, borderRadius: 3 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminFrame>
  );
}
function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: PE.ink2, fontWeight: 500 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }}/> {label}
    </div>
  );
}
window.AdminDashboard = AdminDashboard;

// ─── Trip Management ────────────────────────────────────────────
function AdminTripManagement() {
  return (
    <AdminFrame route="trips" search="photoexpense.co/admin/trips">
      <AdminTopBar title="ทริปทั้งหมด" sub="TRIP MANAGEMENT · 4 ACTIVE"
        actions={
          <div style={{
            padding: '0 16px', height: 38, borderRadius: 10, background: PE.navy, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
          }}>
            <Icon name="plus" size={16} color="#fff" strokeWidth={2.2}/> สร้างทริปใหม่
          </div>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px 28px' }}>
        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {['All trips · 14', 'Active · 4', 'Closed · 9', 'Draft · 1'].map((l, i) => (
            <div key={i} style={{
              padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: i === 0 ? PE.navy : '#fff',
              color: i === 0 ? '#fff' : PE.ink2,
              border: i === 0 ? 'none' : `1px solid ${PE.border}`,
            }}>{l}</div>
          ))}
          <div style={{ flex: 1 }}/>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: PE.ink2, padding: '7px 12px', background: '#fff', border: `1px solid ${PE.border}`, borderRadius: 999 }}>
            <Icon name="calendar" size={14} color={PE.ink2}/> Last 90 days
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: PE.ink2, padding: '7px 12px', background: '#fff', border: `1px solid ${PE.border}`, borderRadius: 999 }}>
            <Icon name="filter" size={14} color={PE.ink2}/> Filters
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}`, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 2.6fr 1fr 1.3fr 1fr 1.2fr 0.6fr',
            padding: '12px 18px', background: PE.surface,
            fontSize: 10.5, fontWeight: 700, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase',
            borderBottom: `1px solid ${PE.border}`,
          }}>
            <div></div>
            <div>Trip</div>
            <div>Date</div>
            <div>Photographers</div>
            <div>Claims</div>
            <div style={{ textAlign: 'right' }}>Total · ฿</div>
            <div></div>
          </div>
          {TRIPS.map((t, i) => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: '40px 2.6fr 1fr 1.3fr 1fr 1.2fr 0.6fr',
              padding: '14px 18px', alignItems: 'center',
              borderBottom: i < TRIPS.length - 1 ? `1px solid ${PE.borderS}` : 'none',
              fontSize: 13,
            }}>
              <input type="checkbox" style={{ accentColor: PE.navy, width: 16, height: 16 }}/>
              <div>
                <div style={{ fontWeight: 600, color: PE.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 9, fontFamily: PE.mono, color: PE.ink3,
                    border: `1px solid ${PE.border}`, padding: '1px 5px', borderRadius: 4,
                  }}>{t.id}</span>
                  {t.title}
                </div>
                <div style={{ fontSize: 11, color: PE.ink3, marginTop: 2 }}>{t.client} · {t.location}</div>
              </div>
              <div style={{ fontSize: 12, color: PE.ink2, fontVariantNumeric: 'tabular-nums' }}>
                <div>{t.start}</div>
                <div style={{ color: PE.ink4 }}>→ {t.end}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex' }}>
                  {t.members.map((m, j) => (
                    <div key={j} style={{
                      width: 26, height: 26, borderRadius: '50%', background: PE.navy500, color: '#fff',
                      border: '2px solid #fff', marginLeft: j ? -8 : 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>{m[0]}</div>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: PE.ink3 }}>{t.members.length}</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: PE.borderS, overflow: 'hidden' }}>
                    <div style={{ width: `${[70, 50, 25, 100][i]}%`, height: '100%', background: t.status === 'active' ? PE.navy : PE.green, borderRadius: 3 }}/>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: PE.ink2 }}>{t.claims}</span>
                </div>
                <div style={{ fontSize: 10.5, color: PE.ink3, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.status === 'active' ? PE.green : PE.gray }}/>
                  {t.status === 'active' ? 'Active' : 'Closed'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>
                {thb(t.totalExpense)}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Icon name="more" size={18} color={PE.ink3}/>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: PE.ink3 }}>Showing 4 of 14 trips</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['Prev', '1', '2', '3', '…', '14', 'Next'].map((p, i) => (
              <div key={i} style={{
                minWidth: 32, padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: p === '1' ? PE.navy : '#fff', color: p === '1' ? '#fff' : PE.ink2,
                border: p === '1' ? 'none' : `1px solid ${PE.border}`,
                textAlign: 'center',
              }}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </AdminFrame>
  );
}
window.AdminTripManagement = AdminTripManagement;
