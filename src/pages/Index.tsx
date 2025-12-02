import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import Survey from '@/components/Survey';
import Results from '@/components/Results';
import Catalog from '@/components/Catalog';
import Profile from '@/components/Profile';

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
  const [currentView, setCurrentView] = useState<'home' | 'survey' | 'results' | 'catalog' | 'profile'>('home');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);

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
    alert('Переход к оформлению заказа! В следующей версии здесь будет интеграция с платёжной системой.');
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
    </div>
  );
};

export default Index;