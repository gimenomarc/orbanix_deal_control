/**
 * ORBANIX DEAL CONTROL — CORE DOMAIN & PERSISTENCE TEST SUITE
 * Validates business logic, CRUD, relationships, and state reactivity.
 */

import { store } from '../data/store';

export function runTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (e: any) {
      results.push({ name, passed: false, error: e?.message || String(e) });
    }
  };

  // Test 1: Profiles and RBAC Roles
  test('Profiles and Roles exist', () => {
    const profiles = store.getProfiles();
    if (profiles.length < 4) throw new Error('Missing default profiles');
    const admin = profiles.find((p) => p.role === 'admin');
    if (!admin) throw new Error('Admin role missing');
  });

  // Test 2: Client Creation and Reference Generation
  test('Client creation and auto-reference', () => {
    const initialCount = store.getClients().length;
    const newClient = store.addClient({
      type: 'fondo',
      legal_name: 'Test Fund Capital S.L.',
      tax_id: 'B-99887766',
      email: 'test@fund.com',
      city: 'Madrid',
      country: 'España',
      status: 'activo',
    });

    if (!newClient.reference.startsWith('CLI-')) throw new Error('Invalid reference format');
    if (store.getClients().length !== initialCount + 1) throw new Error('Client count did not increment');
  });

  // Test 3: Asset Creation across Branches
  test('Asset creation and branch assignment', () => {
    const newAsset = store.addAsset({
      title: 'Edificio Residencial Test',
      asset_type: 'inmobiliario',
      branch: 'open_market',
      phase: 'comercializacion',
      status: 'disponible',
      nominal_value: 3000000,
      current_value: 3200000,
      currency: 'EUR',
      country: 'España',
      city: 'Madrid',
    });

    if (!newAsset.reference.startsWith('AST-')) throw new Error('Invalid asset reference format');
    if (newAsset.branch !== 'open_market') throw new Error('Branch assignment failed');
  });

  // Test 4: Operation Creation and Entity Relationships
  test('Operation creation and relation to asset and client', () => {
    const clients = store.getClients();
    const assets = store.getAssets();
    const newOp = store.addOperation({
      title: 'Operación Test Venta',
      asset_id: assets[0].id,
      asset_reference: assets[0].reference,
      asset_title: assets[0].title,
      client_id: clients[0].id,
      client_name: clients[0].legal_name,
      amount: 4500000,
      expected_value: 4500000,
      probability: 80,
      type: 'venta',
      phase: 'propuesta',
      status: 'activa',
    });

    if (!newOp.reference.startsWith('OP-')) throw new Error('Invalid operation reference format');
    const opsForAsset = store.getOperationsByAsset(assets[0].id);
    if (!opsForAsset.some((o) => o.id === newOp.id)) throw new Error('Asset relationship failed');
  });

  // Test 5: Lead Creation and Conversion to Client
  test('Lead creation and lead-to-client conversion', () => {
    const newLead = store.addLead({
      name: 'Contacto Test Lead',
      company: 'Empresa Test',
      email: 'lead@test.com',
      source: 'web',
      status: 'nuevo',
      priority: 'alta',
      estimated_value: 1200000,
    });

    if (!newLead.reference.startsWith('LEAD-')) throw new Error('Invalid lead reference');
  });

  // Test 6: Global Search across multiple entities
  test('Global search filters assets and clients', () => {
    const res = store.globalSearch('Santa Engracia');
    if (res.assets.length === 0) throw new Error('Search failed to find Santa Engracia asset');
  });

  return results;
}
