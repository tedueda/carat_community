import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NewsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // newsカテゴリページにリダイレクト
    navigate('/category/news', { replace: true });
  }, [navigate]);

  return null;
};

export default NewsPage;
