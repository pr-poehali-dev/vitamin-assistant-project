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
        // Преобразуем в числа явно при загрузке из localStorage
        const cleanedUserData = {
          userId: typeof userData.userId === 'number' ? userData.userId : parseInt(String(userData.userId).split(':')[0], 10),
          surveyId: typeof userData.surveyId === 'number' ? userData.surveyId : parseInt(String(userData.surveyId).split(':')[0], 10)
        };
        
        // Проверяем, что после парсинга получились корректные числа
        if (!isNaN(cleanedUserData.userId) && !isNaN(cleanedUserData.surveyId) && 
            cleanedUserData.userId > 0 && cleanedUserData.surveyId > 0) {
          console.log('📦 Loaded from localStorage:', { original: userData, cleaned: cleanedUserData });
          setUserSurveyData(cleanedUserData);
          
          // Пересохраняем в localStorage с очищенными данными
          if (JSON.stringify(userData) !== JSON.stringify(cleanedUserData)) {
            localStorage.setItem('userSurveyData', JSON.stringify(cleanedUserData));
            console.log('🧹 Cleaned localStorage data');
          }
        } else {
          console.error('❌ Invalid data in localStorage, clearing...', cleanedUserData);
          localStorage.removeItem('userSurveyData');
        }
      } catch (e) {
        console.error('Failed to parse user survey data:', e);
        localStorage.removeItem('userSurveyData');
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
          console.log('✅ Survey step 1 completed (raw):', { userId, surveyId, userIdType: typeof userId, surveyIdType: typeof surveyId });
          
          // Преобразуем в числа явно, чтобы избежать "22:1" и подобных артефактов
          const userIdNum = typeof userId === 'number' ? userId : parseInt(String(userId).split(':')[0], 10);
          const surveyIdNum = typeof surveyId === 'number' ? surveyId : parseInt(String(surveyId).split(':')[0], 10);
          
          console.log('✅ Survey step 1 completed (parsed):', { userId: userIdNum, surveyId: surveyIdNum });
          
          if (!userIdNum || !surveyIdNum || isNaN(userIdNum) || isNaN(surveyIdNum)) {
            console.error('❌ Invalid user or survey ID!', { userIdNum, surveyIdNum });
            alert('Ошибка: не удалось получить данные пользователя');
            return;
          }
          
          const userData = { userId: userIdNum, surveyId: surveyIdNum };
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