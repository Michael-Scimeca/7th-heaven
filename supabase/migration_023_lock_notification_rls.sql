-- ============================================================================
-- Migration 023: Lock down notification tables (security fix)
-- Migration 022 originally shipped with USING (true) policies, which let anyone
-- holding the public anon key read every push subscriber's email/zip and
-- read/modify the email queue and logs. All app access goes through server
-- routes using the service-role key, so restrict policies to service_role.
-- Safe to run on databases where 022 was already applied.
-- ============================================================================

-- push_subscribers
DROP POLICY IF EXISTS "Allow public subscribe to web push" ON public.push_subscribers;
DROP POLICY IF EXISTS "Allow public update own web push subscription" ON public.push_subscribers;
DROP POLICY IF EXISTS "Allow public read push subscriptions" ON public.push_subscribers;
DROP POLICY IF EXISTS "Service role manages push subscriptions" ON public.push_subscribers;
CREATE POLICY "Service role manages push subscriptions"
    ON public.push_subscribers FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- email_quota_logs
DROP POLICY IF EXISTS "Allow service role or admin to manage email quota logs" ON public.email_quota_logs;
CREATE POLICY "Allow service role or admin to manage email quota logs"
    ON public.email_quota_logs FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- email_queue
DROP POLICY IF EXISTS "Allow service role or admin to manage email queue" ON public.email_queue;
CREATE POLICY "Allow service role or admin to manage email queue"
    ON public.email_queue FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- notification_broadcast_logs
DROP POLICY IF EXISTS "Allow service role or admin to manage broadcast logs" ON public.notification_broadcast_logs;
CREATE POLICY "Allow service role or admin to manage broadcast logs"
    ON public.notification_broadcast_logs FOR ALL
    TO service_role
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
