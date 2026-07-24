import StatusBar from "../components/StatusBar";

export default function WordLibrary() {
  return (<>
    <StatusBar />
    <div className="flex-1 min-h-0 overflow-y-auto scroll-area">
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <p className="text-hint text-sm">词库功能开发中...</p>
      </div>
    </div>
  </>);
}
