import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";

interface Props { onNavigate: (p: Page) => void; }

const itemStyle = (visible: boolean, delay: number): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  transform: visible ? "translateY(0)" : "translateY(28px)",
  transition: visible
    ? `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`
    : "none",
});

export default function RestPage({ onNavigate }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (<>
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <img
        src="/icons/rest-day.svg" alt=""
        className="w-64 h-64 mb-6"
        style={itemStyle(visible, 0)}
      />
      <h2
        className="text-xl font-extrabold text-main mb-2"
        style={itemStyle(visible, 120)}
      >
        今日の目標達成！
      </h2>
      <p
        className="text-sm text-sub max-w-[280px]"
        style={itemStyle(visible, 240)}
      >
        路需慢慢走，休息会吧，去别处发挥想象！
      </p>
      <button
        onClick={() => onNavigate("home")}
        className="mt-8 px-6 py-3 bg-primary text-white rounded-full text-sm font-bold active:scale-95"
        style={itemStyle(visible, 360)}
      >
        ホームへ戻る
      </button>
    </div>
  </>);
}
