import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import FAQ from '@/components/FAQ';
import SocialSubscribe from '@/components/SocialSubscribe';
import Footer from '@/components/Footer';
import Survey from '@/components/Survey';
import SurveyPage from '@/pages/SurveyPage';
import Results from '@/components/Results';
import Catalog from '@/components/Catalog';
import Profile from '@/components/Profile';
import Checkout from '@/components/Checkout';
import Admin from '@/components/Admin';
import ProductDetail from '@/components/ProductDetail';

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
  const [currentView, setCurrentView] = useState<'home' | 'survey' | 'survey-new' | 'results' | 'catalog' | 'profile' | 'checkout' | 'admin' | 'productDetail'>('home');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<Array<{id: number; name: string; price: number; quantity: number; emoji: string}>>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

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
    setCurrentView('survey-new');
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

  const handleCheckout = (items?: Array<{id: number; name: string; price: number; quantity: number; emoji: string}>) => {
    if (items) {
      setCheckoutItems(items);
    }
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

  const handleViewProduct = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentView('productDetail');
  };

  const handleCheckoutFromCatalog = (items: Array<{id: number; name: string; price: number; quantity: number; emoji: string}>) => {
    setCheckoutItems(items);
    setCurrentView('checkout');
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
          <HowItWorks onStartSurvey={handleStartSurvey} />
          <Benefits />
          <FAQ />
          <SocialSubscribe />
          <Footer />
        </>
      )}
      
      {currentView === 'survey' && (
        <Survey onComplete={handleSurveyComplete} onBack={handleBackToHome} />
      )}
      
      {currentView === 'survey-new' && (
        <SurveyPage onComplete={(userId, surveyId) => {
          console.log('Survey completed:', { userId, surveyId });
          setCurrentView('results');
        }} />
      )}
      
      {currentView === 'results' && surveyData && (
        <Results data={surveyData} onViewCatalog={handleViewCatalog} onBack={handleBackToHome} />
      )}
      
      {currentView === 'catalog' && (
        <Catalog 
          onBack={handleBackToHome} 
          onProductClick={handleViewProduct}
          onCheckout={handleCheckoutFromCatalog}
        />
      )}

      {currentView === 'productDetail' && selectedProductId && (
        <ProductDetail productId={selectedProductId} onBack={() => setCurrentView('catalog')} />
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