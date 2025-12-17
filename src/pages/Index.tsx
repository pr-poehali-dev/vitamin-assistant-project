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
import ProfileNew from '@/components/ProfileNew';
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
  const [userSurveyData, setUserSurveyData] = useState<{userId: number; surveyId: number} | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<Array<{id: number; name: string; price: number; quantity: number; emoji: string}>>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

    // Загружаем данные о новой анкете
    const savedUserData = localStorage.getItem('userSurveyData');
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        setUserSurveyData(userData);
      } catch (e) {
        console.error('Failed to parse user survey data');
      }
    }
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'admin') {
      setCurrentView('admin');
      setIsAdmin(true);
    }
    if (params.get('admin') === 'true') {
      setIsAdmin(true);
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
            onViewProfile={userSurveyData || surveyData ? handleViewProfile : undefined}
            isAdmin={isAdmin}
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
          console.log('✅ Survey step 1 completed:', { userId, surveyId });
          
          if (!userId || !surveyId) {
            console.error('❌ Invalid user or survey ID!');
            alert('Ошибка: не удалось получить данные пользователя');
            return;
          }
          
          const userData = { userId, surveyId };
          console.log('💾 Saving to localStorage:', userData);
          
          // Сохраняем в localStorage для доступа после перезагрузки
          localStorage.setItem('userSurveyData', JSON.stringify(userData));
          
          console.log('🔄 Setting state and redirecting to profile...');
          // Обновляем данные И сразу переходим в профиль
          setUserSurveyData(userData);
          setCurrentView('profile');
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
      
      {currentView === 'profile' && (() => {
        console.log('Profile view render check:', { userSurveyData, surveyData });
        
        if (userSurveyData) {
          return (
            <ProfileNew 
              userId={userSurveyData.userId} 
              surveyId={userSurveyData.surveyId} 
              onBack={handleBackToHome} 
            />
          );
        }
        
        if (surveyData) {
          return <Profile data={surveyData} onBack={handleBackToHome} onCheckout={handleCheckout} />;
        }
        
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка профиля...</p>
            </div>
          </div>
        );
      })()}
      
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