import Layout from "@/components/Layout";
import PartsPageSkeleton from "@/common/Skeletons/PartsPage";

export default function PartsLoading() {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50">
        <div className="page-container py-8 lg:py-10">
          <PartsPageSkeleton />
        </div>
      </div>
    </Layout>
  );
}
