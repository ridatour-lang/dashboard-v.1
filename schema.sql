-- ============================================================
-- Portal RiDATOUR — Supabase PostgreSQL Schema
-- KianGroup Simpul Back-Office Database
-- v2.0 — Refactor: Umroh/Tour Products + Paper.id + Bookings
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TABEL 1: tb_products — Katalog Produk Perjalanan RiDATOUR
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_products (
    product_sku         VARCHAR PRIMARY KEY,
    category            VARCHAR NOT NULL
                        CHECK (category IN ('umroh', 'umroh-mandiri', 'muslim-tour', 'fit-products', 'wisata-populer', 'tour-reguler')),
    badge_label         VARCHAR,
    title               VARCHAR NOT NULL,
    subtitle            VARCHAR,
    departure_date      DATE,
    airline             VARCHAR,
    hotel_makkah        VARCHAR,
    hotel_madinah       VARCHAR,
    duration_days       INTEGER NOT NULL CHECK (duration_days > 0),
    feature_tags        TEXT[],
    normal_price        NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    publish_price       NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    price_label         VARCHAR NOT NULL DEFAULT 'Jt/pax',
    cta_text            VARCHAR NOT NULL DEFAULT 'Detail Paket',
    whatsapp_text       TEXT,
    image_filename      VARCHAR,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category  ON tb_products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON tb_products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_departure ON tb_products(departure_date);

-- ─────────────────────────────────────────────────────────────
-- TABEL 2: tb_users — Direktori Pengguna Portal (RBAC)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid    UUID UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    full_name       VARCHAR(255),
    avatar_url      TEXT,
    phone           VARCHAR(20),                        -- Nomor WA staf (diisi saat pendaftaran)
    role            VARCHAR(50) NOT NULL DEFAULT 'support'
                    CHECK (role IN ('super_admin', 'operations', 'finance', 'support', 'sales', 'admin_cabang')),
    provider        VARCHAR(50) NOT NULL DEFAULT 'google',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email        ON tb_users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON tb_users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_users_role         ON tb_users(role);

-- ─────────────────────────────────────────────────────────────
-- TABEL 3: tb_audit_logs — Log Aktivitas Keamanan
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES tb_users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   VARCHAR(255),
    metadata    JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id   ON tb_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action    ON tb_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON tb_audit_logs(created_at);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-update updated_at
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tb_products_modtime
    BEFORE UPDATE ON tb_products
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tb_users_modtime
    BEFORE UPDATE ON tb_users
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: Update last_login_at saja untuk user yang sudah terdaftar
-- (Akun baru TIDAK auto-dibuat di sini — dibuat lewat completeRegistration() di frontend
--  agar bisa melewati flow approval: isi nama + WA → tunggu aktivasi super_admin)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_sso_login()
RETURNS TRIGGER AS $$
BEGIN
    -- Hanya update last_login_at jika user sudah ada di tb_users
    UPDATE public.tb_users
       SET last_login_at = NOW(),
           avatar_url    = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url)
     WHERE supabase_uid = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_login
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_sso_login();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE tb_products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_audit_logs  ENABLE ROW LEVEL SECURITY;

-- Produk: semua user autentikasi bisa baca
CREATE POLICY "auth_read_products" ON tb_products
    FOR SELECT TO authenticated USING (true);

-- Produk: hanya super_admin & operations yang bisa write
CREATE POLICY "ops_write_products" ON tb_products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u
            WHERE u.supabase_uid = auth.uid()
            AND u.role IN ('super_admin', 'operations')
            AND u.is_active = TRUE
        )
    );

-- Users: hanya bisa baca data diri sendiri
CREATE POLICY "self_read_user" ON tb_users
    FOR SELECT TO authenticated
    USING (supabase_uid = auth.uid());

-- Users: user bisa INSERT data diri sendiri (untuk completeRegistration)
CREATE POLICY "self_insert_user" ON tb_users
    FOR INSERT TO authenticated
    WITH CHECK (supabase_uid = auth.uid());

-- Users: super_admin bisa baca semua user
CREATE POLICY "admin_read_all_users" ON tb_users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u2
            WHERE u2.supabase_uid = auth.uid()
            AND u2.role = 'super_admin'
            AND u2.is_active = TRUE
        )
    );

-- Users: super_admin bisa update role & is_active user lain
CREATE POLICY "admin_update_users" ON tb_users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u2
            WHERE u2.supabase_uid = auth.uid()
            AND u2.role = 'super_admin'
            AND u2.is_active = TRUE
        )
    );

-- Audit logs: hanya super_admin yang bisa baca
CREATE POLICY "admin_read_audit_logs" ON tb_audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u
            WHERE u.supabase_uid = auth.uid()
            AND u.role = 'super_admin'
            AND u.is_active = TRUE
        )
    );

-- ─────────────────────────────────────────────────────────────
-- SEED DATA: Produk Perjalanan RiDATOUR (sesuai Landing Page)
-- ─────────────────────────────────────────────────────────────
INSERT INTO tb_products (
    product_sku, category, badge_label, title, subtitle,
    departure_date, airline, hotel_makkah, hotel_madinah,
    duration_days, feature_tags,
    normal_price, publish_price, price_label,
    cta_text, whatsapp_text, image_filename, is_active
)
VALUES
    -- ── Umroh ──────────────────────────────────────────────────
    (
        'UMR-REG-PLUS-12D-SEP26', 'umroh', 'Terpopuler',
        '12D Umroh Reguler Plus', 'Hotel Pelataran & Kereta Cepat',
        '2026-09-10', 'Qatar Airways', 'Al Sofwah Tower 1', 'Ruve Al Madinah',
        12, ARRAY['Free Fast Train', 'Hotel Pelataran'],
        49700000.00, 46700000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket 12D Umroh Reguler Plus tanggal 10 Sep 2026.',
        'umroh_card.png', TRUE
    ),
    (
        'UMR-PREM-HEMAT-9D-OKT26', 'umroh', 'Best Deal',
        '9D Umroh Premium Hemat', 'Direct Landing Jeddah',
        '2026-10-12', 'Saudia Airlines', 'Grand Al Masa', 'Kayan International',
        9, ARRAY['Direct Landing', 'Premium Hemat'],
        35600000.00, 31680000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket 9D Umroh Premium Hemat tanggal 12 Okt 2026.',
        'umroh_card.png', TRUE
    ),
    (
        'UMR-REG-9D-NOV26', 'umroh', 'Fast Train',
        '9D Umroh Reguler', 'Free Fast Train',
        '2026-11-07', 'Qatar / Oman Air', 'Maysan Al Maqam', 'Kayan International',
        9, ARRAY['Free Fast Train', 'Nyaman'],
        37600000.00, 35500000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket 9D Umroh Reguler tanggal 7 Nov 2026.',
        'umroh_card.png', TRUE
    ),
    (
        'UMR-PREM-9D-DES26', 'umroh', 'Premium',
        '9D Umroh Premium', 'Hotel Bintang 5 Dekat Masjidil Haram',
        '2026-12-05', 'Qatar / Oman Air', 'Al Sofwah Tower 1', 'Al Ritz Al Madinah',
        9, ARRAY['Bintang 5', 'Free Fast Train'],
        39500000.00, 35500000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket 9D Umroh Premium tanggal 5 Des 2026.',
        'umroh_card.png', TRUE
    ),
    -- ── Umroh Mandiri ──────────────────────────────────────────
    (
        'UMR-MANDIRI-CUSTOM', 'umroh-mandiri', 'Custom',
        'Paket Umroh Mandiri Custom', 'Ibadah Sesuai Rencana Anda Sendiri',
        NULL, 'Pilihan Maskapai Bebas', 'Sesuai Request', NULL,
        1, ARRAY['Bebas Atur Jadwal', 'Sesuai Budget'],
        18500000.00, 18500000.00, 'Jt/pax',
        'Konsultasi LA',
        'Halo RiDATOUR, saya tertarik untuk berkonsultasi mengenai Paket Umroh Mandiri Custom.',
        'umroh_card.png', TRUE
    ),
    -- ── Muslim Tour ────────────────────────────────────────────
    (
        'TOUR-TURKIYE-10D-OKT26', 'muslim-tour', 'Favorit',
        '10D Jelajah Turkiye Halal Tour', 'Istanbul, Cappadocia & Pamukkale',
        '2026-10-15', 'Turkish Airlines', NULL, NULL,
        10, ARRAY['Bintang 4/5', 'Cappadocia Cave Hotel'],
        26500000.00, 24800000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket 10D Jelajah Turkiye Halal Tour tanggal 15 Okt 2026.',
        'turkiye_card.png', TRUE
    ),
    -- ── FIT Products ───────────────────────────────────────────
    (
        'FIT-TOKYO-KYOTO-PRIVATE', 'fit-products', 'Private Tour',
        'FIT Private Tour Tokyo & Kyoto', 'Jepang Ramah Muslim & Fleksibel',
        NULL, 'ANA / Japan Airlines', NULL, NULL,
        1, ARRAY['Private Guide', 'Bebas Request Rute'],
        32000000.00, 29500000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket FIT Private Tour Tokyo & Kyoto.',
        'turkiye_card.png', TRUE
    ),
    -- ── Wisata Populer ─────────────────────────────────────────
    (
        'TOUR-SWISS-PARIS-7D-NOV26', 'wisata-populer', 'Best Seller',
        '7D Scenic Switzerland & Paris', 'Gunung Titlis & Keindahan Kota Eiffel',
        '2026-11-20', 'Singapore Airlines', NULL, NULL,
        7, ARRAY['Swiss Alps', 'Eiffel Sunset'],
        41500000.00, 38900000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket 7D Scenic Switzerland & Paris tanggal 20 Nov 2026.',
        'europe_card.png', TRUE
    ),
    -- ── Tour Reguler ───────────────────────────────────────────
    (
        'TOUR-WEUROPE-9D-DES26', 'tour-reguler', 'Group Tour',
        '9D Amazing West Europe', 'Prancis, Belgia, Belanda & Jerman',
        '2026-12-12', 'Emirates', NULL, NULL,
        9, ARRAY['Eropa Barat', 'Amsterdam Cruise'],
        34900000.00, 32500000.00, 'Jt/pax',
        'Detail Paket',
        'Halo RiDATOUR, saya tertarik dengan paket 9D Amazing West Europe tanggal 12 Des 2026.',
        'europe_card.png', TRUE
    )
ON CONFLICT (product_sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- TABEL 4: tb_invoices_b2b — Invoicing Paper.id untuk Mitra B2B
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_invoices_b2b (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inv_id       VARCHAR UNIQUE NOT NULL,              -- ID dari Paper.id (e.g. INV-PAPER-2026042)
    client       VARCHAR(255) NOT NULL,                -- Nama mitra/perusahaan B2B
    pic          VARCHAR(255),                         -- Person in charge dari mitra
    issued_date  DATE NOT NULL,                        -- Tanggal invoice diterbitkan
    due_date     DATE NOT NULL,                        -- Tanggal jatuh tempo
    amount       NUMERIC(14, 2) NOT NULL DEFAULT 0,   -- Nilai invoice (IDR)
    status       VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
                 CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE')),
    notes        TEXT,
    paper_id_url TEXT,                                 -- URL langsung ke invoice di Paper.id
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_status    ON tb_invoices_b2b(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date  ON tb_invoices_b2b(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_client    ON tb_invoices_b2b(client);

CREATE TRIGGER update_tb_invoices_modtime
    BEFORE UPDATE ON tb_invoices_b2b
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS
ALTER TABLE tb_invoices_b2b ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_read_invoices" ON tb_invoices_b2b
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u
            WHERE u.supabase_uid = auth.uid()
            AND u.role IN ('super_admin', 'finance')
            AND u.is_active = TRUE
        )
    );

CREATE POLICY "ops_write_invoices" ON tb_invoices_b2b
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u
            WHERE u.supabase_uid = auth.uid()
            AND u.role IN ('super_admin', 'finance')
            AND u.is_active = TRUE
        )
    );


-- ─────────────────────────────────────────────────────────────
-- TABEL 5: tb_bookings — Inquiry & Pemesanan dari Landing Page
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tb_bookings (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id     VARCHAR UNIQUE NOT NULL,             -- ID urut (e.g. BK-2026-0041)
    name           VARCHAR(255) NOT NULL,               -- Nama pemesan
    email          VARCHAR(255) NOT NULL,               -- Email pemesan
    phone          VARCHAR(50),                         -- Nomor HP
    product_sku    VARCHAR REFERENCES tb_products(product_sku) ON DELETE SET NULL,
    product_name   VARCHAR(255),                        -- Snapshot nama paket saat inquiry
    category       VARCHAR(50),                         -- Snapshot kategori paket
    departure_date DATE,                                -- Tanggal keberangkatan yang diminati
    pax            INTEGER NOT NULL DEFAULT 1 CHECK (pax > 0), -- Jumlah jamaah/penumpang
    total_price    NUMERIC(14, 2),                      -- Estimasi total harga
    status         VARCHAR(20) NOT NULL DEFAULT 'NEW'
                   CHECK (status IN ('NEW', 'CONTACTED', 'BOOKED', 'CANCELLED')),
    notes          TEXT,                                -- Catatan follow-up dari staf
    source         VARCHAR(50) DEFAULT 'landing_page', -- Sumber inquiry
    inquiry_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status   ON tb_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email    ON tb_bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_product  ON tb_bookings(product_sku);
CREATE INDEX IF NOT EXISTS idx_bookings_date     ON tb_bookings(inquiry_date);

CREATE TRIGGER update_tb_bookings_modtime
    BEFORE UPDATE ON tb_bookings
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- RLS
ALTER TABLE tb_bookings ENABLE ROW LEVEL SECURITY;

-- Semua staf operasional bisa baca
CREATE POLICY "ops_read_bookings" ON tb_bookings
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u
            WHERE u.supabase_uid = auth.uid()
            AND u.role IN ('super_admin', 'operations', 'support', 'sales', 'admin_cabang')
            AND u.is_active = TRUE
        )
    );

-- super_admin, operations, sales, & admin_cabang bisa write (update status, notes)
CREATE POLICY "ops_write_bookings" ON tb_bookings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tb_users u
            WHERE u.supabase_uid = auth.uid()
            AND u.role IN ('super_admin', 'operations', 'sales', 'admin_cabang')
            AND u.is_active = TRUE
        )
    );
