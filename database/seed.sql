-- Seed data for FinBoard

-- Insert categories
INSERT INTO categories (name, description, color) VALUES
('주식', '국내외 주식 관련 토론', '#4CAF50'),
('암호화폐', '비트코인, 알트코인 등 암호화폐 토론', '#FF9800'),
('경제분석', '경제 동향 및 분석', '#2196F3'),
('트레이딩전략', '투자 전략 및 기법 공유', '#9C27B0'),
('투자일기', '개인 투자 경험 공유', '#F44336'),
('질문토론', '투자 관련 질문과 답변', '#00BCD4');

-- Insert sample tags
INSERT INTO tags (name) VALUES
('#AAPL'), ('#TSLA'), ('#NVDA'), ('#MSFT'), ('#GOOGL'),
('#BTC'), ('#ETH'), ('#BNB'), ('#SOL'), ('#ADA'),
('#투자전략'), ('#주식분석'), ('#기술적분석'), ('#펀더멘털'),
('#포트폴리오'), ('#리스크관리'), ('#장기투자'), ('#단타');

-- Insert sample users (passwords are hashed version of 'password123')
INSERT INTO users (username, email, password_hash, nickname, bio) VALUES
('investor1', 'investor1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.jXrk4H9lJ8Uy', '주린이', '주식 투자 초보입니다'),
('trader2', 'trader2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.jXrk4H9lJ8Uy', '단타마스터', '단기 트레이딩 전문'),
('crypto3', 'crypto3@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.jXrk4H9lJ8Uy', '코인러', '암호화폐 투자자'),
('analyst4', 'analyst4@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.jXrk4H9lJ8Uy', '차트분석가', '기술적 분석 전문'),
('longterm5', 'longterm5@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.jXrk4H9lJ8Uy', '장투자자', '장기 가치투자');

-- Insert sample posts
INSERT INTO posts (title, content, category_id, user_id, view_count, like_count) VALUES
('애플 실적 발표 후 주가 전망', '애플의 Q4 실적이 예상을 상회했습니다. 아이폰 15 판매 호조와 서비스 부문 성장이 주요 요인입니다.', 1, 1, 152, 23),
('비트코인 반감기 영향 분석', '2024년 비트코인 반감기가 다가오면서 역사적 패턴을 분석해봤습니다.', 2, 3, 287, 45),
('연준 금리 인상이 시장에 미치는 영향', '연준의 지속적인 금리 인상이 주식시장과 채권시장에 미치는 영향을 분석합니다.', 3, 4, 421, 67),
('RSI를 활용한 단타 전략', 'RSI 지표를 활용하여 과매도/과매수 구간을 파악하는 방법을 공유합니다.', 4, 2, 198, 31),
('나의 첫 투자 실패와 교훈', '처음 투자를 시작하고 겪은 실패 경험과 그로부터 배운 교훈을 공유합니다.', 5, 5, 156, 28),
('ETF vs 개별주식, 어떤게 나을까요?', '초보자입니다. ETF와 개별주식 투자 중 어떤 것이 더 적합할까요?', 6, 1, 89, 12);

-- Insert sample comments
INSERT INTO comments (content, post_id, user_id, parent_id) VALUES
('좋은 분석 감사합니다!', 1, 2, NULL),
('저도 애플 주식 보유중인데 도움이 되네요', 1, 3, NULL),
('반감기 때마다 항상 상승했던 건 아니에요', 2, 4, NULL),
('하지만 장기적으로는 긍정적인 영향이 있었죠', 2, 5, 3),
('금리 인상 시기에는 가치주가 유리하다고 봅니다', 3, 1, NULL),
('RSI만으로는 부족하고 다른 지표도 함께 봐야해요', 4, 3, NULL);

-- Insert sample likes
INSERT INTO likes (user_id, post_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 4), (3, 6),
(4, 2), (4, 3), (4, 5),
(5, 1), (5, 2), (5, 6);

-- Insert sample bookmarks
INSERT INTO bookmarks (user_id, post_id) VALUES
(1, 3), (1, 4),
(2, 1), (2, 4),
(3, 2), (3, 5),
(4, 3), (4, 6),
(5, 1), (5, 2);

-- Link posts with tags
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), (1, 14),
(2, 6), (2, 17),
(3, 11), (3, 14),
(4, 13), (4, 18),
(5, 15), (5, 16),
(6, 15), (6, 17);