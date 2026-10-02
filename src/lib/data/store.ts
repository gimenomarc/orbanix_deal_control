'use client';

import {
  UserProfile,
  Client,
  Owner,
  Portfolio,
  Asset,
  Operation,
  Lead,
  CalendarEvent,
  Activity,
  DocumentItem,
  NotificationItem,
  Objective,
  InvestmentAnalysis,
  PBCRecord,
  Prescription,
  AccountingTransaction,
  Collaborator,
  ImportRecord,
  SystemConnection,
} from '@/types';

import {
  initialProfiles,
  initialSystemConnections,
  initialOwners,
  initialPortfolios,
  initialClients,
  initialAssets,
  initialOperations,
  initialLeads,
  initialCalendarEvents,
  initialInvestmentAnalyses,
  initialPBCRecords,
  initialPrescriptions,
  initialObjectives,
  initialAccounting,
  initialCollaborators,
  initialNotifications,
  initialImports,
  initialActivities,
  initialDocuments,
} from './mockData';

type Listener = () => void;

class DataStore {
  private profiles: UserProfile[] = initialProfiles;
  private systemConnections: SystemConnection[] = initialSystemConnections;
  private owners: Owner[] = initialOwners;
  private portfolios: Portfolio[] = initialPortfolios;
  private clients: Client[] = initialClients;
  private assets: Asset[] = initialAssets;
  private operations: Operation[] = initialOperations;
  private leads: Lead[] = initialLeads;
  private events: CalendarEvent[] = initialCalendarEvents;
  private investmentAnalyses: InvestmentAnalysis[] = initialInvestmentAnalyses;
  private pbcRecords: PBCRecord[] = initialPBCRecords;
  private prescriptions: Prescription[] = initialPrescriptions;
  private objectives: Objective[] = initialObjectives;
  private accounting: AccountingTransaction[] = initialAccounting;
  private collaborators: Collaborator[] = initialCollaborators;
  private notifications: NotificationItem[] = initialNotifications;
  private imports: ImportRecord[] = initialImports;
  private activities: Activity[] = initialActivities;
  private documents: DocumentItem[] = initialDocuments;

  private listeners: Set<Listener> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    if (this.initialized) return;
    try {
      const stored = localStorage.getItem('orbanix_crm_data_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.clients) this.clients = parsed.clients;
        if (parsed.assets) this.assets = parsed.assets;
        if (parsed.operations) this.operations = parsed.operations;
        if (parsed.leads) this.leads = parsed.leads;
        if (parsed.owners) this.owners = parsed.owners;
        if (parsed.portfolios) this.portfolios = parsed.portfolios;
        if (parsed.events) this.events = parsed.events;
        if (parsed.investmentAnalyses) this.investmentAnalyses = parsed.investmentAnalyses;
        if (parsed.pbcRecords) this.pbcRecords = parsed.pbcRecords;
        if (parsed.prescriptions) this.prescriptions = parsed.prescriptions;
        if (parsed.objectives) this.objectives = parsed.objectives;
        if (parsed.accounting) this.accounting = parsed.accounting;
        if (parsed.collaborators) this.collaborators = parsed.collaborators;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (parsed.activities) this.activities = parsed.activities;
        if (parsed.documents) this.documents = parsed.documents;
        if (parsed.imports) this.imports = parsed.imports;
        if (parsed.systemConnections) this.systemConnections = parsed.systemConnections;
      }
      this.initialized = true;
    } catch {
      this.initialized = true;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const state = {
        clients: this.clients,
        assets: this.assets,
        operations: this.operations,
        leads: this.leads,
        owners: this.owners,
        portfolios: this.portfolios,
        events: this.events,
        investmentAnalyses: this.investmentAnalyses,
        pbcRecords: this.pbcRecords,
        prescriptions: this.prescriptions,
        objectives: this.objectives,
        accounting: this.accounting,
        collaborators: this.collaborators,
        notifications: this.notifications,
        activities: this.activities,
        documents: this.documents,
        imports: this.imports,
        systemConnections: this.systemConnections,
      };
      localStorage.setItem('orbanix_crm_data_v1', JSON.stringify(state));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Profiles ---
  getProfiles() {
    return this.profiles;
  }
  getCurrentUser(): UserProfile {
    return this.profiles[0];
  }

  // --- System Connections ---
  getSystemConnections() {
    return this.systemConnections;
  }
  updateSystemConnection(id: string, status: 'Conectado' | 'Pendiente' | 'Sin conexión', description?: string) {
    this.systemConnections = this.systemConnections.map((c) =>
      c.id === id ? { ...c, status, description: description || c.description, last_verified: new Date().toISOString() } : c
    );
    this.saveToStorage();
  }

  // --- Clients ---
  getClients() {
    return this.clients;
  }
  getClientById(id: string) {
    return this.clients.find((c) => c.id === id);
  }
  addClient(client: Omit<Client, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.clients.length + 1;
    const ref = `CLI-${String(nextNum).padStart(6, '0')}`;
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clients = [newClient, ...this.clients];
    this.logActivity({
      entity_type: 'client',
      entity_id: newClient.id,
      entity_reference: newClient.reference,
      activity_type: 'sistema',
      title: 'Cliente creado',
      description: `Alta del cliente ${newClient.legal_name}`,
    });
    this.saveToStorage();
    return newClient;
  }
  updateClient(id: string, updates: Partial<Client>) {
    this.clients = this.clients.map((c) =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    );
    this.saveToStorage();
  }
  deleteClient(id: string) {
    this.clients = this.clients.filter((c) => c.id !== id);
    this.saveToStorage();
  }

  // --- Owners & Portfolios ---
  getOwners() {
    return this.owners;
  }
  getOwnerById(id: string) {
    return this.owners.find((o) => o.id === id);
  }
  addOwner(owner: Omit<Owner, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.owners.length + 1;
    const ref = `OWN-${String(nextNum).padStart(6, '0')}`;
    const newOwner: Owner = {
      ...owner,
      id: `owner-${Date.now()}`,
      reference: ref,
      total_portfolios: 0,
      total_assets: 0,
      total_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.owners = [newOwner, ...this.owners];
    this.saveToStorage();
    return newOwner;
  }
  getPortfolios() {
    return this.portfolios;
  }
  getPortfoliosByOwner(ownerId: string) {
    return this.portfolios.filter((p) => p.owner_id === ownerId);
  }
  addPortfolio(portfolio: Omit<Portfolio, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.portfolios.length + 1;
    const ref = `PORT-${String(nextNum).padStart(6, '0')}`;
    const newPort: Portfolio = {
      ...portfolio,
      id: `port-${Date.now()}`,
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.portfolios = [newPort, ...this.portfolios];
    this.saveToStorage();
    return newPort;
  }

  // --- Assets ---
  getAssets() {
    return this.assets;
  }
  getAssetById(id: string) {
    return this.assets.find((a) => a.id === id);
  }
  getAssetsByBranch(branch: Asset['branch']) {
    return this.assets.filter((a) => a.branch === branch);
  }
  addAsset(asset: Omit<Asset, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.assets.length + 1;
    const ref = `AST-${String(nextNum).padStart(6, '0')}`;
    const newAsset: Asset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.assets = [newAsset, ...this.assets];
    this.logActivity({
      entity_type: 'asset',
      entity_id: newAsset.id,
      entity_reference: newAsset.reference,
      activity_type: 'sistema',
      title: 'Activo incorporado',
      description: `Alta del activo ${newAsset.title} (${newAsset.branch.toUpperCase()})`,
    });
    this.saveToStorage();
    return newAsset;
  }
  updateAsset(id: string, updates: Partial<Asset>) {
    this.assets = this.assets.map((a) =>
      a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    );
    this.saveToStorage();
  }
  deleteAsset(id: string) {
    this.assets = this.assets.filter((a) => a.id !== id);
    this.saveToStorage();
  }

  // --- Operations ---
  getOperations() {
    return this.operations;
  }
  getOperationById(id: string) {
    return this.operations.find((o) => o.id === id);
  }
  getOperationsByAsset(assetId: string) {
    return this.operations.filter((o) => o.asset_id === assetId);
  }
  getOperationsByClient(clientId: string) {
    return this.operations.filter((o) => o.client_id === clientId);
  }
  addOperation(operation: Omit<Operation, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.operations.length + 1;
    const ref = `OP-${String(nextNum).padStart(6, '0')}`;
    const newOp: Operation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.operations = [newOp, ...this.operations];
    this.logActivity({
      entity_type: 'operation',
      entity_id: newOp.id,
      entity_reference: newOp.reference,
      activity_type: 'sistema',
      title: 'Operación iniciada',
      description: `Creada operación ${newOp.title} (${newOp.type})`,
    });
    this.saveToStorage();
    return newOp;
  }
  updateOperation(id: string, updates: Partial<Operation>) {
    this.operations = this.operations.map((o) =>
      o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
    );
    this.saveToStorage();
  }
  deleteOperation(id: string) {
    this.operations = this.operations.filter((o) => o.id !== id);
    this.saveToStorage();
  }

  // --- Leads ---
  getLeads() {
    return this.leads;
  }
  getLeadById(id: string) {
    return this.leads.find((l) => l.id === id);
  }
  addLead(lead: Omit<Lead, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.leads.length + 1;
    const ref = `LEAD-${String(nextNum).padStart(6, '0')}`;
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.leads = [newLead, ...this.leads];
    this.saveToStorage();
    return newLead;
  }
  updateLead(id: string, updates: Partial<Lead>) {
    this.leads = this.leads.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    this.saveToStorage();
  }
  deleteLead(id: string) {
    this.leads = this.leads.filter((l) => l.id !== id);
    this.saveToStorage();
  }

  // --- Events (Agenda) ---
  getEvents() {
    return this.events;
  }
  addEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.events = [newEvent, ...this.events];
    this.saveToStorage();
    return newEvent;
  }
  updateEvent(id: string, updates: Partial<CalendarEvent>) {
    this.events = this.events.map((e) =>
      e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
    );
    this.saveToStorage();
  }
  deleteEvent(id: string) {
    this.events = this.events.filter((e) => e.id !== id);
    this.saveToStorage();
  }

  // --- Investment Analyses ---
  getInvestmentAnalyses() {
    return this.investmentAnalyses;
  }
  getInvestmentAnalysisById(id: string) {
    return this.investmentAnalyses.find((a) => a.id === id);
  }
  getAnalysesByAsset(assetId: string) {
    return this.investmentAnalyses.filter((a) => a.asset_id === assetId);
  }
  addInvestmentAnalysis(analysis: Omit<InvestmentAnalysis, 'id' | 'created_at' | 'updated_at'>) {
    const newAnalysis: InvestmentAnalysis = {
      ...analysis,
      id: `analysis-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.investmentAnalyses = [newAnalysis, ...this.investmentAnalyses];
    this.logActivity({
      entity_type: 'asset',
      entity_id: newAnalysis.asset_id,
      activity_type: 'nota',
      title: 'Nuevo análisis de inversión',
      description: `Creado análisis: ${newAnalysis.title}`,
    });
    this.saveToStorage();
    return newAnalysis;
  }
  updateInvestmentAnalysis(id: string, updates: Partial<InvestmentAnalysis>) {
    this.investmentAnalyses = this.investmentAnalyses.map((a) =>
      a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    );
    this.saveToStorage();
  }
  deleteInvestmentAnalysis(id: string) {
    this.investmentAnalyses = this.investmentAnalyses.filter((a) => a.id !== id);
    this.saveToStorage();
  }

  // --- PBC Records ---
  getPBCRecords() {
    return this.pbcRecords;
  }
  addPBCRecord(record: Omit<PBCRecord, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.pbcRecords.length + 1;
    const ref = `PBC-${String(nextNum).padStart(6, '0')}`;
    const newRecord: PBCRecord = {
      ...record,
      id: `pbc-${Date.now()}`,
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.pbcRecords = [newRecord, ...this.pbcRecords];
    this.saveToStorage();
    return newRecord;
  }
  updatePBCRecord(id: string, updates: Partial<PBCRecord>) {
    this.pbcRecords = this.pbcRecords.map((r) =>
      r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
    );
    this.saveToStorage();
  }

  // --- Prescriptions ---
  getPrescriptions() {
    return this.prescriptions;
  }
  addPrescription(prescription: Omit<Prescription, 'id' | 'reference' | 'created_at' | 'updated_at'>) {
    const nextNum = this.prescriptions.length + 1;
    const ref = `PRE-${String(nextNum).padStart(6, '0')}`;
    const newPres: Prescription = {
      ...prescription,
      id: `pres-${Date.now()}`,
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.prescriptions = [newPres, ...this.prescriptions];
    this.saveToStorage();
    return newPres;
  }
  updatePrescription(id: string, updates: Partial<Prescription>) {
    this.prescriptions = this.prescriptions.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    this.saveToStorage();
  }

  // --- Objectives ---
  getObjectives() {
    return this.objectives;
  }
  addObjective(obj: Omit<Objective, 'id' | 'created_at'>) {
    const newObj: Objective = {
      ...obj,
      id: `obj-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.objectives = [newObj, ...this.objectives];
    this.saveToStorage();
    return newObj;
  }
  updateObjective(id: string, updates: Partial<Objective>) {
    this.objectives = this.objectives.map((o) => (o.id === id ? { ...o, ...updates } : o));
    this.saveToStorage();
  }

  // --- Accounting ---
  getAccounting() {
    return this.accounting;
  }
  addTransaction(trans: Omit<AccountingTransaction, 'id' | 'reference' | 'created_at'>) {
    const nextNum = this.accounting.length + 1;
    const ref = `ACC-${String(nextNum).padStart(6, '0')}`;
    const newTrans: AccountingTransaction = {
      ...trans,
      id: `acc-${Date.now()}`,
      reference: ref,
      created_at: new Date().toISOString(),
    };
    this.accounting = [newTrans, ...this.accounting];
    this.saveToStorage();
    return newTrans;
  }

  // --- Collaborators ---
  getCollaborators() {
    return this.collaborators;
  }
  addCollaborator(collab: Omit<Collaborator, 'id' | 'created_at'>) {
    const newCollab: Collaborator = {
      ...collab,
      id: `collab-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.collaborators = [newCollab, ...this.collaborators];
    this.saveToStorage();
    return newCollab;
  }
  updateCollaborator(id: string, updates: Partial<Collaborator>) {
    this.collaborators = this.collaborators.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.saveToStorage();
  }

  // --- Notifications ---
  getNotifications() {
    return this.notifications;
  }
  getUnreadNotificationsCount() {
    return this.notifications.filter((n) => !n.read_at).length;
  }
  markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    );
    this.saveToStorage();
  }
  markAllNotificationsAsRead() {
    const now = new Date().toISOString();
    this.notifications = this.notifications.map((n) => ({ ...n, read_at: n.read_at || now }));
    this.saveToStorage();
  }

  // --- Documents ---
  getDocuments() {
    return this.documents;
  }
  getDocumentsByEntity(entityType: DocumentItem['entity_type'], entityId: string) {
    return this.documents.filter((d) => d.entity_type === entityType && d.entity_id === entityId);
  }
  addDocument(doc: Omit<DocumentItem, 'id' | 'created_at'>) {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.documents = [newDoc, ...this.documents];
    this.logActivity({
      entity_type: doc.entity_type as Activity['entity_type'],
      entity_id: doc.entity_id,
      activity_type: 'documento',
      title: 'Documento subido',
      description: `Archivo: ${doc.name}`,
    });
    this.saveToStorage();
    return newDoc;
  }
  deleteDocument(id: string) {
    this.documents = this.documents.filter((d) => d.id !== id);
    this.saveToStorage();
  }

  // --- Activities ---
  getActivities() {
    return this.activities;
  }
  getActivitiesByEntity(entityType: Activity['entity_type'], entityId: string) {
    return this.activities.filter((a) => a.entity_type === entityType && a.entity_id === entityId);
  }
  logActivity(activity: Omit<Activity, 'id' | 'created_at'>) {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_name: activity.user_name || this.getCurrentUser().first_name,
      created_at: new Date().toISOString(),
    };
    this.activities = [newActivity, ...this.activities];
    this.saveToStorage();
    return newActivity;
  }

  // --- Imports ---
  getImports() {
    return this.imports;
  }
  addImport(item: Omit<ImportRecord, 'id' | 'created_at'>) {
    const newImport: ImportRecord = {
      ...item,
      id: `imp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.imports = [newImport, ...this.imports];
    this.saveToStorage();
    return newImport;
  }

  // --- Global Search ---
  globalSearch(term: string) {
    const q = term.toLowerCase().trim();
    if (!q) return { clients: [], assets: [], operations: [], leads: [], owners: [] };

    const clients = this.clients.filter(
      (c) =>
        c.legal_name.toLowerCase().includes(q) ||
        c.reference.toLowerCase().includes(q) ||
        c.tax_id.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q))
    );

    const assets = this.assets.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.reference.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        (a.address && a.address.toLowerCase().includes(q))
    );

    const operations = this.operations.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.reference.toLowerCase().includes(q) ||
        (o.client_name && o.client_name.toLowerCase().includes(q))
    );

    const leads = this.leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.reference.toLowerCase().includes(q) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        l.email.toLowerCase().includes(q)
    );

    const owners = this.owners.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.reference.toLowerCase().includes(q) ||
        (o.city && o.city.toLowerCase().includes(q))
    );

    return { clients, assets, operations, leads, owners };
  }
}

export const store = new DataStore();
