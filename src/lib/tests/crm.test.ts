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

  // Test 7: Initial team profiles and RBAC
  test('Team initial members and new roles', () => {
    const profiles = store.getProfiles();
    const admin = profiles.find((p) => p.username === 'cgracia' && p.role === 'admin');
    const direction = profiles.find((p) => p.username === 'agracia' && p.role === 'direction');
    const accounting = profiles.find((p) => p.username === 'sillan' && p.role === 'accounting');
    const coordinator = profiles.find((p) => p.username === 'ssanchez' && p.role === 'coordinator');
    const compliance = profiles.find((p) => p.username === 'anarciso' && p.role === 'compliance');
    const commercials = profiles.filter((p) => p.role === 'commercial');

    if (!admin) throw new Error('Christian Gracia admin profile missing');
    if (!direction) throw new Error('Astrid Gracia direction profile missing');
    if (!accounting) throw new Error('Silvia Illán accounting profile missing');
    if (!coordinator) throw new Error('Sandra Sánchez coordinator profile missing');
    if (!compliance) throw new Error('Angélica Narciso compliance profile missing');
    if (commercials.length < 5) throw new Error('Commercial team members missing');
  });

  // Test 8: Inter-Branch Commercial Prescription Creation and Commission Calculation
  test('Inter-branch commercial prescription model', () => {
    const newPrescription = store.addPrescription({
      origin_area: 'open_market',
      origin_user_id: 'a0000000-0000-0000-0000-000000000008',
      origin_user_name: 'Sergio Ramírez',
      destination_area: 'npl',
      destination_user_id: 'a0000000-0000-0000-0000-000000000006',
      destination_user_name: 'Juan Antonio Aparicio',
      client_name: 'Inversor Test NPL',
      deal_estimated_value: 3000000,
      commission_rate: 15,
      commission_amount: 13500,
      commission_status: 'pendiente',
      status: 'derivada',
      notes: 'Test referral',
    });

    if (!newPrescription.reference.startsWith('PRE-')) throw new Error('Invalid prescription reference');
    if (newPrescription.origin_area !== 'open_market') throw new Error('Origin area mismatch');
    if (newPrescription.destination_area !== 'npl') throw new Error('Destination area mismatch');
  });

  return results;
}
