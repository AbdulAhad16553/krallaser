import Layout from "@/components/Layout";
import MachinePageSkeleton from "@/common/Skeletons/MachinePage";

export default function MachineLoading() {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="page-container py-8 lg:py-10">
          <MachinePageSkeleton />
        </div>
      </div>
    </Layout>
  );
}
