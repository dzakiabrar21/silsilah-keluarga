import React, { useState, useCallback, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Info, ZoomIn, ZoomOut, Maximize2,
  ChevronLeft, ChevronRight, User, TreePine
} from 'lucide-react';
import Aurora from './Aurora';

// Palette
// #000000 — hitam pekat
// #1F150C — coklat sangat gelap (background utama)
// #412D15 — coklat medium (aksen, border)
// #E1DCC9 — krem hangat (teks, kartu)

// --- DATA SILSILAH KELUARGA ---
const familyTreeData = {
  name: 'Teungku Haji Glumpang',
  attributes: { desc: 'Asal Mula Keurabat' },
  children: [
    { name: 'Teungku Lampaya' },
    {
      name: 'Teungku Haji Ibrahim',
      attributes: { desc: 'Teungku di Teureubue' },
      children: [
        { name: 'Mardiah' },
        {
          name: 'Tgk. Muda Mat Asyek',
          children: [
            { name: 'Khatijah' },
            { name: 'Nyak Syam Sanget', attributes: { desc: 'Menikah dg Teuku Bentara' } },
            { name: 'Teungku Ibrahim' },
            { name: 'Teungku Ben' },
            {
              name: 'Tgk. Keuchik Harun',
              children: [
                {
                  name: 'Abdullah',
                  attributes: { desc: '' },
                  children: [
                    { name: 'Ainal Mardiah', children: [{ name: 'Saiful' }, { name: 'Ummi' }, { name: 'Hafni' }, { name: 'Asri' }] },
                    { name: 'Hamamah', children: [{ name: 'Muzakkir' }] },
                    { name: 'Husaini' },
                    { name: 'Fauzi', children: [{ name: 'Bella' }, { name: 'Raihan' }] },
                    {
                      name: 'Syukri',
                      attributes: { desc: '' },
                      children: [
                        { name: 'Raudhah' },
                        { name: 'Nadia Nabilah' },
                        { name: 'Syifa Annajwa' },
                        { name: 'Muhammad Dzaki Abrar', attributes: { desc: '' } },
                      ],
                    },
                  ],
                },
                { name: 'Muhammad Yusuf' },
                { name: 'Ali Umar' },
                { name: 'Qamariyah' },
                { name: 'Qamaruddin' },
                { name: 'Utsman', attributes: { desc: 'Pembuat Dokumen' } },
              ],
            },
          ],
        },
        { name: 'Teungku Abdullah' },
        { name: 'Teungku Hasan' },
      ],
    },
    { name: 'Teungku Ahmad' },
    { name: 'Mawa Yat' },
    { name: 'Teungku Haji Syech' },
    { name: 'Teungku Pakeh' },
    { name: 'Khadijah' },
    { name: 'Tgk. Haji Muda Su ud' },
  ],
};

// --- HOOK: Deteksi ukuran layar ---
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
}

// --- HOOK: Deteksi orientasi ---
function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  );
  useEffect(() => {
    const handler = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);
  return isLandscape;
}

// --- CUSTOM NODE (menerima dimensi responsif) ---
const makeRenderCustomNode = (dims, openProfileModal) => ({ nodeDatum, toggleNode }) => {
  const { CARD_W, CARD_H, CARD_R, PHOTO_R, PHOTO_CY, FONT_NAME, FONT_DESC, FONT_INITIALS } = dims;
  const safeId = nodeDatum.name.replace(/[^a-zA-Z0-9]/g, '');
  const hasPhoto = !!nodeDatum.attributes?.imageUrl;
  const avatarUrl = nodeDatum.attributes?.imageUrl || null;
  const hasChildren = !!(nodeDatum.children && nodeDatum.children.length > 0);
  const isCollapsed = !!nodeDatum._children;
  const cx = 0;
  const cardTop = -CARD_H / 2;
  const cardLeft = -CARD_W / 2;
  const initials = nodeDatum.name.split(' ').slice(0, 2).map(w => w[0]).join('');
  const expandBtnR = dims.isMobile ? 12 : 10;

  return (
    <g>
      <defs>
        <clipPath id={`clip-${safeId}`}>
          <circle cx={cx} cy={PHOTO_CY} r={PHOTO_R} />
        </clipPath>
      </defs>

      <g onClick={() => openProfileModal(nodeDatum)} style={{ cursor: 'pointer' }}>
        <rect
          x={cardLeft} y={cardTop}
          width={CARD_W} height={CARD_H}
          rx={CARD_R} ry={CARD_R}
          fill="#E1DCC9"
          stroke="#412D15"
          strokeWidth="1.5"
        />

        {hasPhoto ? (
          <image
            href={avatarUrl}
            x={cx - PHOTO_R} y={PHOTO_CY - PHOTO_R}
            width={PHOTO_R * 2} height={PHOTO_R * 2}
            clipPath={`url(#clip-${safeId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <>
            <circle cx={cx} cy={PHOTO_CY} r={PHOTO_R} fill="#412D15" />
            <text
              x={cx} y={PHOTO_CY + FONT_INITIALS * 0.35}
              textAnchor="middle" fill="#E1DCC9" strokeWidth="0"
              style={{ fontSize: `${FONT_INITIALS}px`, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
            >
              {initials}
            </text>
          </>
        )}

        <circle cx={cx} cy={PHOTO_CY} r={PHOTO_R + 2.5} fill="none" stroke="#412D15" strokeWidth="2" />

        <line
          x1={cardLeft + 12} y1={PHOTO_CY + PHOTO_R + 8}
          x2={cardLeft + CARD_W - 12} y2={PHOTO_CY + PHOTO_R + 8}
          stroke="#412D15" strokeWidth="0.8" opacity="0.4"
        />

        {(() => {
          const words = nodeDatum.name.split(' ');
          const mid = Math.ceil(words.length / 2);
          const line1 = words.slice(0, mid).join(' ');
          const line2 = words.slice(mid).join(' ');
          const baseY = PHOTO_CY + PHOTO_R + (dims.isMobile ? 24 : 32);
          const nameLines = line2 ? 2 : 1;
          const descY = baseY + (FONT_NAME + 3) * nameLines + 2;
          return (
            <>
              <text x={cx} y={baseY} textAnchor="middle" fill="#1F150C" strokeWidth="0"
                style={{ fontSize: `${FONT_NAME}px`, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                {line1}
              </text>
              {line2 && (
                <text x={cx} y={baseY + FONT_NAME + 3} textAnchor="middle" fill="#1F150C" strokeWidth="0"
                  style={{ fontSize: `${FONT_NAME}px`, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                  {line2}
                </text>
              )}
              {nodeDatum.attributes?.desc && (
                <text
                  x={cx} y={descY}
                  textAnchor="middle" fill="#412D15" strokeWidth="0"
                  style={{ fontSize: `${FONT_DESC}px`, fontFamily: 'Inter, sans-serif' }}
                >
                  {nodeDatum.attributes.desc}
                </text>
              )}
            </>
          );
        })()}
      </g>

      {(hasChildren || isCollapsed) && (
        <g onClick={toggleNode} style={{ cursor: 'pointer' }}>
          <circle
            cx={cx} cy={CARD_H / 2 + expandBtnR + 4} r={expandBtnR}
            fill={isCollapsed ? '#412D15' : '#1F150C'}
            stroke="#E1DCC9" strokeWidth="1.5"
          />
          <text
            x={cx} y={CARD_H / 2 + expandBtnR + 4 + expandBtnR * 0.45}
            textAnchor="middle" fill="#E1DCC9" strokeWidth="0"
            style={{ fontSize: `${expandBtnR * 1.3}px`, fontWeight: 900, fontFamily: 'Inter, sans-serif' }}
          >
            {isCollapsed ? '+' : '−'}
          </text>
        </g>
      )}
    </g>
  );
};

// ============================================================
// PROFILE MODAL — Full-screen premium, foto slide kiri + info kanan
// ============================================================
function ProfileModal({ person, onClose, isMobile }) {
  const avatarUrl = person.attributes?.imageUrl
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=412D15&color=E1DCC9&bold=true&size=400`;

  // Bangun daftar foto: imageUrl utama + gallery tambahan
  const galleryImages = [
    avatarUrl,
    ...(person.attributes?.gallery || []),
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const touchStartX = useRef(null);

  const goTo = (idx, dir) => {
    setDirection(dir);
    setActiveIdx(idx);
  };
  const prev = () => goTo((activeIdx - 1 + galleryImages.length) % galleryImages.length, -1);
  const next = () => goTo((activeIdx + 1) % galleryImages.length, 1);

  // Swipe support untuk foto
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) prev();
    else if (dx < -50) next();
    touchStartX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIdx]);

  const infoItems = [
    { icon: <Calendar size={15} />, label: 'Tahun Lahir', value: person.attributes?.birthYear || '—' },
    { icon: <Info size={15} />, label: 'Catatan', value: person.attributes?.bio || '—' },
    { icon: <User size={15} />, label: 'Status', value: person.attributes?.status || '—' },
    { icon: <TreePine size={15} />, label: 'Gelar / Peran', value: person.attributes?.desc || '—' },
  ];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: isMobile ? '0' : '20px' }}
    >
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
      />

      {/* Modal container */}
      <motion.div
        initial={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.94, opacity: 0, y: 16 }}
        animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
        exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        className="relative z-10"
        style={{
          width: '100%',
          height: isMobile ? '92dvh' : 'min(88vh, 820px)',
          maxWidth: isMobile ? '100%' : '1100px',
          borderRadius: isMobile ? '24px 24px 0 0' : '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          background: '#0d0a07',
          border: isMobile ? 'none' : '1.5px solid rgba(65,45,21,0.7)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          position: isMobile ? 'fixed' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          left: isMobile ? 0 : 'auto',
        }}
      >
        {/* Drag handle — mobile */}
        {isMobile && (
          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, zIndex: 30, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(225,220,201,0.25)' }} />
          </div>
        )}

        {/* Tombol tutup */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16, right: 16,
            zIndex: 40,
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(225,220,201,0.2)',
            color: '#E1DCC9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(65,45,21,0.8)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        >
          <X size={16} />
        </button>

        {/* ========== PANEL KIRI — Foto Slideshow ========== */}
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            width: isMobile ? '100%' : '45%',
            height: isMobile ? '48%' : '100%',
            background: '#000',
            overflow: 'hidden',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Foto utama dengan animasi slide */}
          <AnimatePresence custom={direction} initial={false}>
            <motion.img
              key={activeIdx}
              src={galleryImages[activeIdx]}
              alt={`${person.name} foto ${activeIdx + 1}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
          </AnimatePresence>

          {/* Gradient overlay bawah */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '55%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Gradient overlay atas (untuk kejelasan tombol close) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '30%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Navigasi foto — hanya jika > 1 foto */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={prev}
                style={{
                  position: 'absolute', left: 12,
                  top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: isMobile ? 36 : 42, height: isMobile ? 36 : 42,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'background 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(65,45,21,0.8)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <ChevronLeft size={isMobile ? 16 : 20} />
              </button>
              <button
                onClick={next}
                style={{
                  position: 'absolute', right: 12,
                  top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: isMobile ? 36 : 42, height: isMobile ? 36 : 42,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'background 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(65,45,21,0.8)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
              >
                <ChevronRight size={isMobile ? 16 : 20} />
              </button>
            </>
          )}

          {/* Nama & desc — di atas foto (bottom) */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: isMobile ? '16px 20px 20px' : '24px 28px 28px',
            zIndex: 10,
          }}>
            <p style={{
              color: 'rgba(225,220,201,0.55)',
              fontSize: isMobile ? '10px' : '11px',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              fontWeight: 600, marginBottom: 6,
            }}>
              {person.attributes?.desc || 'Anggota Keluarga'}
            </p>
            <h2 style={{
              color: '#E1DCC9',
              fontSize: isMobile ? '22px' : '30px',
              fontWeight: 800,
              fontFamily: '"Inter", sans-serif',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: 12,
            }}>
              {person.name}
            </h2>

            {/* Dot indicators */}
            {galleryImages.length > 1 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > activeIdx ? 1 : -1)}
                    style={{
                      width: i === activeIdx ? 20 : 6,
                      height: 6,
                      borderRadius: 99,
                      background: i === activeIdx ? '#E1DCC9' : 'rgba(225,220,201,0.35)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'width 0.3s, background 0.3s',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Counter foto */}
          {galleryImages.length > 1 && (
            <div style={{
              position: 'absolute', top: isMobile ? 26 : 16, left: 16, zIndex: 20,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
              borderRadius: 99, padding: '3px 10px',
              color: 'rgba(225,220,201,0.7)', fontSize: '11px', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {activeIdx + 1} / {galleryImages.length}
            </div>
          )}
        </div>

        {/* ========== PANEL KANAN — Info Profil ========== */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '20px 20px 32px' : '36px 36px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? 16 : 24,
            background: '#E1DCC9',
          }}
        >
          {/* Label seksi */}
          {!isMobile && (
            <div>
              <p style={{
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
                fontWeight: 700, color: 'rgba(31,21,12,0.4)', marginBottom: 4,
              }}>
                Profil Lengkap
              </p>
              <div style={{ width: 32, height: 2, background: '#412D15', borderRadius: 99 }} />
            </div>
          )}

          {/* Nama besar — hanya desktop */}
          {!isMobile && (
            <div>
              <h2 style={{
                fontSize: 28, fontWeight: 800, color: '#1F150C',
                fontFamily: '"Inter", sans-serif',
                lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 4,
              }}>
                {person.name}
              </h2>
              <p style={{
                fontSize: 13, color: 'rgba(65,45,21,0.65)',
                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
              }}>
                {person.attributes?.desc || 'Anggota Keluarga'}
              </p>
            </div>
          )}

          {/* Info cards dalam grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: isMobile ? 10 : 14,
          }}>
            {infoItems.map(({ icon, label, value }) => (
              <div
                key={label}
                style={{
                  padding: isMobile ? '14px 14px' : '18px 20px',
                  borderRadius: isMobile ? 14 : 16,
                  background: 'rgba(65,45,21,0.09)',
                  border: '1px solid rgba(65,45,21,0.18)',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: 'rgba(65,45,21,0.6)',
                  fontSize: 10, textTransform: 'uppercase',
                  letterSpacing: '0.09em', fontWeight: 700, marginBottom: 8,
                }}>
                  {icon}
                  {label}
                </div>
                <p style={{
                  fontSize: isMobile ? 14 : 16, fontWeight: 700,
                  color: '#1F150C', lineHeight: 1.4,
                }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(65,45,21,0.15)', borderRadius: 99 }} />

          {/* Thumbnail gallery strip — jika ada lebih dari 1 foto */}
          {galleryImages.length > 1 && (
            <div>
              <p style={{
                fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
                fontWeight: 700, color: 'rgba(65,45,21,0.5)', marginBottom: 12,
              }}>
                Foto — {galleryImages.length} foto
              </p>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > activeIdx ? 1 : -1)}
                    style={{
                      flexShrink: 0,
                      padding: 0, border: 'none', cursor: 'pointer',
                      borderRadius: 12,
                      outline: i === activeIdx ? '2.5px solid #412D15' : '2.5px solid transparent',
                      outlineOffset: 2,
                      transition: 'outline-color 0.2s',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      style={{
                        width: isMobile ? 68 : 80,
                        height: isMobile ? 68 : 80,
                        objectFit: 'cover',
                        display: 'block',
                        opacity: i === activeIdx ? 1 : 0.55,
                        transition: 'opacity 0.2s',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder jika hanya 1 foto (avatar generated) */}
          {galleryImages.length === 1 && (
            <div style={{
              padding: isMobile ? '16px' : '24px',
              borderRadius: 16,
              background: 'rgba(65,45,21,0.06)',
              border: '1px dashed rgba(65,45,21,0.25)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 13, color: 'rgba(65,45,21,0.4)', marginBottom: 4 }}>
                📷 Belum ada foto tambahan
              </p>
              <p style={{ fontSize: 11, color: 'rgba(65,45,21,0.3)' }}>
                Galeri foto akan tampil di sini
              </p>
            </div>
          )}

          {/* Badge keluarga bawah */}
          <div style={{
            marginTop: 'auto',
            paddingTop: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#412D15',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TreePine size={14} color="#E1DCC9" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1F150C' }}>Silsilah Keluarga</p>
              <p style={{ fontSize: 10, color: 'rgba(31,21,12,0.45)' }}>Keturunan Teungku Haji Glumpang</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- APP ---
export default function App() {
  const { width, height } = useWindowSize();
  const isLandscape = useOrientation();

  // Mobile = layar kecil. Landscape mobile = HP diputar horizontal
  const isMobile = Math.min(width, height) < 640;
  const isMobileLandscape = isMobile && isLandscape;
  const isTablet = !isMobile && width < 1024;

  const dims = isMobile
    ? { CARD_W: 150, CARD_H: 150, CARD_R: 12, PHOTO_R: 30, PHOTO_CY: -26, FONT_NAME: 11, FONT_DESC: 9, FONT_INITIALS: 13, isMobile: true }
    : isTablet
    ? { CARD_W: 185, CARD_H: 168, CARD_R: 13, PHOTO_R: 37, PHOTO_CY: -31, FONT_NAME: 13, FONT_DESC: 11, FONT_INITIALS: 15, isMobile: false }
    : { CARD_W: 220, CARD_H: 194, CARD_R: 14, PHOTO_R: 44, PHOTO_CY: -36, FONT_NAME: 15, FONT_DESC: 13, FONT_INITIALS: 17, isMobile: false };

  const nodeSize = isMobile ? { x: 185, y: 210 } : isTablet ? { x: 230, y: 248 } : { x: 280, y: 290 };
  const separation = isMobile ? { siblings: 1.05, nonSiblings: 1.2 } : { siblings: 1.2, nonSiblings: 1.5 };

  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.48);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const treeRef = useRef(null);

  // Hitung zoom & translate awal berdasarkan orientasi
  const getInitialZoom = useCallback(() => {
    if (!isMobile) return isTablet ? 0.75 : 1;
    return isMobileLandscape ? 0.55 : 0.48;
  }, [isMobile, isMobileLandscape, isTablet]);

  const getInitialY = useCallback(() => {
    if (!isMobile) return 130;
    return isMobileLandscape ? 70 : 100;
  }, [isMobile, isMobileLandscape]);

  const containerRef = useCallback((el) => {
    if (el) {
      const rect = el.getBoundingClientRect();
      setTranslate({ x: rect.width / 2, y: getInitialY() });
      setZoom(getInitialZoom());
    }
  }, [getInitialZoom, getInitialY]);

  // Saat orientasi berubah, reset posisi pohon
  useEffect(() => {
    setZoom(getInitialZoom());
    setTranslate({ x: width / 2, y: getInitialY() });
  }, [isLandscape]);

  const handleZoomIn = () => setZoom(z => Math.min(z + (isMobile ? 0.15 : 0.2), 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - (isMobile ? 0.15 : 0.2), 0.1));
  const handleReset = () => {
    setZoom(getInitialZoom());
    setTranslate({ x: width / 2, y: getInitialY() });
  };

  const renderNode = makeRenderCustomNode(dims, setSelectedPerson);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col relative font-sans"
      style={{ background: '#1F150C' }}
    >
      {/* Background Aurora */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: isMobile ? 0.12 : 0.18 }}>
        <Aurora colorStops={['#412D15', '#E1DCC9', '#1F150C']} amplitude={0.8} blend={0.45} speed={0.25} />
      </div>

      {/* ===== HEADER: Pill kecil pojok kiri saat landscape mobile, tengah saat portrait ===== */}
      <AnimatePresence mode="wait">
        {isMobileLandscape ? (
          // Landscape mobile — pill kecil pojok kiri atas
          <motion.div
            key="header-landscape"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute z-10 pointer-events-none"
            style={{ top: 10, left: 12 }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.65)',
                border: '1px solid rgba(65,45,21,0.6)',
                backdropFilter: 'blur(16px)',
                borderRadius: 99,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#E1DCC9', opacity: 0.6,
              }} />
              <span style={{
                color: '#E1DCC9',
                fontSize: 12, fontWeight: 700,
                fontFamily: '"Inter", sans-serif',
                letterSpacing: '-0.01em',
              }}>
                Silsilah Keluarga
              </span>
            </div>
          </motion.div>
        ) : (
          // Portrait / desktop — header tengah seperti biasa
          <motion.div
            key="header-portrait"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute w-full flex justify-center z-10 pointer-events-none"
            style={{ top: isMobile ? '12px' : '24px' }}
          >
            <div
              className="text-center rounded-xl"
              style={{
                background: 'rgba(0,0,0,0.60)',
                border: '1px solid rgba(65,45,21,0.6)',
                backdropFilter: 'blur(16px)',
                padding: isMobile ? '10px 20px' : '16px 40px',
              }}
            >
              <h1
                className="font-bold"
                style={{
                  color: '#E1DCC9',
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '-0.02em',
                  fontSize: isMobile ? '22px' : isTablet ? '32px' : '40px',
                  marginBottom: '2px',
                }}
              >
                Silsilah Keluarga
              </h1>
              <p
                className="tracking-widest uppercase"
                style={{ color: 'rgba(225,220,201,0.45)', fontSize: isMobile ? '9px' : '11px' }}
              >
                Keturunan Teungku Haji Glumpang
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanvas Pohon */}
      <div
        className="flex-grow w-full h-full"
        style={{ cursor: 'grab', touchAction: 'none' }}
        ref={containerRef}
      >
        <Tree
          ref={treeRef}
          data={familyTreeData}
          translate={translate}
          zoom={zoom}
          onUpdate={({ translate: t, zoom: z }) => { setTranslate(t); setZoom(z); }}
          orientation="vertical"
          pathFunc="step"
          nodeSize={nodeSize}
          renderCustomNodeElement={renderNode}
          separation={separation}
          initialDepth={1}
          zoomable={true}
          draggable={true}
          scaleExtent={{ min: 0.1, max: 3 }}
          enableLegacyTransitions={false}
        />
      </div>

      {/* Kontrol Zoom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute z-20 flex flex-col gap-2"
        style={{
          bottom: isMobileLandscape ? '12px' : isMobile ? '20px' : '28px',
          right: isMobile ? '12px' : '24px',
        }}
      >
        {[
          { icon: <ZoomIn size={isMobile ? 15 : 18} />, action: handleZoomIn, label: 'Zoom In' },
          { icon: <ZoomOut size={isMobile ? 15 : 18} />, action: handleZoomOut, label: 'Zoom Out' },
          { icon: <Maximize2 size={isMobile ? 13 : 16} />, action: handleReset, label: 'Reset' },
        ].map(({ icon, action, label }) => (
          <button
            key={label}
            onClick={action}
            title={label}
            style={{
              width: isMobileLandscape ? '36px' : isMobile ? '40px' : '46px',
              height: isMobileLandscape ? '36px' : isMobile ? '40px' : '46px',
              background: 'rgba(0,0,0,0.65)',
              border: '1px solid rgba(65,45,21,0.7)',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
              color: '#E1DCC9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(65,45,21,0.75)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
            onTouchStart={e => e.currentTarget.style.background = 'rgba(65,45,21,0.75)'}
            onTouchEnd={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
          >
            {icon}
          </button>
        ))}
      </motion.div>

      {/* Hint rotate — muncul di portrait mobile sebentar */}
      {isMobile && !isMobileLandscape && (
        <motion.div
          key="rotate-hint"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="absolute z-10 pointer-events-none"
          style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
        >
          <motion.div
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: 0, duration: 4, times: [0, 0.1, 0.8, 1] }}
            style={{
              background: 'rgba(0,0,0,0.65)',
              border: '1px solid rgba(65,45,21,0.5)',
              borderRadius: '99px',
              padding: '7px 16px',
              color: 'rgba(225,220,201,0.75)',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 15 }}>📱</span>
            Putar HP untuk tampilan lebih luas
          </motion.div>
        </motion.div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedPerson && (
          <ProfileModal
            key={selectedPerson.name}
            person={selectedPerson}
            onClose={() => setSelectedPerson(null)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
