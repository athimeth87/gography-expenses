// mobile-photographer-2.jsx — Trip Detail, Add Expense (OCR), Claim History

const { useState: useStateMP2, useEffect: useEffectMP2, useRef: useRefMP2 } = React;

// ─── 3. Trip Detail ─────────────────────────────────────────────
function PhotographerTripDetail() {
  const trip = TRIPS[0];
  const exps = EXPENSES.filter(e => e.trip === trip.id);
  const groups = {};
  exps.forEach(e => { (groups[e.date] = groups[e.date] || []).push(e); });

  return (
    <MobileFrame>
      <div style={{ flex: 1, overflow: 'auto', background: PE.surface }}>
        {/* Header */}
        <div style={{
          background: PE.navy, color: '#fff', padding: '6px 20px 20px',
          borderBottomLeftRadius: 24, borderBottomRightRadius: 24, position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="arrow_left" size={20} color="#fff"/></div>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4, opacity: .8 }}>TRIP · T1</div>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="more" size={20} color="#fff"/></div>
          </div>

          <div style={{ marginTop: 18, fontSize: 22, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.3 }}>
            {trip.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,.75)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="calendar" size={12} color="rgba(255,255,255,.75)"/> {trip.start} – {trip.end}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.4)' }}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="location" size={12} color="rgba(255,255,255,.75)"/> {trip.location}
            </span>
          </div>

          {/* Stats row */}
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            {[
              { l: 'รวม',       v: '฿ ' + thb(trip.totalExpense) },
              { l: 'อนุมัติแล้ว', v: '฿ 18,460', c: '#A4E1B7' },
              { l: 'รออนุมัติ',  v: '฿ 4,670',   c: '#F6D274' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.65)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, color: s.c || '#fff' }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Members avatars */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex' }}>
              {trip.members.map((m, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%', background: ['#3b5b88', '#5276a8', '#7494c0'][i],
                  border: '2px solid ' + PE.navy, marginLeft: i ? -8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600,
                }}>{m[0]}</div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{trip.members.join(' · ')}</span>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '14px 16px 6px', display: 'flex', gap: 8, overflow: 'auto' }}>
          {[
            { l: 'ทั้งหมด', a: true, c: exps.length },
            { l: 'รออนุมัติ', c: exps.filter(e => e.status === 'pending').length },
            { l: 'อนุมัติแล้ว', c: exps.filter(e => e.status === 'approved').length },
            { l: 'ปฏิเสธ', c: exps.filter(e => e.status === 'rejected').length },
          ].map((f, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: f.a ? PE.navy : '#fff',
              color: f.a ? '#fff' : PE.ink2,
              border: f.a ? 'none' : `1px solid ${PE.border}`,
              display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              {f.l}
              <span style={{
                background: f.a ? 'rgba(255,255,255,.18)' : PE.navy50, padding: '1px 7px',
                borderRadius: 999, fontSize: 11, color: f.a ? '#fff' : PE.navy,
              }}>{f.c}</span>
            </div>
          ))}
        </div>

        {/* Expense list grouped by date */}
        {Object.entries(groups).map(([date, items]) => (
          <div key={date} style={{ padding: '10px 16px 0' }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: PE.ink3, letterSpacing: 0.6,
              textTransform: 'uppercase', padding: '6px 4px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'baseline',
            }}>
              <span>{date}</span>
              <span style={{ color: PE.ink2 }}>฿ {thb(items.reduce((s, e) => s + e.amount, 0))}</span>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${PE.borderS}`, overflow: 'hidden' }}>
              {items.map((e, idx) => {
                const cat = CATEGORIES.find(c => c.key === e.cat);
                return (
                  <div key={e.id} style={{
                    padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center',
                    borderTop: idx ? `1px solid ${PE.borderS}` : 'none',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: PE.navy50,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}><CatIcon cat={e.cat} color={PE.navy} size={20}/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: PE.ink }}>{cat.th}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>฿{thb(e.amount)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: PE.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                          {e.store}
                        </span>
                        <StatusPill status={e.status} size="sm"/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ height: 90 }}/>
      </div>

      {/* Floating Add button */}
      <div style={{ position: 'absolute', bottom: 100, right: 20, zIndex: 30 }}>
        <div style={{
          padding: '14px 20px', borderRadius: 16, background: PE.navy, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 14px 28px rgba(10,37,64,.32)',
          fontSize: 14, fontWeight: 600,
        }}>
          <Icon name="plus" size={18} color="#fff" strokeWidth={2.4}/>
          เพิ่มค่าใช้จ่าย
        </div>
      </div>
      <MobileTabBar active="trips"/>
    </MobileFrame>
  );
}
window.PhotographerTripDetail = PhotographerTripDetail;

// ─── 4. Add Expense + OCR animation ─────────────────────────────
function PhotographerAddExpense() {
  // Step machine: 0 = empty form, 1 = receipt picked, 2 = OCR scanning, 3 = OCR done (highlights), 4 = filled form
  const [step, setStep] = useStateMP2(0);
  const [highlight, setHighlight] = useStateMP2(null); // 'date', 'amount', 'store'

  useEffectMP2(() => {
    let timers = [];
    if (step === 2) {
      // Scanning animation
      timers.push(setTimeout(() => setStep(3), 1800));
    }
    if (step === 3) {
      // Highlight fields sequentially
      timers.push(setTimeout(() => setHighlight('date'), 200));
      timers.push(setTimeout(() => setHighlight('amount'), 900));
      timers.push(setTimeout(() => setHighlight('store'), 1500));
      timers.push(setTimeout(() => { setStep(4); setHighlight(null); }, 2300));
    }
    return () => timers.forEach(clearTimeout);
  }, [step]);

  // Auto-loop: 0 → 1 → 2 → 3 → 4 → 0 every ~7s, demonstrating the OCR flow.
  useEffectMP2(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 1500);
      return () => clearTimeout(t);
    }
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 1200);
      return () => clearTimeout(t);
    }
    if (step === 4) {
      const t = setTimeout(() => setStep(0), 3000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const filled = step >= 4;
  const cat = filled ? 'hotel' : null;
  const amount = filled ? '4200.00' : '';
  const date = filled ? '12 พ.ย. 2025' : '';
  const store = filled ? 'Khum Phaya Resort' : '';

  return (
    <MobileFrame>
      <div style={{ flex: 1, overflow: 'auto', background: PE.surface }}>
        {/* Header */}
        <div style={{
          background: '#fff', padding: '6px 16px 12px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: `1px solid ${PE.borderS}`,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: PE.navy50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="arrow_left" size={20} color={PE.navy}/></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: PE.ink }}>เพิ่มค่าใช้จ่าย</div>
          <div style={{ fontSize: 13, color: PE.ink3, fontWeight: 600 }}>บันทึก</div>
        </div>

        {/* Step pill */}
        <div style={{ padding: '12px 16px 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 12px', borderRadius: 999, background: PE.navy50,
            fontSize: 11, fontWeight: 600, color: PE.navy, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <Icon name="sparkle" size={14} color={PE.navy}/>
            {step === 0 && 'อัปโหลดใบเสร็จเพื่อกรอกอัตโนมัติ'}
            {step === 1 && 'รับไฟล์แล้ว · เริ่มสแกน'}
            {step === 2 && 'AI กำลังอ่านใบเสร็จ…'}
            {step === 3 && 'ดึงข้อมูลเสร็จ · แตะดูรายละเอียด'}
            {step === 4 && 'กรอกข้อมูลให้แล้ว · ตรวจสอบ'}
          </div>
        </div>

        {/* Receipt zone */}
        <div style={{ padding: '14px 16px 6px' }}>
          <div style={{
            position: 'relative', borderRadius: 16, overflow: 'hidden',
            background: '#fff', border: `1.6px ${step === 0 ? 'dashed' : 'solid'} ${PE.navy100}`,
            minHeight: 200, padding: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {step === 0 ? (
              <div style={{ textAlign: 'center', padding: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: PE.navy50, margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="camera" size={28} color={PE.navy} strokeWidth={1.7}/>
                </div>
                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: PE.ink }}>ถ่ายรูป หรือเลือกใบเสร็จ</div>
                <div style={{ marginTop: 4, fontSize: 12, color: PE.ink3 }}>JPG · PNG · WEBP สูงสุด 10MB</div>
                <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <div style={{ padding: '8px 14px', borderRadius: 10, background: PE.navy, color: '#fff', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="camera" size={14} color="#fff"/> ถ่ายรูป
                  </div>
                  <div style={{ padding: '8px 14px', borderRadius: 10, background: PE.navy50, color: PE.navy, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="upload" size={14} color={PE.navy}/> อัปโหลด
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <FauxReceipt width={210} scale={1} ocrHighlight={step === 3 ? highlight : null}/>
                {/* Scanning overlay */}
                {step === 2 && (
                  <>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 8,
                      background: 'linear-gradient(180deg, rgba(10,37,64,.05), transparent)',
                      animation: 'pe-scan 1.8s linear infinite',
                    }}/>
                    <div style={{
                      position: 'absolute', left: '10%', right: '10%', top: 0, height: 2,
                      background: `linear-gradient(90deg, transparent, ${PE.navy}, transparent)`,
                      boxShadow: `0 0 20px ${PE.navy}`,
                      animation: 'pe-scanline 1.8s ease-in-out infinite',
                    }}/>
                  </>
                )}
                {step >= 2 && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10, display: 'inline-flex',
                    alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999,
                    background: step >= 3 ? PE.greenBg : PE.navy, color: step >= 3 ? PE.green : '#fff',
                    fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4,
                  }}>
                    <Icon name="sparkle" size={11} color={step >= 3 ? PE.green : '#fff'}/>
                    {step === 2 ? 'AI SCANNING' : 'AI READ ✓'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Category */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase', padding: '4px 4px 8px' }}>หมวด · Category</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {CATEGORIES.map(c => {
                const active = cat === c.key;
                const suggested = step >= 3 && c.key === 'hotel';
                return (
                  <div key={c.key} style={{
                    padding: '8px 12px', borderRadius: 999, background: active ? PE.navy : '#fff',
                    border: `1px solid ${active ? PE.navy : suggested ? PE.navy : PE.border}`,
                    color: active ? '#fff' : PE.ink2, fontSize: 12, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    transition: 'all .2s',
                  }}>
                    <CatIcon cat={c.key} size={14} color={active ? '#fff' : PE.navy}/>
                    {c.th}
                    {suggested && !active && <Icon name="sparkle" size={11} color={PE.navy}/>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount + date */}
          <div style={{ display: 'flex', gap: 10 }}>
            <FormField label="จำนวนเงิน · Amount" sub="THB" highlight={highlight === 'amount'} flex={1.4}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 18, color: PE.ink3, fontWeight: 500 }}>฿</span>
                <span style={{ fontSize: 26, fontWeight: 700, color: PE.ink, letterSpacing: -0.4 }}>
                  {amount || <span style={{ color: PE.ink4 }}>0.00</span>}
                </span>
              </div>
            </FormField>
            <FormField label="วันที่ · Date" highlight={highlight === 'date'} flex={1}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
                <Icon name="calendar" size={14} color={PE.ink2}/>
                <span style={{ fontSize: 13, color: date ? PE.ink : PE.ink4, fontWeight: 500 }}>
                  {date || 'เลือกวันที่'}
                </span>
              </div>
            </FormField>
          </div>

          {/* Store */}
          <FormField label="ร้านค้า · Store" highlight={highlight === 'store'}>
            <div style={{ padding: '4px 0', fontSize: 14, color: store ? PE.ink : PE.ink4, fontWeight: 500 }}>
              {store || 'ระบุชื่อร้าน'}
            </div>
          </FormField>

          {/* Trip */}
          <FormField label="ทริป · Trip">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: PE.navy, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>T1</div>
              <span style={{ fontSize: 14, color: PE.ink, fontWeight: 500 }}>ถ่ายงานเชียงใหม่ Winter Series</span>
            </div>
          </FormField>

          {/* Note */}
          <FormField label="หมายเหตุ · Note">
            <div style={{ padding: '4px 0 8px', minHeight: 36, fontSize: 13, color: PE.ink3, lineHeight: 1.5 }}>
              {filled ? 'พักคืนแรก 2 ห้อง · มี breakfast รวม' : 'เพิ่มรายละเอียด…'}
            </div>
          </FormField>
        </div>

        {/* Submit */}
        <div style={{ padding: '4px 16px 14px' }}>
          <button style={{
            width: '100%', height: 52, borderRadius: 14, background: PE.navy, color: '#fff',
            border: 0, fontFamily: PE.font, fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 10px 22px rgba(10,37,64,.22)',
            opacity: filled ? 1 : 0.65, transition: 'opacity .3s',
          }}>
            ส่งเบิกค่าใช้จ่าย <Icon name="arrow_right" size={16} color="#fff"/>
          </button>
        </div>
      </div>
      {/* Keyframes */}
      <style>{`
        @keyframes pe-scanline {
          0% { top: 8%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 92%; opacity: 0; }
        }
        @keyframes pe-scan {
          0%,100% { background-position: 0 0; }
          50% { background-position: 0 100%; }
        }
      `}</style>
    </MobileFrame>
  );
}

function FormField({ label, sub, highlight, flex, children }) {
  return (
    <div style={{
      flex, padding: '10px 14px', borderRadius: 12,
      background: '#fff', border: `1.4px solid ${highlight ? PE.navy : PE.border}`,
      transition: 'border-color .25s, box-shadow .25s',
      boxShadow: highlight ? `0 0 0 4px ${PE.navy50}` : 'none',
      position: 'relative',
    }}>
      {highlight && (
        <div style={{ position: 'absolute', top: -8, right: 10,
          background: PE.navy, color: '#fff', borderRadius: 6, padding: '2px 6px',
          fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          <Icon name="sparkle" size={10} color="#fff"/> AI FILLED
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: PE.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: PE.ink4, fontWeight: 600 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}
window.PhotographerAddExpense = PhotographerAddExpense;

// ─── 5. Claim History ───────────────────────────────────────────
function PhotographerClaimHistory() {
  const items = EXPENSES.slice(0, 9);
  return (
    <MobileFrame>
      <div style={{ flex: 1, overflow: 'auto', background: PE.surface }}>
        {/* Header */}
        <div style={{ padding: '6px 20px 8px', background: '#fff', borderBottom: `1px solid ${PE.borderS}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: PE.ink, letterSpacing: -0.4 }}>ประวัติการเบิก</div>
            <div style={{
              width: 38, height: 38, borderRadius: 12, background: PE.navy50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="filter" size={18} color={PE.navy}/></div>
          </div>
          {/* Search */}
          <div style={{
            marginTop: 12, height: 44, borderRadius: 12, background: PE.navy50,
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
          }}>
            <Icon name="search" size={18} color={PE.ink3}/>
            <span style={{ fontSize: 14, color: PE.ink4 }}>ค้นหารายการเบิก…</span>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{ padding: 16, display: 'flex', gap: 8 }}>
          {[
            { l: 'รวมทั้งหมด', v: '฿ 26,180', c: PE.navy },
            { l: 'จ่ายแล้ว',  v: '฿ 18,640', c: PE.green },
            { l: 'ค้าง',     v: '฿ 7,540',  c: PE.amber },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: PE.ink3, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.c, marginTop: 2, letterSpacing: -0.3 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Status segmented */}
        <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
          {['ทั้งหมด', 'รออนุมัติ', 'อนุมัติแล้ว', 'ถูกปฏิเสธ', 'จ่ายแล้ว'].map((l, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: i === 0 ? PE.navy : '#fff',
              color: i === 0 ? '#fff' : PE.ink2,
              border: i === 0 ? 'none' : `1px solid ${PE.border}`,
              whiteSpace: 'nowrap',
            }}>{l}</div>
          ))}
        </div>

        {/* History list with thumbnails */}
        <div style={{ padding: '16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(e => {
            const cat = CATEGORIES.find(c => c.key === e.cat);
            const trip = TRIPS.find(t => t.id === e.trip);
            return (
              <div key={e.id} style={{
                padding: 14, background: '#fff', borderRadius: 14,
                border: `1px solid ${PE.borderS}`, display: 'flex', gap: 12,
              }}>
                {/* Receipt thumb */}
                <div style={{
                  width: 56, height: 70, borderRadius: 8, background: '#FBFAF6',
                  border: `1px solid ${PE.border}`, padding: 6, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  fontFamily: PE.mono, fontSize: 5.5, color: '#8a7a55', overflow: 'hidden',
                }}>
                  <div style={{ height: 4, background: '#d6cbb0', width: '70%' }}/>
                  <div style={{ height: 2, background: '#d6cbb0', width: '50%' }}/>
                  <div style={{ height: 1, background: '#e4dac1' }}/>
                  <div style={{ height: 2, background: '#d6cbb0', width: '80%' }}/>
                  <div style={{ height: 2, background: '#d6cbb0', width: '60%' }}/>
                  <div style={{ height: 1, background: '#e4dac1' }}/>
                  <div style={{ height: 3, background: PE.navy, width: '40%', marginTop: 'auto' }}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: PE.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CatIcon cat={e.cat} size={14} color={PE.navy}/> {cat.th}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: PE.ink, fontVariantNumeric: 'tabular-nums' }}>฿{thb(e.amount)}</div>
                  </div>
                  <div style={{ fontSize: 11, color: PE.ink3, marginTop: 3 }}>{e.store}</div>
                  <div style={{ fontSize: 10.5, color: PE.ink4, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trip.title} · {e.date}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }}>
                    <StatusPill status={e.status} size="sm"/>
                    {e.adminNote && (
                      <span style={{ fontSize: 10.5, color: PE.red, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="note" size={11} color={PE.red}/> เหตุผล
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <MobileTabBar active="history"/>
    </MobileFrame>
  );
}
window.PhotographerClaimHistory = PhotographerClaimHistory;
