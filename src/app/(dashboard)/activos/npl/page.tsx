'use client';

import { AssetModuleView } from '@/components/modules/assets/AssetModuleView';

export default function NPLPage() {
  return (
    <AssetModuleView
      branch="npl"
      category="Activos / Deuda Distress"
      title="NPL (Non-Performing Loans)"
      description="Créditos fallidos con garantía inmobiliaria, préstamos hipotecarios y carteras en ejecución judicial."
    />
  );
}
