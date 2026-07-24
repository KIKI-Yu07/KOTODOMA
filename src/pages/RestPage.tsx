import { ArrowLeft } from "lucide-react";
import type { Page } from "../components/BottomNav";
import StatusBar from "../components/StatusBar";

interface Props { onNavigate: (p: Page) => void; }

export default function RestPage({ onNavigate }: Props) {
  return (<>
    <StatusBar />
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <img src="/icons/rest-day.svg" alt="" className="w-64 h-64 mb-6" />
      <h2 className="text-xl font-extrabold text-main mb-2">今日の目標達成！</h2>
      <p className="text-sm text-sub max-w-[280px]">路需慢慢走，休息会吧，去别处发挥想象！</p>
      <button onClick={()=>onNavigate("home")} className="mt-8 px-6 py-3 bg-primary text-white rounded-full text-sm font-bold active:scale-95">
        ホームへ戻る
      </button>
    </div>
  </>);
}
