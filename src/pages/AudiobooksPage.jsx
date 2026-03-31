import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';

const AudiobooksPage = () => {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <Headphones size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
      <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '36px', marginBottom: 12 }}>
        Audiobooks
      </h1>
      <p style={{ opacity: 0.5, marginBottom: 24 }}>
        The audiobooks library is available on the{' '}
        <Link to="/study" style={{ color: 'inherit', textDecoration: 'underline' }}>Study Center</Link>.
      </p>
    </div>
  );
};

export default AudiobooksPage;
