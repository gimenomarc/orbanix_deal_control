'use client';

import { AssetModuleView } from '@/components/modules/assets/AssetModuleView';

export default function RunOffPage() {
  return (
    <AssetModuleView
      branch="run_off"
      category="Activos / Liquidación"
      title="Run Off"
      description="Cartera de activos en desinversión ordenada, liquidación patrimonial y reducción de balance."
    />
  );
}
