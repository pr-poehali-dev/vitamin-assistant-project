import funcUrls from '../../backend/func2url.json';

export const API_URLS = {
  survey: funcUrls.survey,
  products: funcUrls.products,
  orders: funcUrls.orders,
  syncCatalog: funcUrls['sync-catalog'],
  pageBuilder: funcUrls['page-builder']
};

export const getSurveyUrl = (action: 'questions' | 'register' | 'submit' | 'user') => {
  return `${API_URLS.survey}?action=${action}`;
};
