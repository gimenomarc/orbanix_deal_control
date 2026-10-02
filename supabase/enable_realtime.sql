-- ============================================================
-- ORBANIX DEAL CONTROL — ENABLE REALTIME BROADCASTING
-- Run this in Supabase SQL Editor to enable sub-50ms live updates:
-- https://supabase.com/dashboard/project/xsxganwihqrefmuikkte/sql/new
-- ============================================================

DO $$
BEGIN
    -- Add tables to supabase_realtime publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE assets;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE clients;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE operations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE leads;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE investment_analyses;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE prescriptions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE objectives;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE accounting_transactions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE collaborators;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE owners;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE portfolios;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
