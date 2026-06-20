import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 50, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'sans-serif', letterSpacing: 2 }}>
            CALENDAR
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 86,
            fontWeight: 800,
            color: '#111827',
            fontFamily: 'sans-serif',
          }}
        >
          {new Date().getDate()}
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
