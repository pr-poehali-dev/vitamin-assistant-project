import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import Survey from '@/components/Survey';
import Results from '@/components/Results';
import Catalog from '@/components/Catalog';
import Profile from '@/components/Profile';
import Checkout from '@/components/Checkout';
import Admin from '@/components/Admin';

export type SurveyData = {
  goals: string[];
  diet: string;
  allergies: string[];
  foodCategories: string[];
  activity: string;
  gender: string;
  healthIssues: string[];
  habits: string[];
  workType: string;
};

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'survey' | 'results' | 'catalog' | 'profile' | 'checkout' | 'admin'>('home');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<Array<{id: number; name: string; price: number; quantity: number; emoji: string}>>([]);

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const savedData = localStorage.getItem('vitaminSurveyData');
    if (savedData) {
      try {
        setSurveyData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse saved survey data');
      }
    }
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'admin') {
      setCurrentView('admin');
    }
  }, []);

  const handleStartSurvey = () => {
    setCurrentView('survey');
  };

  const handleSurveyComplete = (data: SurveyData) => {
    setSurveyData(data);
    // Сохранение результатов в localStorage
    localStorage.setItem('vitaminSurveyData', JSON.stringify(data));
    setCurrentView('results');
  };

  const handleViewCatalog = () => {
    setCurrentView('catalog');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
  };

  const handleCheckout = () => {
    const recommendedItems = [
      { id: 1, name: 'Витамин D3', price: 890, quantity: 1, emoji: '☀️' },
      { id: 2, name: 'Омега-3 премиум', price: 1590, quantity: 1, emoji: '🐟' },
      { id: 3, name: 'Магний цитрат', price: 690, quantity: 1, emoji: '🌙' },
      { id: 4, name: 'B-комплекс', price: 790, quantity: 1, emoji: '⚡' }
    ];
    setCheckoutItems(recommendedItems);
    setCurrentView('checkout');
  };

  const handleOrderSuccess = (orderNumber: string) => {
    alert(`Заказ ${orderNumber} успешно оформлен! В реальной версии здесь будет перенаправление на оплату ЮKassa`);
    setCurrentView('home');
  };

  const handleViewAdmin = () => {
    window.history.pushState({}, '', '?view=admin');
    setCurrentView('admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-secondary/20 to-muted/30">
      {currentView === 'home' && (
        <>
          <Hero 
            onStartSurvey={handleStartSurvey} 
            onViewCatalog={handleViewCatalog}
            onViewProfile={surveyData ? handleViewProfile : undefined}
          />
          <Benefits />
        </>
      )}
      
      {currentView === 'survey' && (
        <Survey onComplete={handleSurveyComplete} onBack={handleBackToHome} />
      )}
      
      {currentView === 'results' && surveyData && (
        <Results data={surveyData} onViewCatalog={handleViewCatalog} onBack={handleBackToHome} />
      )}
      
      {currentView === 'catalog' && (
        <Catalog onBack={handleBackToHome} />
      )}
      
      {currentView === 'profile' && surveyData && (
        <Profile data={surveyData} onBack={handleBackToHome} onCheckout={handleCheckout} />
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          items={checkoutItems} 
          surveyData={surveyData || undefined}
          onBack={handleBackToHome}
          onSuccess={handleOrderSuccess}
        />
      )}
      
      {currentView === 'admin' && (
        <Admin onBack={handleBackToHome} />
      )}
    </div>
  );
};

export default Index;