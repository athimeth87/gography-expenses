// admin-screens-2.jsx — Approval Queue (with detail panel) + Reports

const { useState: useStateA2, useEffect: useEffectA2 } = React;

// ─── Approval Queue with split detail ───────────────────────────
function AdminApprovalQueue() {
  const pendingList = EXPENSES.filter(e => ['pending', 'rejected', 'approved'].includes(e.status));
  const [selectedId, setSelectedId] = useStateA2('E1043');
  // approve/reject demo state for the selected row
  const [decision, setDecision] = useStateA2(null); // 'approve' | 'reject' | null

  // Cycle decision animation: null → approve → null every 6s for demo
  useEffectA2(() => {
    let t = setTimeout(() => setDecision('approve'), 3500);
    let t2 = setTimeout(() => setDecision(null), 6500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [selectedId]);

  const selected = pendingList.find(e => e.id === selectedId) || pendingList[0];
  const cat = CATEGORIES.find(c => c.key === selected.cat);
  const trip = TRIPS.find(t => t.id === selected.trip);

  return (
    <AdminFrame route="approval" search="photoexpense.co/admin/approval">
      <AdminTopBar title="อนุมัติเบิกค่าใช้จ่าย" sub={`APPROVAL QUEUE · ${pendingList.filter(e => e.status === 'pending').length} PENDING`}
        actions={
          <>
            <div style={{
              padding: '0 14px', height: 38, borderRadius: 10, background: '#fff', color: PE.ink2,
              border: `1px solid ${PE.border}`,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
            }}>
              <Icon name="download" size={15} color={PE.ink2}/> Export
            </div>
            <div style={{
              padding: '0 14px', height: 38, borderRadius: 10, background: PE.navy, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
            }}>
              <Icon name="check" size={15} color="#fff" strokeWidth={2.2}/> Bulk approve
            </div>
          </>
        }
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* List column */}
        <div style={{ width: 420, borderRight: `1px solid ${PE.border}`, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${PE.borderS}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { l: 'Pending', a: true, c: 9 },
                { l: 'All', c: 12 },
                { l: 'Mine', c: 5 },
              ].map((t, i) => (
                <div key={i} style={{
                  padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: t.a ? PE.navy : 'transparent',
                  color: t.a ? '#fff' : PE.ink2,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {t.l}
                  <span style={{
                    background: t.a ? 'rgba(255,255,255,.2)' : PE.surface, padding: '0px 6px',
                    borderRadius: 999, fontSize: 11, color: t.a ? '#fff' : PE.ink3,
                  }}>{t.c}</span>
                </div>
              ))}
            </div>
            <Icon name="filter" size={16} color={PE.ink3}/>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {pendingList.map(e => {
              const c = CATEGORIES.find(cc => cc.key === e.cat);
              const t = TRIPS.find(tt => tt.id === e.trip);
              const isSel = e.id === selectedId;
              return (
                <div key={e.id} onClick={() => setSelectedId(e.id)} style={{
                  padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
                  borderBottom: `1px solid ${PE.borderS}`, cursor: 'pointer',
                  background: isSel ? PE.navy50 : 'transparent', position: 'relative',
                }}>
                  {isSel && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: PE.navy }}/>}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: isSel ? '#fff' : PE.navy50,
                    border: isSel ? `1px solid ${PE.navy100}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}><CatIcon cat={e.cat} size={18} color={PE.navy}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: PE.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.store}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>฿{thb(e.amount)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: PE.ink3, marginTop: 2 }}>
                      {c.l} · {e.user} · {e.date}
                    </div>
                    <div style={{ fontSize: 11, color: PE.ink4, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <StatusPill status={e.status} size="sm"/>
                      <span style={{ fontSize: 10, color: PE.ink4, fontFamily: PE.mono }}>{e.id}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: PE.surface }}>
          <div style={{ padding: '18px 28px', background: '#fff', borderBottom: `1px solid ${PE.border}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: PE.mono }}>
                  {selected.id} · {trip.id}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: PE.ink, marginTop: 4, letterSpacing: -0.3 }}>{selected.store}</div>
                <div style={{ fontSize: 12, color: PE.ink3, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="user" size={13} color={PE.ink3}/> ส่งโดย {selected.user}
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: PE.ink4 }}/>
                  <Icon name="calendar" size={13} color={PE.ink3}/> {selected.date}
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: PE.ink4 }}/>
                  <span>{trip.title}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: PE.ink3, letterSpacing: 0.5, textTransform: 'uppercase' }}>Claim amount</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: PE.ink, letterSpacing: -0.5, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  ฿ {thb(selected.amount)}.00
                </div>
                <div style={{ marginTop: 6 }}>
                  <StatusPill status={decision === 'approve' ? 'approved' : selected.status}/>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px 28px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
            {/* Receipt panel */}
            <div>
              <SectionLabel>RECEIPT IMAGE</SectionLabel>
              <div style={{
                marginTop: 8, padding: 20, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  padding: 14, background: 'repeating-linear-gradient(45deg, #FBFAF6, #FBFAF6 8px, #F6F2E6 8px, #F6F2E6 16px)',
                  borderRadius: 10, display: 'flex', justifyContent: 'center',
                }}>
                  <FauxReceipt width={220} scale={1}/>
                </div>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${PE.border}`, fontSize: 12, fontWeight: 600, color: PE.ink2, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <Icon name="eye" size={14} color={PE.ink2}/> Open original
                  </div>
                  <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${PE.border}`, fontSize: 12, fontWeight: 600, color: PE.ink2, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <Icon name="download" size={14} color={PE.ink2}/> Download
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <SectionLabel>EXPENSE DETAILS</SectionLabel>
                <div style={{ marginTop: 8, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}`, overflow: 'hidden' }}>
                  <Field k="Category"        v={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CatIcon cat={selected.cat} size={14}/> {cat.l} · {cat.th}</span>}/>
                  <Field k="Amount"          v={`฿ ${thb(selected.amount)}.00`} bold/>
                  <Field k="Expense date"    v={selected.date}/>
                  <Field k="Store"           v={selected.store}/>
                  <Field k="Trip"            v={`${trip.id} · ${trip.title}`}/>
                  <Field k="Photographer"    v={`${selected.user} · @${selected.user.toLowerCase()}`}/>
                  <Field k="Submitted"       v="14 Nov 2025, 09:22"/>
                  <Field k="Note"            v={selected.note} last/>
                </div>
              </div>

              {/* AI OCR readout */}
              <div>
                <SectionLabel>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="sparkle" size={12} color={PE.navy}/> AI OCR · CONFIDENCE
                  </span>
                </SectionLabel>
                <div style={{ marginTop: 8, padding: 14, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}` }}>
                  {[
                    { k: 'Amount match',     v: '฿ 4,200.00', conf: 99 },
                    { k: 'Date match',       v: '12/11/2025', conf: 96 },
                    { k: 'Store name match', v: 'Khum Phaya Resort', conf: 91 },
                    { k: 'Suggested category', v: 'Hotel', conf: 88 },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 60px', gap: 12, padding: '7px 0', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: PE.ink3 }}>{row.k}</span>
                      <span style={{ color: PE.ink, fontWeight: 600 }}>{row.v}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <div style={{ width: 40, height: 4, background: PE.borderS, borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${row.conf}%`, height: '100%', background: row.conf >= 95 ? PE.green : row.conf >= 90 ? PE.navy : PE.amber, borderRadius: 2 }}/>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: PE.ink2, fontVariantNumeric: 'tabular-nums' }}>{row.conf}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div>
                <SectionLabel>ACTIVITY</SectionLabel>
                <div style={{ marginTop: 8, padding: 16, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}` }}>
                  {[
                    { t: 'เอก submitted this claim',          time: 'Today · 09:22', icon: 'upload', color: PE.navy },
                    { t: 'AI OCR scanned receipt (4 fields)',  time: 'Today · 09:22', icon: 'sparkle', color: PE.navy },
                    { t: 'Auto-assigned to you for review',    time: 'Today · 09:23', icon: 'inbox',   color: PE.ink2 },
                    decision === 'approve' && { t: 'You approved this claim', time: 'just now', icon: 'check', color: PE.green },
                  ].filter(Boolean).map((a, i, arr) => (
                    <div key={i} style={{ display: 'flex', gap: 10, position: 'relative', paddingBottom: i === arr.length - 1 ? 0 : 14 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', background: PE.surface, color: a.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: `1px solid ${PE.border}`, zIndex: 1,
                      }}><Icon name={a.icon} size={13} color={a.color}/></div>
                      {i < arr.length - 1 && <div style={{ position: 'absolute', left: 12.5, top: 26, bottom: 0, width: 1, background: PE.border }}/>}
                      <div>
                        <div style={{ fontSize: 12, color: PE.ink, fontWeight: 500 }}>{a.t}</div>
                        <div style={{ fontSize: 11, color: PE.ink3, marginTop: 1 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky action bar */}
          <div style={{
            padding: '14px 28px', background: '#fff', borderTop: `1px solid ${PE.border}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1, fontSize: 12, color: PE.ink3 }}>
              ตรวจสอบเรียบร้อยแล้ว — ดำเนินการอนุมัติเพื่อจ่ายในรอบถัดไป
            </div>
            <div style={{
              padding: '0 18px', height: 40, borderRadius: 10, background: '#fff', color: PE.red,
              border: `1.4px solid ${PE.red}30`,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
            }}>
              <Icon name="x" size={15} color={PE.red} strokeWidth={2.2}/> ปฏิเสธ · Reject
            </div>
            <div style={{
              padding: '0 22px', height: 40, borderRadius: 10,
              background: decision === 'approve' ? PE.green : PE.navy, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
              boxShadow: '0 8px 18px rgba(10,37,64,.18)', transition: 'background .3s',
            }}>
              <Icon name="check" size={15} color="#fff" strokeWidth={2.4}/>
              {decision === 'approve' ? 'อนุมัติแล้ว · Approved' : 'อนุมัติ · Approve'}
            </div>
          </div>
        </div>
      </div>
    </AdminFrame>
  );
}
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 700, color: PE.ink3, letterSpacing: 0.7, textTransform: 'uppercase' }}>{children}</div>
  );
}
function Field({ k, v, last, bold }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, padding: '11px 16px',
      borderBottom: last ? 'none' : `1px solid ${PE.borderS}`, alignItems: 'center',
    }}>
      <span style={{ fontSize: 11, color: PE.ink3, fontWeight: 500 }}>{k}</span>
      <span style={{ fontSize: 13, color: PE.ink, fontWeight: bold ? 700 : 500, fontVariantNumeric: bold ? 'tabular-nums' : 'normal' }}>{v}</span>
    </div>
  );
}
window.AdminApprovalQueue = AdminApprovalQueue;

// ─── Reports ────────────────────────────────────────────────────
function AdminReports() {
  // Stacked bars by category per trip
  const rows = TRIPS.map((t, i) => ({
    trip: t,
    breakdown: [
      { k: 'hotel', v: [0.35, 0.10, 0.45, 0.20][i] },
      { k: 'food',  v: [0.18, 0.25, 0.30, 0.18][i] },
      { k: 'fuel',  v: [0.15, 0.05, 0.10, 0.12][i] },
      { k: 'equip', v: [0.12, 0.40, 0.05, 0.30][i] },
      { k: 'trans', v: [0.10, 0.15, 0.05, 0.12][i] },
      { k: 'other', v: [0.10, 0.05, 0.05, 0.08][i] },
    ],
    total: t.totalExpense,
  }));
  const palette = { hotel: PE.navy, food: '#3B5B88', fuel: '#6B86B0', equip: '#9CB0CE', trans: '#C5D2E3', other: '#E2E9F1' };

  return (
    <AdminFrame route="reports" search="photoexpense.co/admin/reports">
      <AdminTopBar title="รายงาน" sub="REPORTS · YEAR-TO-DATE"
        actions={
          <>
            <div style={{
              padding: '0 14px', height: 38, borderRadius: 10, background: '#fff', color: PE.ink2,
              border: `1px solid ${PE.border}`,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
            }}>
              <Icon name="calendar" size={15} color={PE.ink2}/> Jan – May 2026
            </div>
            <div style={{
              padding: '0 16px', height: 38, borderRadius: 10, background: PE.navy, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600,
            }}>
              <Icon name="download" size={15} color="#fff" strokeWidth={2.2}/> Export
            </div>
          </>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 28px 28px' }}>

        {/* Summary tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { l: 'Total expense',  v: '฿ 1,284,500', sub: '247 records' },
            { l: 'Approved',       v: '฿ 1,108,260', sub: '198 · 86.3%' },
            { l: 'Paid',           v: '฿ 892,400',   sub: '162 · 80.5%' },
            { l: 'Avg / claim',    v: '฿ 5,198',     sub: 'across 14 trips' },
            { l: 'Avg approval',   v: '1.4 days',    sub: '–0.3d vs Q1' },
          ].map((t, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 12, background: '#fff', border: `1px solid ${PE.border}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{t.l}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: PE.ink, marginTop: 4, letterSpacing: -0.3 }}>{t.v}</div>
              <div style={{ fontSize: 11, color: PE.ink3, marginTop: 2 }}>{t.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginTop: 14 }}>
          {/* Stacked breakdown by trip */}
          <div style={{ padding: 22, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>Spend by trip · stacked</div>
            <div style={{ fontSize: 12, color: PE.ink3, marginTop: 2 }}>แยกตามหมวดในแต่ละทริป</div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {rows.map((r, i) => (
                <div key={r.trip.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: PE.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                      <span style={{ fontFamily: PE.mono, fontSize: 10, color: PE.ink3, marginRight: 6 }}>{r.trip.id}</span>
                      {r.trip.title}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>฿ {thb(r.total)}</span>
                  </div>
                  <div style={{ marginTop: 6, height: 18, borderRadius: 5, overflow: 'hidden', display: 'flex', background: PE.borderS }}>
                    {r.breakdown.map((b, j) => (
                      <div key={j} style={{
                        width: `${b.v * 100}%`, height: '100%', background: palette[b.k],
                        borderRight: j < r.breakdown.length - 1 ? '1px solid #fff' : 'none',
                      }}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${PE.borderS}`, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {Object.entries(palette).map(([k, c]) => {
                const cat = CATEGORIES.find(cc => cc.key === k);
                return <Legend key={k} color={c} label={cat.l}/>;
              })}
            </div>
          </div>

          {/* Approval funnel + rejection reasons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 22, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: PE.ink }}>Approval funnel</div>
              <div style={{ fontSize: 11, color: PE.ink3, marginTop: 2 }}>247 claims this year</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { l: 'Submitted',  v: 247, p: 100 },
                  { l: 'Reviewed',   v: 240, p: 97 },
                  { l: 'Approved',   v: 213, p: 86 },
                  { l: 'Paid',       v: 198, p: 80 },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: PE.ink }}>
                      <span>{f.l}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{f.v} <span style={{ color: PE.ink3, fontWeight: 500 }}>· {f.p}%</span></span>
                    </div>
                    <div style={{ marginTop: 4, height: 8, borderRadius: 4, background: PE.borderS, overflow: 'hidden' }}>
                      <div style={{ width: `${f.p}%`, height: '100%', background: PE.navy, borderRadius: 4 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 22, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: PE.ink }}>Rejection reasons</div>
              <div style={{ fontSize: 11, color: PE.ink3, marginTop: 2 }}>34 rejected claims</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { l: 'ใบเสร็จไม่ชัดเจน',   v: 14, p: 42 },
                  { l: 'ไม่อยู่ในขอบเขตทริป', v: 9,  p: 26 },
                  { l: 'หมวดผิด',           v: 6,  p: 18 },
                  { l: 'ใบเสร็จซ้ำ',        v: 3,  p: 9 },
                  { l: 'อื่น ๆ',           v: 2,  p: 5 },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 30px 60px', gap: 10, alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: PE.ink2 }}>{r.l}</span>
                    <span style={{ color: PE.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.v}</span>
                    <div style={{ height: 6, borderRadius: 3, background: PE.borderS, overflow: 'hidden' }}>
                      <div style={{ width: `${r.p * 2}%`, height: '100%', background: PE.red, borderRadius: 3 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Photographer leaderboard */}
        <div style={{ marginTop: 14, padding: 22, background: '#fff', borderRadius: 14, border: `1px solid ${PE.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: PE.ink, letterSpacing: -0.2 }}>Photographer activity</div>
              <div style={{ fontSize: 12, color: PE.ink3, marginTop: 2 }}>ความเคลื่อนไหวของช่างภาพแต่ละคน</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr',
              padding: '8px 12px', fontSize: 10.5, fontWeight: 700, color: PE.ink3,
              letterSpacing: 0.6, textTransform: 'uppercase', borderBottom: `1px solid ${PE.border}`,
            }}>
              <div>Photographer</div>
              <div>Claims</div>
              <div>Approved</div>
              <div>Spend</div>
              <div>Avg / claim</div>
              <div style={{ textAlign: 'right' }}>Rejection</div>
            </div>
            {[
              { n: 'คุณเอกชัย ฤทธิรงค์',  u: 'เอก', c: 38, a: 35, s: 184260, r: 7.9 },
              { n: 'คุณพีรพล ตันติเวช',  u: 'พีท', c: 24, a: 22, s: 92480, r: 8.3 },
              { n: 'คุณเฟิร์น ลีลาพันธ์',  u: 'เฟิร์น', c: 31, a: 27, s: 124900, r: 12.9 },
              { n: 'คุณมิ้น จิรพัฒน์',    u: 'มิ้น', c: 18, a: 18, s: 67120, r: 0 },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr',
                padding: '12px 12px', alignItems: 'center', fontSize: 13,
                borderBottom: i < 3 ? `1px solid ${PE.borderS}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: PE.navy500, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  }}>{p.u[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: PE.ink }}>{p.n}</div>
                    <div style={{ fontSize: 11, color: PE.ink3 }}>@{p.u}</div>
                  </div>
                </div>
                <div style={{ color: PE.ink, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{p.c}</div>
                <div style={{ color: PE.ink, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{p.a}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 100, height: 6, borderRadius: 3, background: PE.borderS, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, p.s / 2000)}%`, height: '100%', background: PE.navy, borderRadius: 3 }}/>
                  </div>
                  <span style={{ fontSize: 12, color: PE.ink, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>฿ {thb(p.s)}</span>
                </div>
                <div style={{ color: PE.ink2, fontVariantNumeric: 'tabular-nums' }}>฿ {thb(Math.round(p.s / p.c))}</div>
                <div style={{ textAlign: 'right', fontWeight: 600, color: p.r < 5 ? PE.green : p.r < 10 ? PE.amber : PE.red, fontVariantNumeric: 'tabular-nums' }}>{p.r.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminFrame>
  );
}
window.AdminReports = AdminReports;
