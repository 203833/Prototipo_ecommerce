import SJHeader from "./SJHeader";

export default function PlaceholderScreen({
  title,
  icon,
  desc,
}: {
  title: string;
  icon: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col bg-white pb-4">
      <SJHeader />
      <div className="px-4 pt-3 pb-2 border-b border-sj-gray-200">
        <h1 className="text-lg font-bold text-sj-navy">{title}</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-24 px-8">
        <span className="text-5xl mb-4">{icon}</span>
        <p className="text-sm text-sj-gray-500 text-center">{desc}</p>
      </div>
    </div>
  );
}
