import type { Metadata } from 'next';
import './styles/pixel.css';

export const metadata: Metadata = {
  title: '개인회생 어드벤처 - 새로운 시작',
  description: '채무자의 개인회생 여정을 담은 어드벤처 게임',
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="game-wrapper min-h-screen bg-pixel-bg">
      {children}
    </div>
  );
}
