-- 계산 결과 저장 테이블
CREATE TABLE IF NOT EXISTS calculation_results (
  id BIGSERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,

  -- 입력 정보
  total_debt BIGINT NOT NULL,
  monthly_income BIGINT NOT NULL,
  asset_value BIGINT NOT NULL,
  dependents INTEGER NOT NULL,
  home_address TEXT,
  work_address TEXT,
  court_jurisdiction VARCHAR(50),
  priority_repayment_region VARCHAR(50),

  -- 결과값
  reduction_rate DECIMAL(10, 2) NOT NULL,
  reduction_amount BIGINT NOT NULL,
  repayment_amount BIGINT NOT NULL,
  monthly_payment BIGINT NOT NULL,
  repayment_period INTEGER NOT NULL,
  needs_consultation BOOLEAN DEFAULT FALSE,
  liquidation_value_violation BOOLEAN DEFAULT FALSE,
  consultation_reason TEXT,

  -- 자산 상세 정보
  asset_input_mode VARCHAR(20),
  housing_type VARCHAR(20),
  has_mortgage BOOLEAN,
  mortgage_amount BIGINT,
  kb_price BIGINT,
  deposit_amount BIGINT,
  is_spouse_housing BOOLEAN,
  housing_asset BIGINT,
  other_asset BIGINT,

  -- 부양가족 상세 정보
  marital_status VARCHAR(20),
  children_count INTEGER,
  has_no_spouse_income BOOLEAN,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_calculation_results_ip ON calculation_results(ip_address);
CREATE INDEX IF NOT EXISTS idx_calculation_results_created_at ON calculation_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculation_results_reduction_rate ON calculation_results(reduction_rate DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE calculation_results ENABLE ROW LEVEL SECURITY;

-- 익명 사용자도 INSERT 가능하도록 정책 설정
CREATE POLICY "Anyone can insert calculation results"
  ON calculation_results
  FOR INSERT
  WITH CHECK (true);

-- 관리자만 조회 가능하도록 정책 설정 (선택사항)
CREATE POLICY "Only admins can view calculation results"
  ON calculation_results
  FOR SELECT
  USING (auth.role() = 'authenticated');
