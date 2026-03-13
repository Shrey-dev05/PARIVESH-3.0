"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import PPDashboard from "./pp/page";
import ScrutinyDashboard from "./scrutiny/page";
import MomDashboard from "./mom/page";
import AdminDashboard from "./admin/page";

export default function MasterDashboard() {
  const currentUser = useStore(state => state.currentUser);
  const router = useRouter();

  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'PP':
      return <PPDashboard />;
    case 'SCRUTINY':
      return <ScrutinyDashboard />;
    case 'MOM':
        return <MomDashboard />;
    case 'ADMIN':
        return <AdminDashboard />;
    default:
      return <div>Unauthorized Role</div>;
  }
}
