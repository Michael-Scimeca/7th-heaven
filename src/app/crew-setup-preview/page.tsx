'use client';
import { CrewSetPasswordModal } from '@/components/CrewSetPasswordModal';

export default function CrewSetPasswordPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      <CrewSetPasswordModal
        email="alex@7thheaven.com"
        onComplete={() => alert('Password set!')}
      />
    </div>
  );
}
