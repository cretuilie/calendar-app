import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          borderRadius: 36,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '6px solid #e5e7eb',
        }}
      >
        <div style={{ height: 52, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 700, fontFamily: 'sans-serif', letterSpacing: 2 }}>
            CALENDAR
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 90,
            fontWeight: 800,
            color: '#111827',
            fontFamily: 'sans-serif',
          }}
        >
          {new Date().getDate()}
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
