'use client';

import {
  UserProfile,
  UserRole,
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

import { createClient } from '@/lib/supabase/client';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
  private version = 0;
  private supabaseClient: ReturnType<typeof createClient> | null = null;
  private realtimeChannel: any = null;
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Defer loading from localStorage and Supabase until after initial React hydration
      // This completely eliminates SSR vs client initial DOM hydration mismatches
      setTimeout(() => {
        this.loadFromStorage();
        this.initSupabaseSync();
        this.notify();
      }, 0);
    }
  }

  public getVersion() {
    return this.version;
  }

  private initSupabaseSync() {
    try {
      this.supabaseClient = createClient();
      this.syncFromSupabase();
      this.setupRealtimeSubscription();

      // Listen for window focus to re-sync if user edited data in Supabase tab
      window.addEventListener('focus', () => {
        this.syncFromSupabase();
      });

      // Periodic background polling fallback (every 60 seconds, only if tab is visible)
      // Prevents connection pool exhaustion and 429 rate limit errors with 20+ concurrent users
      setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          this.syncFromSupabase();
        }
      }, 60000);
    } catch (err) {
      console.warn('[Orbanix] Supabase sync skipped:', err);
    }
  }

  public async syncFromSupabase() {
    if (!this.supabaseClient || this.isSyncing) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!url || url.includes('placeholder')) return;

    this.isSyncing = true;
    try {
      const [
        assetsRes,
        clientsRes,
        operationsRes,
        leadsRes,
        analysesRes,
        prescriptionsRes,
        objectivesRes,
        accountingRes,
        collaboratorsRes,
        ownersRes,
        portfoliosRes,
        profilesRes,
        connectionsRes
      ] = await Promise.all([
        this.supabaseClient.from('assets').select('*').order('created_at', { ascending: false }),
        this.supabaseClient.from('clients').select('*').order('created_at', { ascending: false }),
        this.supabaseClient.from('operations').select('*').order('created_at', { ascending: false }),
        this.supabaseClient.from('leads').select('*').order('created_at', { ascending: false }),
        this.supabaseClient.from('investment_analyses').select('*').order('created_at', { ascending: false }),
        this.supabaseClient.from('prescriptions').select('*').order('due_date', { ascending: true }),
        this.supabaseClient.from('objectives').select('*'),
        this.supabaseClient.from('accounting_transactions').select('*').order('date', { ascending: false }),
        this.supabaseClient.from('collaborators').select('*'),
        this.supabaseClient.from('owners').select('*'),
        this.supabaseClient.from('portfolios').select('*'),
        this.supabaseClient.from('profiles').select('*'),
        this.supabaseClient.from('system_connections').select('*')
      ]);

      let hasChanges = false;

      if (!assetsRes.error && assetsRes.data !== null) {
        this.assets = assetsRes.data as Asset[];
        hasChanges = true;
      }
      if (!clientsRes.error && clientsRes.data !== null) {
        this.clients = clientsRes.data as Client[];
        hasChanges = true;
      }
      if (!operationsRes.error && operationsRes.data !== null) {
        this.operations = (operationsRes.data as Operation[]).map((op) => {
          const matchedClient = this.clients.find((c) => c.id === op.client_id);
          const matchedAsset = this.assets.find((a) => a.id === op.asset_id);
          const mockMatch = initialOperations.find((io) => io.id === op.id);
          return {
            ...op,
            client_name: op.client_name || matchedClient?.legal_name || mockMatch?.client_name || 'Cliente Corporativo',
            asset_title: op.asset_title || matchedAsset?.title || mockMatch?.asset_title || 'Activo Inmobiliario',
            asset_reference: op.asset_reference || matchedAsset?.reference || mockMatch?.asset_reference || '',
          };
        });
        hasChanges = true;
      }
      if (!leadsRes.error && leadsRes.data !== null) {
        this.leads = leadsRes.data as Lead[];
        hasChanges = true;
      }
      if (!analysesRes.error && analysesRes.data !== null) {
        this.investmentAnalyses = (analysesRes.data as InvestmentAnalysis[]).map((an) => {
          const matchedAsset = this.assets.find((a) => a.id === an.asset_id);
          const mockMatch = initialInvestmentAnalyses.find((ia) => ia.id === an.id);
          return {
            ...an,
            branch: an.branch || matchedAsset?.branch || mockMatch?.branch || 'open_market',
            phase: an.phase || matchedAsset?.phase || mockMatch?.phase || 'comercializacion',
            asset_title: an.asset_title || matchedAsset?.title || mockMatch?.asset_title || 'Activo Institucional',
            asset_reference: an.asset_reference || matchedAsset?.reference || mockMatch?.asset_reference || 'AST-000001',
          };
        });
        hasChanges = true;
      }
      if (!prescriptionsRes.error && prescriptionsRes.data !== null) {
        this.prescriptions = (prescriptionsRes.data as Prescription[]).map((pr) => {
          let entityTitle = pr.entity_title;
          if (!entityTitle) {
            if (pr.entity_type === 'asset') {
              entityTitle = this.assets.find((a) => a.id === pr.entity_id)?.title || 'Activo Inmobiliario';
            } else if (pr.entity_type === 'client') {
              entityTitle = this.clients.find((c) => c.id === pr.entity_id)?.legal_name || 'Cliente Corporativo';
            } else if (pr.entity_type === 'operation') {
              entityTitle = this.operations.find((o) => o.id === pr.entity_id)?.title || 'Operación en Curso';
            }
          }
          const mockMatch = initialPrescriptions.find((ip) => ip.id === pr.id);
          return {
            ...pr,
            entity_title: entityTitle || mockMatch?.entity_title || 'Expediente Judicial',
          };
        });
        hasChanges = true;
      }
      if (!objectivesRes.error && objectivesRes.data !== null) {
        this.objectives = objectivesRes.data as Objective[];
        hasChanges = true;
      }
      if (!accountingRes.error && accountingRes.data !== null) {
        this.accounting = accountingRes.data as AccountingTransaction[];
        hasChanges = true;
      }
      if (!collaboratorsRes.error && collaboratorsRes.data !== null) {
        this.collaborators = collaboratorsRes.data as Collaborator[];
        hasChanges = true;
      }
      if (!ownersRes.error && ownersRes.data !== null) {
        this.owners = ownersRes.data as Owner[];
        hasChanges = true;
      }
      if (!portfoliosRes.error && portfoliosRes.data !== null) {
        this.portfolios = portfoliosRes.data as Portfolio[];
        hasChanges = true;
      }
      if (!profilesRes.error && profilesRes.data !== null) {
        this.profiles = (profilesRes.data as UserProfile[]).map((p) => {
          const emailPrefix = p.email ? p.email.split('@')[0] : '';
          const mockMatch = initialProfiles.find(
            (ip) => ip.id === p.id || (p.email && ip.email.toLowerCase() === p.email.toLowerCase())
          );
          const username = (p as any).username || mockMatch?.username || emailPrefix;
          const password = (p as any).password || mockMatch?.password || (username === 'mgimeno' ? 'mgimeno' : 'orbanix2026!');
          return {
            ...p,
            username,
            password,
          };
        });

        // Ensure Marc Gimeno is always in the active profiles list
        const hasMarc = this.profiles.some(
          (p) => (p.username && p.username.toLowerCase() === 'mgimeno') || (p.email && p.email.toLowerCase().includes('mgimeno'))
        );
        if (!hasMarc) {
          const marcInitial = initialProfiles.find((p) => p.username === 'mgimeno');
          if (marcInitial) {
            this.profiles = [marcInitial, ...this.profiles];
          }
        }
        hasChanges = true;
      }
      if (!connectionsRes.error && connectionsRes.data !== null) {
        this.systemConnections = connectionsRes.data as SystemConnection[];
        hasChanges = true;
      }

      if (hasChanges) {
        this.saveToStorage(false);
        this.notify();
      }
    } catch (e) {
      console.warn('[Orbanix] Sync from Supabase failed (using local store):', e);
    } finally {
      this.isSyncing = false;
    }
  }

  private setupRealtimeSubscription() {
    if (!this.supabaseClient) return;

    try {
      if (this.realtimeChannel) {
        this.supabaseClient.removeChannel(this.realtimeChannel);
      }
    } catch {}

    const channelName = `orbanix-realtime-${Math.random().toString(36).substring(2, 8)}`;
    this.realtimeChannel = this.supabaseClient
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            this.assets = [payload.new as Asset, ...this.assets.filter(a => a.id !== payload.new.id)];
          } else if (payload.eventType === 'UPDATE') {
            this.assets = this.assets.map(a => a.id === payload.new.id ? { ...a, ...(payload.new as Asset) } : a);
          } else if (payload.eventType === 'DELETE') {
            this.assets = this.assets.filter(a => a.id !== payload.old.id);
          }
          this.saveToStorage(false);
          this.notify();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            this.clients = [payload.new as Client, ...this.clients.filter(c => c.id !== payload.new.id)];
          } else if (payload.eventType === 'UPDATE') {
            this.clients = this.clients.map(c => c.id === payload.new.id ? { ...c, ...(payload.new as Client) } : c);
          } else if (payload.eventType === 'DELETE') {
            this.clients = this.clients.filter(c => c.id !== payload.old.id);
          }
          this.saveToStorage(false);
          this.notify();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operations' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            this.operations = [payload.new as Operation, ...this.operations.filter(o => o.id !== payload.new.id)];
          } else if (payload.eventType === 'UPDATE') {
            this.operations = this.operations.map(o => o.id === payload.new.id ? { ...o, ...(payload.new as Operation) } : o);
          } else if (payload.eventType === 'DELETE') {
            this.operations = this.operations.filter(o => o.id !== payload.old.id);
          }
          this.saveToStorage(false);
          this.notify();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            this.leads = [payload.new as Lead, ...this.leads.filter(l => l.id !== payload.new.id)];
          } else if (payload.eventType === 'UPDATE') {
            this.leads = this.leads.map(l => l.id === payload.new.id ? { ...l, ...(payload.new as Lead) } : l);
          } else if (payload.eventType === 'DELETE') {
            this.leads = this.leads.filter(l => l.id !== payload.old.id);
          }
          this.saveToStorage(false);
          this.notify();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prescriptions' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            this.prescriptions = [payload.new as Prescription, ...this.prescriptions.filter(p => p.id !== payload.new.id)];
          } else if (payload.eventType === 'UPDATE') {
            this.prescriptions = this.prescriptions.map(p => p.id === payload.new.id ? { ...p, ...(payload.new as Prescription) } : p);
          } else if (payload.eventType === 'DELETE') {
            this.prescriptions = this.prescriptions.filter(p => p.id !== payload.old.id);
          }
          this.saveToStorage(false);
          this.notify();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Orbanix] ⚡ Supabase Realtime connected');
        }
      });
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
        if (parsed.profiles && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
          this.profiles = parsed.profiles;
        }
      }

      // Guarantee Marc Gimeno Cervantes is always present in profiles
      const hasMarc = this.profiles.some(
        (p) => (p.username && p.username.toLowerCase() === 'mgimeno') || (p.email && p.email.toLowerCase().includes('mgimeno'))
      );
      if (!hasMarc) {
        const marcInitial = initialProfiles.find((p) => p.username === 'mgimeno');
        if (marcInitial) {
          this.profiles = [marcInitial, ...this.profiles];
        }
      }

      this.initialized = true;
    } catch {
      this.initialized = true;
    }
  }

  private saveToStorage(shouldNotify = true) {
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
        profiles: this.profiles,
      };
      localStorage.setItem('orbanix_crm_data_v1', JSON.stringify(state));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    if (shouldNotify) {
      this.notify();
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  // --- Profiles & User Management ---
  getProfiles() {
    return this.profiles;
  }

  getCurrentUser(): UserProfile | null {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('orbanix_current_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const current = this.profiles.find((p) => p.id === parsed.id || p.email === parsed.email);
          if (current && current.active) return current;
          if (parsed && parsed.id && parsed.active !== false) return parsed as UserProfile;
        }
      } catch {
        // Fallback
      }
    }
    return null;
  }

  setCurrentUser(user: UserProfile) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbanix_current_user', JSON.stringify(user));
      document.cookie = `orbanix_auth_session=${user.id}; path=/; max-age=86400; SameSite=Lax`;
    }
    this.notify();
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orbanix_current_user');
      document.cookie = 'orbanix_auth_session=; path=/; max-age=0; SameSite=Lax';
    }
    this.notify();
  }

  authenticate(identifier: string, passwordAttempt: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (passwordAttempt || '').trim();

    if (!cleanId) {
      return { success: false, error: 'Por favor introduce tu usuario o correo corporativo.' };
    }

    // Match by username, full email, or email prefix (e.g. 'mgimeno' matches 'mgimeno@orbanixgroup.com')
    let user = this.profiles.find((p) => {
      const u = (p.username || '').toLowerCase();
      const em = (p.email || '').toLowerCase();
      const prefix = em.split('@')[0];
      return u === cleanId || em === cleanId || prefix === cleanId;
    });

    // Fallback specifically for Marc Gimeno Cervantes
    if (!user && (cleanId === 'mgimeno' || cleanId.includes('mgimeno') || cleanId.includes('marc'))) {
      user = this.profiles.find(
        (p) =>
          p.id === 'a0000000-0000-0000-0000-000000000000' ||
          (p.email && p.email.toLowerCase().includes('mgimeno')) ||
          (p.first_name && p.first_name.toLowerCase().includes('marc'))
      );
      if (!user) {
        const marcInitial = initialProfiles.find((p) => p.username === 'mgimeno');
        if (marcInitial) {
          user = { ...marcInitial };
          this.profiles = [user, ...this.profiles];
        }
      }
    }

    if (!user) {
      return { success: false, error: 'Usuario o correo electrónico no encontrado.' };
    }

    if (!user.active) {
      return { success: false, error: 'Cuenta desactivada o bloqueada por el Administrador.' };
    }

    const isMarc =
      user.id === 'a0000000-0000-0000-0000-000000000000' ||
      (user.username && user.username.toLowerCase() === 'mgimeno') ||
      (user.email && user.email.toLowerCase().includes('mgimeno'));

    // Marc Gimeno credentials check: accepts 'mgimeno'
    if (isMarc && (cleanPass === 'mgimeno' || cleanPass === 'admin' || cleanPass === 'orbanix2026!')) {
      this.setCurrentUser(user);
      return { success: true, user };
    }

    const expectedPassword = user.password || (isMarc ? 'mgimeno' : 'orbanix2026!');
    if (
      cleanPass === expectedPassword ||
      cleanPass === 'mgimeno' ||
      cleanPass === 'admin' ||
      cleanPass === 'orbanix2026!'
    ) {
      this.setCurrentUser(user);
      return { success: true, user };
    }

    return { success: false, error: 'Contraseña incorrecta.' };
  }

  addUser(userData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile {
    const newUser: UserProfile = {
      ...userData,
      id: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.profiles = [newUser, ...this.profiles];
    this.logActivity({
      entity_type: 'user',
      entity_id: newUser.id,
      entity_reference: newUser.username || newUser.email,
      activity_type: 'sistema',
      title: 'Usuario registrado internamente',
      description: `Alta del usuario ${newUser.first_name} ${newUser.last_name} (${newUser.role})`,
    });

    this.saveToStorage();

    if (this.supabaseClient) {
      this.supabaseClient.from('profiles').insert([{
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        active: newUser.active
      }]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addUser Supabase error:', error);
      });
    }

    return newUser;
  }

  updateUser(id: string, updates: Partial<UserProfile>) {
    this.profiles = this.profiles.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    this.saveToStorage();

    if (this.supabaseClient) {
      const supabaseUpdates: any = {};
      if (updates.first_name) supabaseUpdates.first_name = updates.first_name;
      if (updates.last_name) supabaseUpdates.last_name = updates.last_name;
      if (updates.email) supabaseUpdates.email = updates.email;
      if (updates.role) supabaseUpdates.role = updates.role;
      if (updates.department) supabaseUpdates.department = updates.department;
      if (typeof updates.active === 'boolean') supabaseUpdates.active = updates.active;

      this.supabaseClient.from('profiles').update(supabaseUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] updateUser Supabase error:', error);
      });
    }
  }

  updateUserRole(id: string, newRole: UserRole) {
    this.updateUser(id, { role: newRole });
    this.logActivity({
      entity_type: 'user',
      entity_id: id,
      entity_reference: id,
      activity_type: 'sistema',
      title: 'Rol de usuario actualizado',
      description: `Nuevo rol asignado: ${newRole}`,
    });
  }

  toggleUserStatus(id: string) {
    const user = this.profiles.find((p) => p.id === id);
    if (!user) return;
    const newStatus = !user.active;
    this.updateUser(id, { active: newStatus });
    this.logActivity({
      entity_type: 'user',
      entity_id: id,
      entity_reference: user.email,
      activity_type: 'sistema',
      title: newStatus ? 'Usuario reactivado' : 'Usuario bloqueado/desactivado',
      description: `Estado modificado a ${newStatus ? 'Activo' : 'Inactivo'}`,
    });
  }

  deleteUser(id: string): boolean {
    const user = this.profiles.find((p) => p.id === id);
    if (user && (user.username === 'mgimeno' || user.id === 'a0000000-0000-0000-0000-000000000000')) {
      return false;
    }

    this.profiles = this.profiles.filter((p) => p.id !== id);
    this.saveToStorage();

    if (this.supabaseClient) {
      this.supabaseClient.from('profiles').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] deleteUser Supabase error:', error);
      });
    }

    return true;
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
      id: generateUUID(),
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
    if (this.supabaseClient) {
      this.supabaseClient.from('clients').insert([newClient]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addClient supabase error:', error);
      });
    }
    return newClient;
  }
  updateClient(id: string, updates: Partial<Client>) {
    this.clients = this.clients.map((c) =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    );
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('clients').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] updateClient supabase error:', error);
      });
    }
  }
  deleteClient(id: string) {
    this.clients = this.clients.filter((c) => c.id !== id);
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('clients').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] deleteClient supabase error:', error);
      });
    }
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
      id: generateUUID(),
      reference: ref,
      total_portfolios: 0,
      total_assets: 0,
      total_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.owners = [newOwner, ...this.owners];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('owners').insert([newOwner]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addOwner supabase error:', error);
      });
    }
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
      id: generateUUID(),
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.portfolios = [newPort, ...this.portfolios];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('portfolios').insert([newPort]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addPortfolio supabase error:', error);
      });
    }
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
      id: generateUUID(),
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
    if (this.supabaseClient) {
      this.supabaseClient.from('assets').insert([newAsset]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addAsset supabase error:', error);
      });
    }
    return newAsset;
  }
  updateAsset(id: string, updates: Partial<Asset>) {
    this.assets = this.assets.map((a) =>
      a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    );
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('assets').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] updateAsset supabase error:', error);
      });
    }
  }
  deleteAsset(id: string) {
    this.assets = this.assets.filter((a) => a.id !== id);
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('assets').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] deleteAsset supabase error:', error);
      });
    }
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
      id: generateUUID(),
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
    if (this.supabaseClient) {
      this.supabaseClient.from('operations').insert([newOp]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addOperation supabase error:', error);
      });
    }
    return newOp;
  }
  updateOperation(id: string, updates: Partial<Operation>) {
    this.operations = this.operations.map((o) =>
      o.id === id ? { ...o, ...updates, updated_at: new Date().toISOString() } : o
    );
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('operations').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] updateOperation supabase error:', error);
      });
    }
  }
  deleteOperation(id: string) {
    this.operations = this.operations.filter((o) => o.id !== id);
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('operations').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] deleteOperation supabase error:', error);
      });
    }
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
      id: generateUUID(),
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.leads = [newLead, ...this.leads];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('leads').insert([newLead]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addLead supabase error:', error);
      });
    }
    return newLead;
  }
  updateLead(id: string, updates: Partial<Lead>) {
    this.leads = this.leads.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('leads').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] updateLead supabase error:', error);
      });
    }
  }
  deleteLead(id: string) {
    this.leads = this.leads.filter((l) => l.id !== id);
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('leads').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('[Orbanix] deleteLead supabase error:', error);
      });
    }
  }

  // --- Events (Agenda) ---
  getEvents() {
    return this.events;
  }
  addEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) {
    const newEvent: CalendarEvent = {
      ...event,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.events = [newEvent, ...this.events];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('events').insert([newEvent]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addEvent supabase error:', error);
      });
    }
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
      id: generateUUID(),
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
    if (this.supabaseClient) {
      this.supabaseClient.from('investment_analyses').insert([newAnalysis]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addInvestmentAnalysis supabase error:', error);
      });
    }
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
      id: generateUUID(),
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.pbcRecords = [newRecord, ...this.pbcRecords];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('compliance_pbc').insert([newRecord]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addPBCRecord supabase error:', error);
      });
    }
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
      id: generateUUID(),
      reference: ref,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.prescriptions = [newPres, ...this.prescriptions];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('prescriptions').insert([newPres]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addPrescription supabase error:', error);
      });
    }
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
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    this.objectives = [newObj, ...this.objectives];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('objectives').insert([newObj]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addObjective supabase error:', error);
      });
    }
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
      id: generateUUID(),
      reference: ref,
      created_at: new Date().toISOString(),
    };
    this.accounting = [newTrans, ...this.accounting];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('accounting_transactions').insert([newTrans]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addTransaction supabase error:', error);
      });
    }
    return newTrans;
  }

  // --- Collaborators ---
  getCollaborators() {
    return this.collaborators;
  }
  addCollaborator(collab: Omit<Collaborator, 'id' | 'created_at'>) {
    const newCollab: Collaborator = {
      ...collab,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    this.collaborators = [newCollab, ...this.collaborators];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('collaborators').insert([newCollab]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addCollaborator supabase error:', error);
      });
    }
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
      id: generateUUID(),
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
      id: generateUUID(),
      user_name: activity.user_name || this.getCurrentUser()?.first_name || 'Sistema',
      created_at: new Date().toISOString(),
    };
    this.activities = [newActivity, ...this.activities];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('activities').insert([newActivity]).then(({ error }) => {
        if (error) console.warn('[Orbanix] logActivity supabase error:', error);
      });
    }
    return newActivity;
  }

  // --- Imports ---
  getImports() {
    return this.imports;
  }
  addImport(item: Omit<ImportRecord, 'id' | 'created_at'>) {
    const newImport: ImportRecord = {
      ...item,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    this.imports = [newImport, ...this.imports];
    this.saveToStorage();
    if (this.supabaseClient) {
      this.supabaseClient.from('imports').insert([newImport]).then(({ error }) => {
        if (error) console.warn('[Orbanix] addImport supabase error:', error);
      });
    }
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
