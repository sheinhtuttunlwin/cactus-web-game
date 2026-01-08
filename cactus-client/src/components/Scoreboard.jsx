import React from 'react';

export default function Scoreboard({ open, onClose, playerNames = {}, matchHistory = [], totalRounds = 1, totalScores = {} }) {
  if (!open) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
    },
    modal: {
      width: 'min(720px, 95vw)',
      maxHeight: '80vh',
      overflow: 'auto',
      background: 'rgba(11,18,32,0.98)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: 18,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      color: 'white',
    },
    cell: {
      padding: '8px 12px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.06)',
      fontWeight: 700,
      color: 'white',
    },
    totalsRow: {
      background: 'rgba(255,255,255,0.03)',
    },
    closeRow: {
      marginTop: 12,
      textAlign: 'right',
    },
    btn: {
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.03)',
      cursor: 'pointer',
      fontWeight: 700,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Scoreboard</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.cell}></th>
                <th style={styles.cell}>{playerNames[1] || 'Player 1'}</th>
                <th style={styles.cell}>{playerNames[2] || 'Player 2'}</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalRounds }).map((_, idx) => {
                const r = matchHistory && matchHistory[idx] ? matchHistory[idx] : null;
                const getScore = (roundEntry, pid) => {
                  if (!roundEntry) return '-';
                  if (Array.isArray(roundEntry)) return roundEntry[pid] ?? '-';
                  if (typeof roundEntry === 'object') return roundEntry[pid] ?? roundEntry[String(pid)] ?? '-';
                  return '-';
                };
                return (
                  <tr key={idx}>
                    <td style={styles.cell}>Round {idx + 1}</td>
                    <td style={styles.cell}>{getScore(r, 1)}</td>
                    <td style={styles.cell}>{getScore(r, 2)}</td>
                  </tr>
                );
              })}
              <tr style={styles.totalsRow}>
                <td style={styles.cell}>Total</td>
                <td style={styles.cell}>{(totalScores && (totalScores[1] ?? totalScores['1'])) ?? 0}</td>
                <td style={styles.cell}>{(totalScores && (totalScores[2] ?? totalScores['2'])) ?? 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.closeRow}>
          <button style={styles.btn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
